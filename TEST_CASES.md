# LockedIn Test Cases

## Automated Backend Cases

### Configuration
- `CORS_ORIGINS` is split into a trimmed list for FastAPI CORS setup.

### Core Routes
- `GET /health` returns `200` with `{"status": "ok"}`.
- `GET /api/courses/search` forwards query parameters to the Nebula service and returns the shaped response.
- `POST /api/courses/save` forwards `guest_id` and course payload to the persistence layer.
- `POST /api/syllabus/parse` uses manual `raw_text` when provided, skips Nebula fetch, and persists parsed output.
- `POST /api/study-plan/generate` loads saved syllabus data, generates a plan, and saves it.
- `POST /api/tasks` forwards a typed task payload and `guest_id` to the task storage layer.

### Service Helpers
- Nebula query parsing converts `CS 3345` and `CS3345` into subject/course filters.
- Nebula free-text parsing falls back to a title search payload.
- Nebula course shaping picks the first syllabus URL from section data.
- Syllabus fetch uses PDF text when available and falls back to stored raw text when PDF extraction fails.
- Gemini syllabus parsing returns a structured error when no text is provided.
- Gemini study-plan and resource generation fail safely with empty results if the model layer errors.

## Current Execution Result

- Date tested: April 11, 2026
- Command run:

```powershell
$env:PYTHONPATH='backend'; backend\venv\Scripts\python.exe -m unittest discover -s backend\tests -v
```

- Result: `15` tests passed, `0` failed

## Not Yet Runtime-Tested

- Frontend build and UI behavior are not runtime-tested in this environment because `node` and `npm` are not currently available on `PATH`.
- Live integration against Nebula, Gemini, and Supabase is not exercised by this automated suite; those external calls are mocked for deterministic tests.
