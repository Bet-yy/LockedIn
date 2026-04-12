# LockedIn — Development Log

## Project Overview
**LockedIn** is a student productivity web app for UTD students combining course discovery (UTD Nebula API), AI-powered syllabus parsing and study planning (Google Gemini), and productivity tools (Pomodoro timer, To-Do list).

---

## Stack Decisions

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Vite + React + TypeScript | Faster than CRA |
| Styling | Tailwind CSS | Rapid prototyping |
| State | Zustand | Simpler than Redux |
| Backend | FastAPI + Python | Async, auto Swagger docs |
| Database | Supabase (PostgreSQL) | Built-in REST, free tier |
| AI | Google Gemini (`gemini-flash-lite-latest`) | Via `google-genai` SDK |
| Course Data | UTD Nebula API | `https://api.utdnebula.com` |

---

## Phase 1 — Backend Scaffolding

### Files Created
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  ← FastAPI app, CORS, router registration
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            ← pydantic-settings, loads .env
│   │   └── dependencies.py     ← guest_id query param extractor
│   ├── models/
│   │   ├── __init__.py
│   │   ├── course.py            ← CourseSearchResult, SaveCourseRequest, SavedCourse
│   │   ├── task.py              ← Task, TaskCreate, TaskUpdate
│   │   └── study_plan.py       ← Parse/StudyPlan/Resources models
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── courses.py           ← search, save, list, get by id
│   │   ├── syllabus.py          ← parse, get
│   │   ├── study_plan.py        ← generate, get
│   │   ├── tasks.py             ← full CRUD
│   │   └── resources.py         ← generate, get
│   └── services/
│       ├── __init__.py
│       ├── nebula.py            ← Nebula API client
│       ├── gemini.py            ← Gemini AI service
│       └── supabase_client.py  ← All DB operations
├── venv/                        ← Python virtual environment
├── .env                         ← API keys (gitignored)
└── requirements.txt
```

### API Routes Registered
```
GET  /health
GET  /api/courses/search?q=&semester=
GET  /api/courses/saved
POST /api/courses/save
GET  /api/courses/{course_id}
POST /api/syllabus/parse
GET  /api/syllabus/{course_id}
POST /api/study-plan/generate
GET  /api/study-plan/{course_id}
GET  /api/tasks
POST /api/tasks
PATCH  /api/tasks/{task_id}
DELETE /api/tasks/{task_id}
POST /api/resources/generate
GET  /api/resources/{course_id}
```

### Dependencies (`requirements.txt`)
```
fastapi
uvicorn[standard]
httpx
google-genai
supabase==2.9.1
pypdf
pydantic-settings
python-dotenv
```
> **Note:** `supabase` pinned to `2.9.1` — newer versions pull in `pyiceberg` which fails to build on Windows.
> `google-genai` replaces the deprecated `google-generativeai` package.

---

## Phase 2 — Environment & Credentials

### `.env` (backend)
```
SUPABASE_URL=https://paxvagnsyfamwtqhxuav.supabase.co
SUPABASE_SERVICE_KEY=<service_role JWT>
GEMINI_API_KEY=<Gemini key>
NEBULA_API_BASE=https://api.utdnebula.com
NEBULA_API_KEY=<Nebula key>
CORS_ORIGINS=http://localhost:5173
```

### Supabase Setup
- Project ref: `paxvagnsyfamwtqhxuav`
- Project URL: `https://paxvagnsyfamwtqhxuav.supabase.co`
- **Anon key** (for frontend `.env.local`): stored separately — do NOT put in backend `.env`
- Tables created via SQL Editor: `saved_courses`, `study_plans`, `tasks`, `resource_recommendations`

---

## Issues Found & Fixed

### Issue 1 — Nebula API: Wrong auth method
- **Symptom:** All Nebula calls returned `{"status": 200, "data": null}`
- **Root cause:** Auth was sent as `?key=` query param; Nebula requires `x-api-key` header
- **Fix:** Changed `_headers()` to return `{"x-api-key": settings.NEBULA_API_KEY, "Accept": "application/json"}`

### Issue 2 — Nebula API: Wrong base URL
- **Symptom:** 404 on all endpoints
- **Root cause:** URL was `https://api.utdnebula.com/v1/...`; correct URL has no `/v1/`
- **Fix:** Set `NEBULA_API_BASE=https://api.utdnebula.com` and hardcoded `NEBULA_BASE` in `nebula.py`

