import json
from typing import Any, List
from google import genai
from google.genai import types
from app.core.config import settings

MODEL = "gemini-flash-lite-latest"

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


def _json_config() -> types.GenerateContentConfig:
    return types.GenerateContentConfig(response_mime_type="application/json")


async def parse_syllabus(raw_text: str) -> Any:
    """Extract structured topics, deadlines, and grading from syllabus text."""
    if not raw_text or not raw_text.strip():
        return {"error": "No syllabus text provided"}

    prompt = f"""You are an academic assistant. Parse the following course syllabus and return a JSON object with these exact keys:
- "topics_by_week": array of objects with "week" (int) and "topic" (string)
- "exam_dates": array of objects with "name" (string) and "date" (string)
- "assignments": array of objects with "name" (string), "due_date" (string), "weight" (string or null)
- "grading_breakdown": object mapping component name to percentage string
- "course_description": brief string summary of what the course covers

Return ONLY valid JSON with no markdown fencing.

SYLLABUS TEXT:
{raw_text[:8000]}"""

    try:
        client = _get_client()
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=_json_config(),
        )
        return json.loads(response.text)
    except (json.JSONDecodeError, Exception):
        return {"raw": raw_text[:2000], "parse_error": True}


async def generate_study_plan(parsed_syllabus: Any, weeks_available: int = 15) -> List[dict]:
    """Generate a week-by-week study plan from a parsed syllabus."""
    syllabus_str = json.dumps(parsed_syllabus) if isinstance(parsed_syllabus, dict) else str(parsed_syllabus)

    prompt = f"""You are a study coach. Given the following parsed syllabus data, create a {weeks_available}-week study plan.

Return a JSON array where each element has:
- "week": week number (int)
- "topic": main topic for the week (string)
- "daily_tasks": array of 3-5 specific study tasks (strings)
- "estimated_hours": estimated study hours for the week (float)

Return ONLY a valid JSON array with no markdown fencing.

SYLLABUS DATA:
{syllabus_str[:6000]}"""

    try:
        client = _get_client()
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=_json_config(),
        )
        result = json.loads(response.text)
        return result if isinstance(result, list) else result.get("weeks", [])
    except Exception:
        return []


async def generate_resources(topic: str, course_name: str) -> List[dict]:
    """Generate study resource recommendations for a topic."""
    prompt = f"""You are an academic resource curator. Recommend study resources for a student studying "{topic}" in the course "{course_name}".

Return a JSON array of 6-9 resources. Each resource must have:
- "resource_type": one of "video", "article", or "practice"
- "title": descriptive title (string)
- "url": a plausible URL (string, use well-known sites like YouTube, Khan Academy, GeeksForGeeks, LeetCode, etc.)
- "description": 1-2 sentence explanation of why this resource is helpful (string)

Include a mix of all three resource types. Return ONLY a valid JSON array with no markdown fencing."""

    try:
        client = _get_client()
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=_json_config(),
        )
        result = json.loads(response.text)
        return result if isinstance(result, list) else []
    except Exception:
        return []
