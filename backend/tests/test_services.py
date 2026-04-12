from unittest import IsolatedAsyncioTestCase, TestCase
from unittest.mock import AsyncMock, patch

from app.services import gemini, nebula


class NebulaServiceTests(TestCase):
    def test_parse_query_splits_course_code(self):
        self.assertEqual(
            nebula._parse_query("CS 3345"),
            {"subject_prefix": "CS", "course_number": "3345"},
        )
        self.assertEqual(
            nebula._parse_query("cs3345"),
            {"subject_prefix": "CS", "course_number": "3345"},
        )

    def test_parse_query_uses_title_for_free_text(self):
        self.assertEqual(nebula._parse_query("algorithms"), {"title": "algorithms"})

    def test_course_to_result_picks_first_syllabus_url(self):
        result = nebula._course_to_result(
            {
                "_id": "nebula-1",
                "title": "Data Structures",
                "subject_prefix": "CS",
                "course_number": "3345",
            },
            [
                {"syllabus_uri": None},
                {"syllabus_file_uri": "https://example.com/syllabus.pdf"},
            ],
            semester="24F",
            professor="Ada Lovelace",
        )

        self.assertEqual(result.nebula_course_id, "nebula-1")
        self.assertEqual(result.course_name, "Data Structures")
        self.assertEqual(result.course_number, "CS 3345")
        self.assertEqual(result.professor, "Ada Lovelace")
        self.assertEqual(result.semester, "24F")
        self.assertEqual(result.syllabus_url, "https://example.com/syllabus.pdf")


class GeminiServiceTests(IsolatedAsyncioTestCase):
    async def test_parse_syllabus_returns_error_for_blank_text(self):
        result = await gemini.parse_syllabus("   ")

        self.assertEqual(result, {"error": "No syllabus text provided"})

    async def test_generate_study_plan_returns_empty_list_when_model_fails(self):
        with patch(
            "app.services.gemini._get_client",
            side_effect=RuntimeError("Gemini unavailable"),
        ):
            result = await gemini.generate_study_plan({"topics_by_week": []}, weeks_available=6)

        self.assertEqual(result, [])

    async def test_generate_resources_returns_empty_list_when_model_fails(self):
        with patch(
            "app.services.gemini._get_client",
            side_effect=RuntimeError("Gemini unavailable"),
        ):
            result = await gemini.generate_resources("graphs", "CS 3345")

        self.assertEqual(result, [])


class SyllabusFetchTests(IsolatedAsyncioTestCase):
    async def test_get_syllabus_text_uses_pdf_text_when_available(self):
        with patch(
            "app.services.supabase_client.get_saved_course_by_id",
            new=AsyncMock(return_value={"nebula_course_id": "nebula-1", "syllabus_raw": "fallback raw"}),
        ), patch(
            "app.services.nebula._get_sections_for_course",
            new=AsyncMock(return_value=[{"syllabus_uri": "https://example.com/syllabus.pdf"}]),
        ), patch(
            "app.services.nebula._fetch_pdf_text",
            new=AsyncMock(return_value="parsed pdf text"),
        ):
            result = await nebula.get_syllabus_text("saved-1")

        self.assertEqual(result, "parsed pdf text")

    async def test_get_syllabus_text_falls_back_to_saved_raw_text(self):
        with patch(
            "app.services.supabase_client.get_saved_course_by_id",
            new=AsyncMock(return_value={"nebula_course_id": "nebula-1", "syllabus_raw": "fallback raw"}),
        ), patch(
            "app.services.nebula._get_sections_for_course",
            new=AsyncMock(return_value=[{"syllabus_uri": "https://example.com/syllabus.pdf"}]),
        ), patch(
            "app.services.nebula._fetch_pdf_text",
            new=AsyncMock(return_value=""),
        ):
            result = await nebula.get_syllabus_text("saved-1")

        self.assertEqual(result, "fallback raw")
