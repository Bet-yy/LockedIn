# LockedIn — Implementation Plan

## Context

LockedIn is a greenfield student productivity web app for UTD students. The goal is to combine course discovery (via the UTD Nebula API), AI-powered syllabus parsing and study planning (via Google Gemini), and productivity tools (Pomodoro timer, To-Do list) into a single interface.

---

## Architecture Decisions

| Decision | Choice | Reason |
|---|---|---|
| Database | **Supabase** | PostgreSQL fits relational course/task data; built-in auth; free tier; REST + JS/Python clients |
| Frontend build | **Vite + React + TypeScript** | Faster than CRA, better DX for hackathon pace |
| State management | **Zustand** | Simpler than Redux for this scope |
| Styling | **Tailwind CSS** | Rapid prototyping, no custom CSS boilerplate |
| PDF text extraction | **pypdf** with **Gemini multimodal fallback** | pypdf for clean PDFs; Gemini 1.5 Pro natively reads PDFs as a fallback |

---

## Project Structure

```
LockedIn/
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios wrappers per resource
│   │   ├── components/
│   │   │   ├── CourseSearch/   (SearchBar, SearchResults)
│   │   │   ├── Syllabus/       (SyllabusViewer, ParsedSyllabusCard)
│   │   │   ├── StudyPlan/      (StudyPlanGenerator, WeeklyPlanCard)
│   │   │   ├── Tasks/          (TaskList, TaskItem, TaskForm)
│   │   │   ├── Timer/          (PomodoroTimer, TimerControls)
│   │   │   ├── Resources/      (ResourceCard, ResourceList)
│   │   │   └── shared/         (LoadingSpinner, ErrorBanner, Modal)
│   │   ├── hooks/          # useInterval, useDebounce
│   │   ├── pages/          (HomePage, CoursePage, TasksPage, TimerPage)
│   │   ├── store/          (courseStore, taskStore, timerStore)
│   │   └── types/          # TypeScript interfaces
│   ├── .env.local
│   └── package.json (Vite + React + TS template)
│
├── backend/
│   ├── app/
│   │   ├── routers/        (courses.py, syllabus.py, study_plan.py, tasks.py, resources.py)
│   │   ├── services/       (nebula.py, gemini.py, supabase_client.py)
│   │   ├── models/         (course.py, task.py, study_plan.py — Pydantic)
│   │   ├── core/           (config.py, dependencies.py)
│   │   └── main.py
│   ├── .env
│   └── requirements.txt
└── README.md
```

---

## Environment Variables

### `/backend/.env`
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
GEMINI_API_KEY=
NEBULA_API_BASE=https://api.utdnebula.com/v1
NEBULA_API_KEY=
CORS_ORIGINS=http://localhost:5173
```

### `/frontend/.env.local`
```
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Database Schema (Supabase)

Run this SQL in the Supabase SQL editor to set up all tables:

