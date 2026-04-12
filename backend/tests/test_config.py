from unittest import TestCase

from app.core.config import Settings


class ConfigTests(TestCase):
    def test_cors_origins_list_splits_and_trims(self):
        settings = Settings(CORS_ORIGINS="http://localhost:5173, https://lockedin.app ")

        self.assertEqual(
            settings.cors_origins_list,
            ["http://localhost:5173", "https://lockedin.app"],
        )
