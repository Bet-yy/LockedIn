import re
import httpx
from typing import Optional, List
from app.core.config import settings
from app.models.course import CourseSearchResult

NEBULA_BASE = "https://api.utdnebula.com"


def _headers() -> dict:
    return {"x-api-key": settings.NEBULA_API_KEY, "Accept": "application/json"}


def _parse_query(query: str) -> dict:
    """
    'CS 3345' / 'CS3345'  -> {subject_prefix, course_number}
    'CS 3' / 'CS 33'      -> {subject_prefix, number_prefix}
    'CS' / 'PHIL'         -> {subject_prefix}
    'algorithms'           -> {title}
    """
    q = query.strip()
    # Exact course: "CS 3345" or "CS3345"
    match = re.match(r"^([A-Za-z]{2,4})\s*(\d{4})$", q)
    if match:
        return {"subject_prefix": match.group(1).upper(), "course_number": match.group(2)}

    # Subject + partial number: "CS 3", "CS 33", "CS 334"
    # Pass course_number directly to Nebula so it filters server-side
    partial = re.match(r"^([A-Za-z]{2,4})\s+(\d{1,3})$", q)
    if partial:
        return {"subject_prefix": partial.group(1).upper(), "course_number": partial.group(2)}

    # Subject prefix only: "CS", "PHIL", "MATH"
    subject = re.match(r"^([A-Za-z]{2,4})$", q)
    if subject:
        return {"subject_prefix": subject.group(1).upper()}

    return {"title": q}


async def search_courses(query: str, semester: Optional[str] = None) -> List[CourseSearchResult]:
    parsed = _parse_query(query)
    params = {**parsed, "offset": 0}

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{NEBULA_BASE}/course",
            params=params,
            headers=_headers(),
            timeout=10.0,
        )
        resp.raise_for_status()
        data = resp.json()

    courses = data.get("data") or []
    if not isinstance(courses, list):
        courses = [courses]

    # Return basic course info only — skipping per-course section/professor lookups
    # keeps search suggestions fast (1 API call instead of 40+)
    return [_course_to_result(c, [], semester, None) for c in courses[:20]]


async def get_course_by_id(course_id: str) -> CourseSearchResult:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{NEBULA_BASE}/course/{course_id}",
            headers=_headers(),
            timeout=10.0,
        )
        resp.raise_for_status()
        c = resp.json().get("data") or resp.json()

    sections = await _get_sections_for_course(course_id)
    professor = await _resolve_professor_from_sections(sections)
    return _course_to_result(c, sections, professor=professor)


async def _get_sections_for_course(course_id: str) -> List[dict]:
    if not course_id:
        return []
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{NEBULA_BASE}/course/{course_id}/sections",
                headers=_headers(),
                timeout=8.0,
            )
            if resp.status_code == 200:
                data = resp.json().get("data") or []
                return data if isinstance(data, list) else [data]
    except Exception:
        pass
    return []


async def _resolve_professor_from_sections(sections: List[dict]) -> Optional[str]:
    """Resolve the first professor ID found across sections to a full name."""
    for section in sections:
        prof_ids = section.get("professors", [])
        if prof_ids:
            name = await _resolve_professor_id(prof_ids[0])
            if name:
                return name
    return None


async def _resolve_professor_id(professor_id: str) -> Optional[str]:
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{NEBULA_BASE}/professor/{professor_id}",
                headers=_headers(),
                timeout=6.0,
            )
            if resp.status_code == 200:
                p = resp.json().get("data") or {}
                first = p.get("first_name", "")
                last = p.get("last_name", "")
                if first or last:
                    return f"{first} {last}".strip()
    except Exception:
        pass
    return None


def _course_to_result(
    c: dict,
    sections: List[dict],
    semester: Optional[str] = None,
    professor: Optional[str] = None,
) -> CourseSearchResult:
    syllabus_url = None
    for section in sections:
        uri = section.get("syllabus_uri") or section.get("syllabus_file_uri")
        if uri:
            syllabus_url = uri
            break

    return CourseSearchResult(
        nebula_course_id=c.get("_id", ""),
        course_name=c.get("title", ""),
        course_number=f"{c.get('subject_prefix', '')} {c.get('course_number', '')}".strip(),
        professor=professor,
        semester=semester,
        syllabus_url=syllabus_url or None,
    )


async def get_syllabus_text(course_id: str) -> str:
    from app.services.supabase_client import get_saved_course_by_id

    course = await get_saved_course_by_id(course_id)
    nebula_id = course.get("nebula_course_id", "")

    sections = await _get_sections_for_course(nebula_id)
    for s in sections:
        syllabus_url = s.get("syllabus_uri") or s.get("syllabus_file_uri")
        if syllabus_url and syllabus_url.startswith("http"):
            text = await _fetch_pdf_text(syllabus_url)
            if text:
                return text

    return course.get("syllabus_raw") or ""


async def _fetch_pdf_text(url: str) -> str:
    import io
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=15.0, follow_redirects=True)
            resp.raise_for_status()
            pdf_bytes = resp.content

        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        if text.strip():
            return text
    except Exception:
        pass
    return ""