```sql
-- Saved courses
CREATE TABLE saved_courses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID,                          -- NULL for guest mode
  nebula_course_id TEXT NOT NULL,
  course_name      TEXT NOT NULL,
  course_number    TEXT NOT NULL,
  professor        TEXT,
  semester         TEXT,
  syllabus_raw     TEXT,
  syllabus_parsed  JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Study plans
CREATE TABLE study_plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID REFERENCES saved_courses(id) ON DELETE CASCADE,
  plan_content JSONB NOT NULL,   -- [{week, topic, daily_tasks, estimated_hours}]
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,
  course_id   UUID REFERENCES saved_courses(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT,
  due_date    DATE,
  completed   BOOLEAN DEFAULT FALSE,
  priority    TEXT CHECK (priority IN ('low', 'medium', 'high')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Resource recommendations
CREATE TABLE resource_recommendations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     UUID REFERENCES saved_courses(id) ON DELETE CASCADE,
  resource_type TEXT CHECK (resource_type IN ('video', 'article', 'practice')),
  title         TEXT NOT NULL,
  url           TEXT,
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Implementation Order

### Phase 1 — Backend Scaffolding
- `backend/app/main.py` — FastAPI app, CORS middleware, router registration
- `backend/app/core/config.py` — pydantic-settings loading all env vars
- `backend/requirements.txt`:
  ```
  fastapi
  uvicorn[standard]
  httpx
  google-generativeai
  supabase
  pypdf
  pydantic-settings
  python-dotenv
  ```

### Phase 2 — Nebula API Integration (`backend/app/services/nebula.py`)
- `search_courses(query, semester)` → calls Nebula `GET /courses`
- `get_course_by_id(course_id)` → single course detail
- `get_syllabus_url(course_id)` → extract syllabus PDF link

**Routes (`backend/app/routers/courses.py`):**
```
GET  /api/courses/search?q=&semester=   -> search results
GET  /api/courses/{course_id}           -> course detail
POST /api/courses/save                  -> persist to Supabase
GET  /api/courses/saved                 -> list saved courses
```

### Phase 3 — Gemini AI Integration (`backend/app/services/gemini.py`)
- `parse_syllabus(raw_text)` → structured JSON: `{topics_by_week, exam_dates, assignments}`
- `generate_study_plan(parsed_syllabus, weeks_available)` → `[{week, topic, daily_tasks, estimated_hours}]`
- `generate_resources(topic, course_name)` → `[{type, title, url, description}]`

**Key:** Use `response_mime_type: "application/json"` in Gemini calls. Wrap in try/except with raw text fallback.

**Syllabus fetch strategy:**
1. Get PDF URL from Nebula
2. Fetch PDF bytes, extract text via `pypdf`
3. If that fails → send raw PDF bytes to Gemini multimodal
4. If no URL → expose manual text paste endpoint

**Routes:**
```
POST /api/syllabus/parse          body: {course_id, raw_text?}
GET  /api/syllabus/{course_id}
POST /api/study-plan/generate     body: {course_id, weeks_available}
GET  /api/study-plan/{course_id}
POST /api/resources/generate      body: {course_id, topic?}
GET  /api/resources/{course_id}
```

### Phase 4 — Tasks CRUD (`backend/app/routers/tasks.py`)
```
GET    /api/tasks                    -> list (optional ?course_id= filter)
POST   /api/tasks                    -> create
PATCH  /api/tasks/{task_id}          -> update
DELETE /api/tasks/{task_id}          -> delete
```

### Phase 5 — Frontend Scaffolding
- Scaffold with: `npm create vite@latest frontend -- --template react-ts`
- Install: `tailwindcss`, `zustand`, `axios`, `react-router-dom`
- Configure Tailwind, set up routing in `App.tsx`
- Build shared `Navbar.tsx`

**Routes:**
```
/          -> HomePage     (course search)
/course/:id -> CoursePage  (syllabus + study plan + resources tabs)
/tasks      -> TasksPage   (to-do list)
/timer      -> TimerPage   (Pomodoro)
```

### Phase 6 — Course Search UI
- `SearchBar.tsx` — debounced input (300ms) → `GET /api/courses/search`
- `SearchResults.tsx` — click navigates to `/course/:id` and triggers save
- Zustand `courseStore`: `searchResults`, `selectedCourse`, `savedCourses`

### Phase 7 — CoursePage (tabbed)
Three tabs:
1. **Syllabus** — displays parsed syllabus; "Parse Syllabus" button → `POST /api/syllabus/parse`; lazy-loads from storage on revisit
2. **Study Plan** — "Generate Study Plan" → `POST /api/study-plan/generate`; renders `WeeklyPlanCard` per week; loads from storage on revisit
3. **Resources** — "Find Resources" → `POST /api/resources/generate`; renders `ResourceCard` list; loads from storage on revisit

### Phase 8 — Pomodoro Timer (fully client-side)
`PomodoroTimer.tsx` — no backend needed.

Zustand `timerStore`:
```typescript
{
  mode: 'work' | 'short_break' | 'long_break'
  secondsLeft: number
  isRunning: boolean
  sessionsCompleted: number
  workDuration: number       // default 25 min
  shortBreak: number         // default 5 min
  longBreak: number          // default 15 min
}
```
- `useInterval` hook fires every 1s when running
- 4 work sessions → long break; otherwise → short break
- Browser Notification API on session end
- Configurable durations, persisted to localStorage

### Phase 9 — To-Do List
- `TasksPage.tsx` — fetches all tasks on mount
- `TaskItem.tsx` — checkbox (toggle complete), edit button (opens modal), delete button
- `TaskForm.tsx` — shared create/edit form: title, description, due_date, priority, course (optional)
- Filter bar: All / By Course / Completed / Due Today

---

## Remaining Phases — Execution Plan

### Current Status

- Phase 1 — Backend scaffolding: complete
- Phase 2 — Nebula API integration: complete
- Phase 3 — Gemini AI integration: complete
- Phase 4 — Tasks CRUD: complete
- Phase 5 — Frontend scaffolding: complete

The remaining work is now concentrated in the frontend. The API layer, guest-mode request handling, page routes, and baseline Zustand stores already exist, so the best next step is to implement the user flows in file-sized chunks.

### Recommended Build Order

1. Phase 6 — Course Search UI
2. Phase 7 — Course workspace tabs
3. Phase 9 — To-do list
4. Phase 8 — Pomodoro timer

This order keeps the course flow contiguous, lets the tasks page reuse saved-course data, and leaves the isolated timer work for last.

### Phase 6 — Course Search UI

**Goal:** Make `frontend/src/pages/HomePage.tsx` the functional entry point for searching, saving, and selecting courses.

**Files to add**
- `frontend/src/components/CourseSearch/SearchBar.tsx`
- `frontend/src/components/CourseSearch/SearchResults.tsx`
- `frontend/src/components/CourseSearch/SearchResultCard.tsx`

**Files to update**
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/store/courseStore.ts`
- `frontend/src/types/course.ts` if the result and saved-course UI need narrower render types

