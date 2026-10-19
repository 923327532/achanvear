import unittest
from unittest.mock import AsyncMock, patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from practical_voice import router as practical


class PracticalConnectionTest(unittest.TestCase):
    def test_unavailable_audio_keeps_websocket_ready_for_candidate(self):
        app = FastAPI()
        app.include_router(practical.router)
        session = "practical-voice-regression"
        with patch.object(practical, "get_session", AsyncMock(return_value=None)), \
             patch.object(practical.tts, "synthesize_base64", AsyncMock(return_value=None)):
            with TestClient(app) as client:
                response = client.post("/practical-interview/start", json={
                    "session_id": session, "career": "Software", "job_title": "Java"})
                self.assertEqual(response.status_code, 200)
                with client.websocket_connect(f"/practical-interview/ws/{session}") as socket:
                    self.assertEqual(socket.receive_json()["type"], "ready")
                    self.assertEqual(socket.receive_json()["type"], "agent_text")
                    self.assertEqual(socket.receive_json()["type"], "tts_unavailable")
                    socket.send_json({"type": "candidate_text", "text": "Estoy listo"})
                    self.assertEqual(socket.receive_json()["type"], "transcript")
                    reply = socket.receive_json()
                    self.assertEqual(reply["type"], "agent_text")
                    self.assertIn("20 minutos", reply["text"])
                    self.assertEqual(socket.receive_json()["type"], "tts_unavailable")
        practical._runtime_sessions.pop(session, None)


class PracticalAudioFailureTest(unittest.IsolatedAsyncioTestCase):
    async def test_audio_timeout_returns_fallback_signal(self):
        with patch.object(practical.tts, "synthesize_base64", AsyncMock(side_effect=TimeoutError)):
            self.assertIsNone(await practical.safe_tts("Prueba de voz"))
