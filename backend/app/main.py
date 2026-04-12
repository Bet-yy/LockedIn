from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import courses, syllabus, study_plan, tasks, resources

app = FastAPI(title="LockedIn API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(syllabus.router, prefix="/api/syllabus", tags=["syllabus"])
app.include_router(study_plan.router, prefix="/api/study-plan", tags=["study-plan"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(resources.router, prefix="/api/resources", tags=["resources"])


@app.get("/health")
async def health():
    return {"status": "ok"}