**Tasks**
- Wire `useDebounce` into the search field so `searchCourses()` fires after 300ms of inactivity.
- Extend `courseStore` with `isSearching`, `searchError`, and `lastQuery`.
- Guard against empty searches and stale async responses.
- Render explicit loading, empty, and error states in the search panel.
- On result click, call `saveCourse(course)`, update the store with `upsertSavedCourse`, then navigate to `/course/:id`.
- Load `getSavedCourses()` on mount so recent or saved courses can be shown before a new search.

**Done when**
- Search results appear reliably after debounced typing.
- Clicking a result saves the course and routes into the course workspace.
- Returning to the home page still shows saved course context.

### Phase 7 — CoursePage (tabbed workspace)

**Goal:** Replace the placeholder course route with a real three-tab workflow for syllabus parsing, study-plan generation, and resources.

**Files to add**
- `frontend/src/components/Syllabus/SyllabusPanel.tsx`
- `frontend/src/components/Syllabus/ParsedSyllabusCard.tsx`
- `frontend/src/components/StudyPlan/StudyPlanPanel.tsx`
- `frontend/src/components/StudyPlan/WeeklyPlanCard.tsx`
- `frontend/src/components/Resources/ResourcesPanel.tsx`
- `frontend/src/components/Resources/ResourceCard.tsx`

**Files to update**
- `frontend/src/pages/CoursePage.tsx`
- `frontend/src/store/courseStore.ts`
- `frontend/src/types/studyPlan.ts`

**Store additions**
- `selectedSavedCourse`
- `syllabusByCourseId`
- `studyPlanByCourseId`
- `resourcesByCourseId`
- tab-specific loading and error state keyed by course ID

**Tasks**
- Resolve the active course from the route param plus `savedCourses`; if store state is empty after refresh, fetch saved courses first.
- Keep the active tab in local page state.
- On first tab load, try the read endpoints before offering generation:
  - `getSyllabus(courseId)`
  - `getStudyPlan(courseId)`
  - `getResources(courseId)`
- Syllabus tab:
  - Render parsed syllabus data into readable sections like topics, exams, grading, and description.
  - Add manual raw-text fallback only when automatic parsing cannot succeed.
- Study Plan tab:
  - Add a `weeksAvailable` control with default `15`.
  - Render one `WeeklyPlanCard` per week.
- Resources tab:
  - Allow optional topic override before generation.
  - Show resource type badges and outbound links.

**Done when**
- Refreshing `/course/:id` can rehydrate the selected course and any previously generated content.
- Each tab can load, generate, retry, and render independently.
- Stored content is reused on revisit instead of being regenerated automatically.

### Phase 8 — Pomodoro Timer

**Goal:** Turn the timer scaffold into a complete client-side Pomodoro flow with persistence and notifications.

**Files to add**
- `frontend/src/components/Timer/PomodoroTimer.tsx`
- `frontend/src/components/Timer/TimerControls.tsx`
- `frontend/src/components/Timer/TimerSettings.tsx`

**Files to update**
- `frontend/src/pages/TimerPage.tsx`
- `frontend/src/store/timerStore.ts`
- `frontend/src/hooks/useInterval.ts` if a small API adjustment is needed

**Store additions**
- `setDurations`
- `setSessionsCompleted`
- `tick`
- `reset`
- `skipToNextMode`
- localStorage hydrate and persist helpers

**Tasks**
- Persist `mode`, `secondsLeft`, `sessionsCompleted`, and duration settings in localStorage.
- Use `useInterval` to decrement once per second while the timer is running.
- Implement mode rollover:
  - `work -> short_break` for normal cycles
  - `work -> long_break` every fourth completed work session
- Reset `secondsLeft` whenever the mode changes.
- Add start, pause, reset, and skip controls.
- Validate configurable durations so zero or negative values are impossible.
- Request browser notification permission lazily and notify on session completion.

**Done when**
- Refreshing the page preserves timer settings and current progress.
- Session rollover follows the expected 4-session Pomodoro cycle.
- Reset always restores the correct duration for the active mode.

### Phase 9 — To-Do List

**Goal:** Build the complete tasks workflow on top of the existing task API wrappers and store.

