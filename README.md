## WeHack Hackathon Project – First Place (The Nebula Wing Track)

Built this in 36 hours during WeHack 2026

- 🥇 Won **1st Place – [The Nebula Wing Track]**
- 🔗 Devlog: https://devpost.com/software/lockedin-mdq2wg?ref_content=my-projects-tab&ref_feature=my_projects


# LockedIn

> UTD students get a syllabus on day one and no clear plan. LockedIn fixes that.

LockedIn is a student productivity app built for UTD that transforms your course syllabus into a structured study workspace — complete with AI-generated study plans, resource recommendations, a deadline planner, and a built-in Pomodoro timer.

---

## Features

- **Course Search** — Search any UTD course by subject prefix (CS, PHIL, MATH) or course number, powered by the Nebula API
- **Syllabus Parser** — Upload a syllabus PDF and let Gemini AI extract key topics, assignments, and exam dates
- **Study Plan Generator** — Automatically generate a week-by-week study plan tailored to your course
- **Resource Recommendations** — Get curated learning resources matched to your course content
- **Deadline Planner** — A visual calendar to track and manage all your upcoming deadlines
- **To-Do List** — Task management with priority levels and due dates
- **Pomodoro Timer** — Built-in focus timer with work, short break, and long break modes

---

## Tech Stack

| Layer | Technology |

| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand |
| Backend | FastAPI, Python 3.11 |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini |
| Course Data | UTD Nebula API |

---

## Project Structure

```
LockedIn/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── api/       # API client functions
│   │   ├── components/# Reusable UI components
│   │   ├── pages/     # Route-level page components
│   │   ├── store/     # Zustand state management
│   │   └── types/     # TypeScript type definitions
│   └── ...
├── backend/           # FastAPI app
│   ├── app/
│   │   ├── routers/   # API route handlers
│   │   ├── services/  # Nebula, Supabase, Gemini integrations
│   │   ├── models/    # Pydantic data models
│   │   └── core/      # Config and dependencies
│   └── requirements.txt
└── README.md
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- A Supabase project
- API keys for: Nebula (UTD course data) and Google Gemini

---

## Environment Setup

Create `backend/.env` with the following:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
NEBULA_API_KEY=your_nebula_api_key
CORS_ORIGINS=http://localhost:5173
```

---

## Running the Backend

```bash
cd backend

# Create and activate virtual environment (first time only)
python -m venv venv

# Activate (Mac/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

---

## Running the Frontend

Open a second terminal:

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Usage

1. Open `http://localhost:5173` in your browser
2. Use **Courses** to search for a UTD class and save it as a workspace
3. Upload your syllabus PDF to generate a study plan and resource list
4. Use **Calendar** to track deadlines
5. Use **To-Do List** to manage tasks
6. Use the **Home** page for the Pomodoro timer and a daily overview

---

## Team

Built at WEHack 2026 by:

- **Beatriz Espinoza** — Frontend
- **Meenakshi Choppa** — Backend and Frontend
- **Zainab Qadar** — Design
- **Ananya Swaminathan** — Design