### Issue 3 — Nebula API: Wrong search parameter
- **Symptom:** No results for course searches
- **Root cause:** Used `?search=CS+3345`; Nebula uses field-specific params
- **Fix:** `_parse_query()` now converts `"CS 3345"` → `{subject_prefix: "CS", course_number: "3345"}` and free text → `{title: "..."}`

### Issue 4 — Nebula API: Professor field is a reference ID
- **Symptom:** `professor: null` on all results
- **Root cause:** Section objects return `professors: ["<id>"]` (ID references, not embedded objects)
- **Fix:** Added `_resolve_professor_id(id)` which calls `GET /professor/{id}` and `_resolve_professor_from_sections()` to find the first valid professor ID across sections

### Issue 5 — nebula.py inconsistent state (500 on search)
- **Symptom:** `GET /api/courses/search` returned HTTP 500
- **Root cause:** `_resolve_professor_from_sections()` was called but never defined; `_course_to_result()` had a 3-arg signature but was called with 4 args — caused by a rejected mid-edit
- **Fix:** Rewrote `nebula.py` in full with consistent function signatures

### Issue 6 — Supabase: URL field had anon key pasted in
- **Symptom:** Supabase client would fail to connect
- **Root cause:** User pasted the anon JWT into `SUPABASE_URL` instead of the project URL
- **Fix:** Extracted project ref `paxvagnsyfamwtqhxuav` from the JWT payload; set `SUPABASE_URL=https://paxvagnsyfamwtqhxuav.supabase.co`

### Issue 7 — `supabase` package: pyiceberg build failure
- **Symptom:** `pip install supabase` failed with `failed-wheel-build pyiceberg`
- **Root cause:** Latest `supabase` depends on `storage3==2.28.3` which requires `pyiceberg`, which fails to build on Windows
- **Fix:** Pinned `supabase==2.9.1` in `requirements.txt`

### Issue 8 — Gemini: Deprecated SDK
- **Symptom:** `FutureWarning` on import; `NotFound 404 models/gemini-1.5-flash`
- **Root cause:** `google-generativeai` package is end-of-life; model name `gemini-1.5-flash` no longer available
- **Fix:** Replaced with `google-genai` package; updated all imports and API call syntax

### Issue 9 — Gemini: Quota exhausted on `gemini-2.0-flash`
- **Symptom:** `429 RESOURCE_EXHAUSTED`, `limit: 0`
- **Root cause:** Free tier quota for `gemini-2.0-flash` exhausted on the provided API key
- **Fix:** Switched model to `gemini-flash-lite-latest` which has a separate quota pool and succeeded

---

## Test Results

All tests run against `http://localhost:8000` with the server started via:
```bash
cd backend
source venv/Scripts/activate
uvicorn app.main:app --port 8000
```

| # | Test | Endpoint | Result |
|---|---|---|---|
| 1 | Health check | `GET /health` | **PASS** — `{"status":"ok"}` |
| 2 | Swagger UI accessible | `GET /docs` | **PASS** — HTTP 200 |
| 3 | Course search (CS 3345) | `GET /api/courses/search?q=CS+3345` | **PASS** — 10 results with name, professor, syllabus URL |
| 4 | Course search (CS 2305) | `GET /api/courses/search?q=CS+2305` | **PASS** — 10 results |
| 5 | Save course to Supabase | `POST /api/courses/save` | **PASS** — UUID returned, record in DB |
| 6 | Get saved courses | `GET /api/courses/saved` | **PASS** — list returned from Supabase |
| 7 | Syllabus parse (Gemini) | `POST /api/syllabus/parse` | **PASS** — structured JSON: topics, exams, grading, description |
| 8 | Study plan generate (Gemini) | `POST /api/study-plan/generate` | **PASS** — 15-week plan with daily_tasks and estimated_hours |
| 9 | Resource recommendations (Gemini) | `POST /api/resources/generate` | **PASS** — 7 resources (video/article/practice mix) |
| 10 | Create task | `POST /api/tasks` | **PASS** — task with priority + due_date persisted |
| 11 | List tasks | `GET /api/tasks` | **PASS** — returns task list |
| 12 | Update task (mark complete) | `PATCH /api/tasks/{id}` | **PASS** — `completed: true` |
| 13 | Delete task | `DELETE /api/tasks/{id}` | **PASS** — `{"deleted": "<id>"}` |