**Files to add**
- `frontend/src/components/Tasks/TaskList.tsx`
- `frontend/src/components/Tasks/TaskItem.tsx`
- `frontend/src/components/Tasks/TaskForm.tsx`
- `frontend/src/components/Tasks/TaskFilters.tsx`

**Files to update**
- `frontend/src/pages/TasksPage.tsx`
- `frontend/src/store/taskStore.ts`
- `frontend/src/store/courseStore.ts` for course dropdown reuse
- `frontend/src/types/task.ts` if a separate form model helps

**Store additions**
- `isLoading`
- `error`
- `activeFilter`
- `selectedCourseId`

**Tasks**
- Fetch all tasks on mount with `listTasks()`.
- Load saved courses for the optional course assignment dropdown.
- Use one shared `TaskForm` for both create and edit flows.
- After create and patch calls, update the store with `upsertTask`.
- Add completion toggle, delete action, and inline status feedback.
- Implement filters:
  - `all`
  - `completed`
  - `due_today`
  - `course`
- Keep filtering logic in the page or store layer rather than duplicating filtered arrays in child components.

**Done when**
- Create, edit, complete, and delete all persist correctly and refresh the UI immediately after successful responses.
- Filters work against backend-backed data.
- Tasks can optionally be linked to saved courses for future course-specific views.

### Cross-Phase Cleanup

- Add consistent shared loading, error, and empty-state components if the current shared set is too minimal.
- Replace `unknown` syllabus payloads with typed frontend models once the final display shape is stable.
- Update `DEVLOG.md` after each finished phase so implementation status stays aligned with the repo.
- Once Node.js is available, run `npm install` and `npm run build` in `frontend/` before calling the frontend complete.

## Frontend–Backend Integration Map

| User Action | API Call | Stored In |
|---|---|---|
| Type in search bar | GET /api/courses/search | ephemeral (Zustand) |
| Click course | POST /api/courses/save | `saved_courses` |
| Parse Syllabus | POST /api/syllabus/parse | `saved_courses.syllabus_parsed` |
| Generate Study Plan | POST /api/study-plan/generate | `study_plans` |
| Find Resources | POST /api/resources/generate | `resource_recommendations` |
| Toggle task complete | PATCH /api/tasks/{id} | `tasks.completed` |
| Create/edit/delete task | POST/PATCH/DELETE /api/tasks | `tasks` |
| Pomodoro timer | (client-side only) | localStorage |

---

## Guest Mode (No Auth for MVP)
- Generate a `guest_id` UUID on first visit, store in `localStorage`
- Pass as `?guest_id=` query param on all API calls
- Backend stores it as `user_id` (nullable UUID) in all tables
- Add Supabase Auth + JWT middleware later when needed

---

## Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Nebula API missing syllabus URL | Expose manual text paste input as fallback |
| Gemini returns malformed JSON | Use `response_mime_type: "application/json"` + try/except |
| pypdf fails on scanned PDFs | Fall back to Gemini multimodal (native PDF reading) |
| Guest data isolation | Filter all DB queries by `guest_id` from localStorage |

---

## Verification Checklist

**Course Search**
- [ ] `GET /api/courses/search?q=CS+3345` returns results in Swagger (`localhost:8000/docs`)
- [ ] Typing in search bar shows results within 1-2s
- [ ] Debounce prevents a request per keystroke (check Network tab)

**Syllabus Parsing**
- [ ] "Parse Syllabus" button shows loading spinner during request
- [ ] `saved_courses.syllabus_parsed` populated in Supabase dashboard
- [ ] Parsed topics/dates render in `ParsedSyllabusCard`
- [ ] Reloading page loads from storage (no re-parse)

**Study Plan**
- [ ] "Generate Study Plan" returns weekly plan objects
- [ ] `WeeklyPlanCard` components render with topic and tasks
- [ ] `study_plans` table has a record in Supabase
- [ ] Reloading loads from storage (no re-generation)

**Pomodoro Timer**
- [ ] Start → countdown from 25:00
- [ ] Pause → countdown stops
- [ ] Reset → returns to 25:00
- [ ] Reaches 00:00 → switches to break mode, session count increments
- [ ] After 4 sessions → long break triggers

**To-Do List**
- [ ] Create task → appears in list and in Supabase
- [ ] Checkbox toggle → PATCH fires, task shows as completed
- [ ] Edit → changes persist after page reload
- [ ] Delete → task removed from list and database
- [ ] "Due Today" filter → shows only today's tasks

**Resources**
- [ ] "Find Resources" returns 5-10 recommendations
- [ ] Cards show type badge (video/article/practice) and clickable URL
- [ ] Stored in Supabase and loads on revisit
