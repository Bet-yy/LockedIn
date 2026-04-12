from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, patch

from httpx import ASGITransport, AsyncClient

from app.main import app


class AppRoutesTests(IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        transport = ASGITransport(app=app)
        self.client = AsyncClient(transport=transport, base_url="http://testserver")

    async def asyncTearDown(self) -> None:
        await self.client.aclose()

    async def test_health_route_returns_ok(self):
        response = await self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    async def test_search_courses_route_returns_mocked_results(self):
        mocked_results = [
            {
                "nebula_course_id": "nebula-1",
                "course_name": "Data Structures",
                "course_number": "CS 3345",
                "professor": "Ada Lovelace",
                "semester": "24F",
                "syllabus_url": "https://example.com/syllabus.pdf",
            }
        ]

        with patch(
            "app.services.nebula.search_courses",
            new=AsyncMock(return_value=mocked_results),
        ) as search_mock:
            response = await self.client.get(
                "/api/courses/search",
                params={"q": "CS 3345", "semester": "24F"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), mocked_results)
        search_mock.assert_awaited_once_with("CS 3345", "24F")

    async def test_save_course_route_passes_guest_id_to_storage_layer(self):
        payload = {
            "nebula_course_id": "nebula-1",
            "course_name": "Data Structures",
            "course_number": "CS 3345",
            "professor": "Ada Lovelace",
            "semester": "24F",
            "syllabus_url": "https://example.com/syllabus.pdf",
        }
        stored_course = {"id": "saved-1", **payload, "syllabus_raw": None, "syllabus_parsed": None, "created_at": None}

        with patch(
            "app.services.supabase_client.save_course",
            new=AsyncMock(return_value=stored_course),
        ) as save_mock:
            response = await self.client.post(
                "/api/courses/save",
                params={"guest_id": "guest-123"},
                json=payload,
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], "saved-1")
        save_args = save_mock.await_args.args
        self.assertEqual(save_args[1], "guest-123")
        self.assertEqual(save_args[0].course_name, "Data Structures")

    async def test_get_saved_courses_route_returns_mocked_courses(self):
        saved_courses = [
            {
                "id": "saved-1",
                "nebula_course_id": "nebula-1",
                "course_name": "Data Structures",
                "course_number": "CS 3345",
                "professor": "Ada Lovelace",
                "semester": "24F",
                "syllabus_raw": None,
                "syllabus_parsed": None,
                "created_at": None,
            }
        ]

        with patch(
            "app.services.supabase_client.get_saved_courses",
            new=AsyncMock(return_value=saved_courses),
        ) as get_saved_mock:
            response = await self.client.get("/api/courses/saved", params={"guest_id": "guest-123"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), saved_courses)
        get_saved_mock.assert_awaited_once_with("guest-123")

    async def test_get_course_route_returns_mocked_course(self):
        mocked_course = {
            "nebula_course_id": "nebula-1",
            "course_name": "Data Structures",
            "course_number": "CS 3345",
            "professor": "Ada Lovelace",
            "semester": None,
            "syllabus_url": "https://example.com/syllabus.pdf",
        }

        with patch(
            "app.services.nebula.get_course_by_id",
            new=AsyncMock(return_value=mocked_course),
        ) as get_course_mock:
            response = await self.client.get("/api/courses/nebula-1")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), mocked_course)
        get_course_mock.assert_awaited_once_with("nebula-1")

    async def test_parse_syllabus_route_uses_manual_text_when_provided(self):
        parsed_payload = {
            "topics_by_week": [{"week": 1, "topic": "Intro"}],
            "exam_dates": [],
            "assignments": [],
            "grading_breakdown": {},
            "course_description": "Test course",
        }

        with patch(
            "app.services.gemini.parse_syllabus",
            new=AsyncMock(return_value=parsed_payload),
        ) as parse_mock, patch(
            "app.services.supabase_client.update_syllabus_parsed",
            new=AsyncMock(),
        ) as update_mock, patch(
            "app.services.nebula.get_syllabus_text",
            new=AsyncMock(return_value="should-not-be-used"),
        ) as syllabus_mock:
            response = await self.client.post(
                "/api/syllabus/parse",
                params={"guest_id": "guest-123"},
                json={"course_id": "saved-1", "raw_text": "Week 1 intro"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["syllabus_parsed"], parsed_payload)
        parse_mock.assert_awaited_once_with("Week 1 intro")
        syllabus_mock.assert_not_awaited()
        update_mock.assert_awaited_once_with("saved-1", "Week 1 intro", parsed_payload)

    async def test_get_syllabus_route_returns_saved_parsed_payload(self):
        stored_course = {
            "id": "saved-1",
            "syllabus_parsed": {
                "topics_by_week": [{"week": 1, "topic": "Intro"}],
                "exam_dates": [],
                "assignments": [],
                "grading_breakdown": {},
                "course_description": "Test course",
            },
        }

        with patch(
            "app.services.supabase_client.get_saved_course_by_id",
            new=AsyncMock(return_value=stored_course),
        ) as get_course_mock:
            response = await self.client.get("/api/syllabus/saved-1")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["course_id"], "saved-1")
        self.assertEqual(response.json()["syllabus_parsed"], stored_course["syllabus_parsed"])
        get_course_mock.assert_awaited_once_with("saved-1")

    async def test_generate_study_plan_route_returns_mocked_plan(self):
        saved_course = {"id": "saved-1", "syllabus_parsed": {"topics_by_week": [{"week": 1, "topic": "Intro"}]}}
        generated_plan = [
            {
                "week": 1,
                "topic": "Intro",
                "daily_tasks": ["Read notes", "Practice problems", "Review quiz"],
                "estimated_hours": 4.5,
            }
        ]

        with patch(
            "app.services.supabase_client.get_saved_course_by_id",
            new=AsyncMock(return_value=saved_course),
        ) as get_course_mock, patch(
            "app.services.gemini.generate_study_plan",
            new=AsyncMock(return_value=generated_plan),
        ) as generate_mock, patch(
            "app.services.supabase_client.save_study_plan",
            new=AsyncMock(),
        ) as save_mock:
            response = await self.client.post(
                "/api/study-plan/generate",
                params={"guest_id": "guest-123"},
                json={"course_id": "saved-1", "weeks_available": 12},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["plan_content"], generated_plan)
        get_course_mock.assert_awaited_once_with("saved-1")
        generate_mock.assert_awaited_once_with(saved_course["syllabus_parsed"], 12)
        save_mock.assert_awaited_once_with("saved-1", generated_plan)

    async def test_get_study_plan_route_returns_saved_plan(self):
        saved_plan = [
            {
                "week": 1,
                "topic": "Intro",
                "daily_tasks": ["Read notes", "Practice"],
                "estimated_hours": 3.5,
            }
        ]

        with patch(
            "app.services.supabase_client.get_study_plan",
            new=AsyncMock(return_value=saved_plan),
        ) as get_plan_mock:
            response = await self.client.get("/api/study-plan/saved-1")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["course_id"], "saved-1")
        self.assertEqual(response.json()["plan_content"], saved_plan)
        get_plan_mock.assert_awaited_once_with("saved-1")

    async def test_generate_resources_route_returns_mocked_resources(self):
        saved_course = {"id": "saved-1", "course_name": "Data Structures"}
        resources = [
            {
                "resource_type": "video",
                "title": "Binary Trees Explained",
                "url": "https://example.com/video",
                "description": "Good overview video.",
            }
        ]

        with patch(
            "app.services.supabase_client.get_saved_course_by_id",
            new=AsyncMock(return_value=saved_course),
        ) as get_course_mock, patch(
            "app.services.gemini.generate_resources",
            new=AsyncMock(return_value=resources),
        ) as generate_mock, patch(
            "app.services.supabase_client.save_resources",
            new=AsyncMock(),
        ) as save_mock:
            response = await self.client.post(
                "/api/resources/generate",
                params={"guest_id": "guest-123"},
                json={"course_id": "saved-1", "topic": "Binary Trees"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), resources)
        get_course_mock.assert_awaited_once_with("saved-1")
        generate_mock.assert_awaited_once_with("Binary Trees", "Data Structures")
        save_mock.assert_awaited_once_with("saved-1", resources)

    async def test_get_resources_route_returns_saved_resources(self):
        resources = [
            {
                "resource_type": "article",
                "title": "Graph Algorithms Notes",
                "url": "https://example.com/article",
                "description": "Helpful reference notes.",
            }
        ]

        with patch(
            "app.services.supabase_client.get_resources",
            new=AsyncMock(return_value=resources),
        ) as get_resources_mock:
            response = await self.client.get("/api/resources/saved-1")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), resources)
        get_resources_mock.assert_awaited_once_with("saved-1")

    async def test_list_tasks_route_returns_mocked_tasks(self):
        tasks = [
            {
                "id": "task-1",
                "user_id": "guest-123",
                "course_id": "saved-1",
                "title": "Finish reading",
                "description": "Chapter 2",
                "due_date": "2026-04-15",
                "completed": False,
                "priority": "high",
                "created_at": None,
            }
        ]

        with patch(
            "app.services.supabase_client.get_tasks",
            new=AsyncMock(return_value=tasks),
        ) as list_mock:
            response = await self.client.get(
                "/api/tasks",
                params={"guest_id": "guest-123", "course_id": "saved-1"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), tasks)
        list_mock.assert_awaited_once_with("guest-123", "saved-1")

    async def test_task_create_route_returns_mocked_task(self):
        created_task = {
            "id": "task-1",
            "user_id": "guest-123",
            "course_id": None,
            "title": "Finish reading",
            "description": "Chapter 2",
            "due_date": "2026-04-15",
            "completed": False,
            "priority": "high",
            "created_at": None,
        }

        with patch(
            "app.services.supabase_client.create_task",
            new=AsyncMock(return_value=created_task),
        ) as create_mock:
            response = await self.client.post(
                "/api/tasks",
                params={"guest_id": "guest-123"},
                json={
                    "title": "Finish reading",
                    "description": "Chapter 2",
                    "due_date": "2026-04-15",
                    "priority": "high",
                    "course_id": None,
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], "task-1")
        create_args = create_mock.await_args.args
        self.assertEqual(create_args[1], "guest-123")
        self.assertEqual(create_args[0].title, "Finish reading")

    async def test_task_update_route_returns_mocked_task(self):
        updated_task = {
            "id": "task-1",
            "user_id": "guest-123",
            "course_id": None,
            "title": "Finish reading",
            "description": "Chapter 2",
            "due_date": "2026-04-15",
            "completed": True,
            "priority": "high",
            "created_at": None,
        }

        with patch(
            "app.services.supabase_client.update_task",
            new=AsyncMock(return_value=updated_task),
        ) as update_mock:
            response = await self.client.patch(
                "/api/tasks/task-1",
                params={"guest_id": "guest-123"},
                json={"completed": True},
            )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["completed"])
        update_args = update_mock.await_args.args
        self.assertEqual(update_args[0], "task-1")
        self.assertEqual(update_args[2], "guest-123")
        self.assertTrue(update_args[1].completed)

    async def test_task_delete_route_returns_deleted_id(self):
        with patch(
            "app.services.supabase_client.delete_task",
            new=AsyncMock(),
        ) as delete_mock:
            response = await self.client.delete(
                "/api/tasks/task-1",
                params={"guest_id": "guest-123"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"deleted": "task-1"})
        delete_mock.assert_awaited_once_with("task-1", "guest-123")