### Sample Course Search Result (CS 3345)
```json
{
  "nebula_course_id": "69d92859770577a012675a40",
  "course_name": "Data Structures and Introduction to Algorithmic Analysis",
  "course_number": "CS 3345",
  "professor": "Greg Ozbirn",
  "semester": null,
  "syllabus_url": "https://dox.utdallas.edu/syl73444"
}
```

### Sample Gemini Syllabus Parse Output
```json
{
  "topics_by_week": [
    {"week": 1, "topic": "Arrays and Linked Lists"},
    {"week": 2, "topic": "Stacks and Queues"},
    {"week": 3, "topic": "Binary Trees and BST"},
    {"week": 5, "topic": "Hash Tables"}
  ],
  "exam_dates": [
    {"name": "Exam 1", "date": "Week 6"},
    {"name": "Final Exam", "date": "Week 15"}
  ],
  "grading_breakdown": {
    "Exam 1": "25%", "Exam 2": "25%", "Final": "30%", "Assignments": "20%"
  },
  "course_description": "An introduction to fundamental data structures including lists, trees, graphs, and sorting algorithms."
}
```

---

## Current Status

### Phase 5 - Frontend Scaffolding

### Files Created
```
frontend/
|-- .env.example
|-- .gitignore
|-- index.html
|-- package.json
|-- postcss.config.js
|-- tailwind.config.js
|-- tsconfig.app.json
|-- tsconfig.json
|-- tsconfig.node.json
|-- vite.config.ts
`-- src/
    |-- App.tsx
    |-- main.tsx
    |-- styles.css
    |-- vite-env.d.ts
    |-- api/
    |   |-- client.ts
    |   |-- courses.ts
    |   |-- studyPlan.ts
    |   |-- syllabus.ts
    |   `-- tasks.ts
    |-- components/shared/
    |   |-- AppShell.tsx
    |   |-- Navbar.tsx
    |   |-- PageIntro.tsx
    |   `-- StatusCard.tsx
    |-- hooks/
    |   |-- useDebounce.ts
    |   `-- useInterval.ts
    |-- pages/
    |   |-- CoursePage.tsx
    |   |-- HomePage.tsx
    |   |-- TasksPage.tsx
    |   `-- TimerPage.tsx
    |-- store/
    |   |-- courseStore.ts
    |   |-- taskStore.ts
    |   `-- timerStore.ts
    |-- types/
    |   |-- course.ts
    |   |-- studyPlan.ts
    |   `-- task.ts
    `-- utils/
        `-- guest.ts
```

### What Was Implemented
- Added a Vite + React + TypeScript frontend workspace with Tailwind and PostCSS configuration.
- Set up React Router routes for `/`, `/course/:id`, `/tasks`, and `/timer`.
- Built a shared `Navbar` and `AppShell` layout so all feature pages already sit inside a consistent UI shell.
- Added typed API wrappers for courses, syllabus, study plans, resources, and tasks against the existing FastAPI routes.
- Added guest mode persistence via `localStorage` and an Axios interceptor that appends `guest_id` to API requests automatically.
- Added foundational Zustand stores for courses, tasks, and timer state.
- Added starter hooks (`useDebounce`, `useInterval`) and scaffold pages for Home, Course, Tasks, and Timer flows.

### Verification Notes
- Frontend source scaffold created successfully in `frontend/`.
- Dependency install could not be completed in this environment because `node` and `npm` are not installed or not available on `PATH`.
- Build/dev verification is pending until Node.js is available.

### Done
- [x] Backend scaffolded (FastAPI + all routes)
- [x] Nebula API integration (course search, sections, professor resolution, syllabus fetch)
- [x] Gemini AI integration (syllabus parse, study plan, resource recommendations)
- [x] Supabase integration (all CRUD operations)
- [x] Tasks CRUD
- [x] All 13 backend tests passing
- [x] Phase 5: Frontend scaffold (Vite-style app shell, Tailwind config, routing, Zustand, API layer)

### Next Up
- [ ] Phase 6: Course search UI
- [ ] Phase 7: CoursePage (syllabus, study plan, resources tabs)
- [ ] Phase 8: Pomodoro Timer
- [ ] Phase 9: To-Do List

---

## How to Run the Backend

```bash
cd backend
source venv/Scripts/activate        # Windows Git Bash
uvicorn app.main:app --port 8000 --reload
```

Swagger UI: `http://localhost:8000/docs`
