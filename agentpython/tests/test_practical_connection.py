import unittest
from unittest.mock import AsyncMock, patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from practical_voice import router as practical


class PracticalConnectionTest(unittest.TestCase):
    def test_repeated_message_id_does_not_repeat_the_answer_or_advance_twice(self):
        app = FastAPI(); app.include_router(practical.router)
        session = "deduplicated-voice-test"
        with patch.object(practical, "get_session", AsyncMock(return_value=None)), \
             patch.object(practical.tts, "synthesize_base64", AsyncMock(return_value=None)):
            with TestClient(app) as client:
                client.post("/practical-interview/start", json={"session_id": session, "career": "Software", "job_title": "Java", "candidate_name": "Ana"})
                with client.websocket_connect(f"/practical-interview/ws/{session}") as socket:
                    for _ in range(3): socket.receive_json()
                    def receive_turn():
                        self.assertEqual(socket.receive_json()["type"], "transcript")
                        self.assertEqual(socket.receive_json()["type"], "agent_text")
                        phase = socket.receive_json()["phase"]
                        self.assertEqual(socket.receive_json()["type"], "tts_unavailable")
                        return phase
                    socket.send_json({"type": "candidate_text", "text": "Si", "message_id": "voice-1"})
                    self.assertEqual(receive_turn(), "rules")
                    socket.send_json({"type": "candidate_text", "text": "Si", "message_id": "voice-1"})
                    self.assertEqual(socket.receive_json()["type"], "duplicate_turn_ignored")
                    socket.send_json({"type": "candidate_text", "text": "Si", "message_id": "voice-2"})
                    self.assertEqual(receive_turn(), "experience")
                    turns = practical._runtime_sessions[session]["transcript"]
                    self.assertEqual(sum(t["role"] == "candidate" for t in turns), 2)
        practical._runtime_sessions.pop(session, None)

    def test_unavailable_audio_keeps_websocket_ready_for_candidate(self):
        app = FastAPI()
        app.include_router(practical.router)
        session = "practical-voice-regression"
        with patch.object(practical, "get_session", AsyncMock(return_value=None)), \
             patch.object(practical.tts, "synthesize_base64", AsyncMock(return_value=None)):
            with TestClient(app) as client:
                response = client.post("/practical-interview/start", json={
                    "session_id": session, "career": "Software", "job_title": "Desarrollador Java con Spring Framework", "candidate_name": "Ana Torres", "job_requirements": "Java y Spring"})
                self.assertEqual(response.status_code, 200)
                with client.websocket_connect(f"/practical-interview/ws/{session}") as socket:
                    self.assertEqual(socket.receive_json()["type"], "ready")
                    self.assertEqual(socket.receive_json()["type"], "agent_text")
                    self.assertEqual(socket.receive_json()["type"], "tts_unavailable")
                    def turn(text):
                        socket.send_json({"type": "candidate_text", "text": text})
                        self.assertEqual(socket.receive_json()["type"], "transcript")
                        reply = socket.receive_json()
                        phase = socket.receive_json()
                        self.assertEqual(socket.receive_json()["type"], "tts_unavailable")
                        return reply["text"], phase["phase"]
                    text, phase = turn("Si, confirmo mi identidad")
                    self.assertEqual(phase, "rules")
                    self.assertIn("Java y Spring", text)
                    text, phase = turn("Si, estoy de acuerdo")
                    self.assertEqual(phase, "experience")
                    text, phase = turn("He desarrollado APIs REST con Java y Spring")
                    self.assertEqual(phase, "case_ready")
                    self.assertIn("Java", text)
                    self.assertNotIn("typescript", text.lower())
                    text, phase = turn("Estoy listo")
                    self.assertEqual(phase, "working")
                    self.assertIn("20 minutos", text)
        practical._runtime_sessions.pop(session, None)


class PracticalAudioFailureTest(unittest.IsolatedAsyncioTestCase):
    async def test_natural_confirmations_advance_without_repeating_identity(self):
        from practical_voice.onboarding import opening_message, advance_onboarding
        for confirmation in ["Así es", "Claro", "Ok", "Dale", "Sí, no hay problema"]:
            runtime = {"candidate_name": "Ana Torres", "job_title": "Java", "job_requirements": "Spring"}
            opening_message(runtime)
            reply = advance_onboarding(runtime, confirmation)
            self.assertEqual(runtime["conversation_phase"], "rules", confirmation)
            self.assertIn("Spring", reply)
        runtime = {"candidate_name": "Ana Torres"}
        opening_message(runtime)
        advance_onboarding(runtime, "No, soy otra persona")
        self.assertEqual(runtime["conversation_phase"], "identity")

    async def test_closed_technical_score_cannot_be_overwritten_via_legacy_submit(self):
        from technical_interview import router as technical
        from shared.session_orchestrator import SessionState, InterviewStage
        from datetime import datetime
        from fastapi import HTTPException
        state = SessionState("closed", "candidate", "job", "Software", "Developer")
        state.stage = InterviewStage.COMPLETED
        state.completed_at = datetime.utcnow()
        state.tech_score = 42
        with patch.object(technical, "get_session", AsyncMock(return_value=state)), \
             patch.object(technical, "evaluate_technical_challenge", AsyncMock()) as evaluate:
            with self.assertRaises(HTTPException) as error:
                await technical.submit_challenge("closed", technical.SubmitChallengeRequest(session_id="closed", solution="replacement"))
        self.assertEqual(error.exception.status_code, 409)
        self.assertEqual(state.tech_score, 42)
        evaluate.assert_not_awaited()

    async def test_scores_and_evidence_survive_session_reload(self):
        from shared.session_orchestrator import SessionState, InterviewStage
        from datetime import datetime
        state = SessionState("score-test", "candidate", "job", "Software", "Developer")
        state.tech_score = 91
        state.stage = InterviewStage.COMPLETED
        state.completed_at = datetime.utcnow()
        state.practical_evaluation = {"score": 91, "communication_score": 76, "summary": "Evidence"}
        restored = SessionState.from_dict(state.to_dict())
        with patch.object(practical, "get_session", AsyncMock(return_value=restored)):
            result = await practical.practical_result("score-test")
        self.assertEqual(result["score"], 91)
        self.assertEqual(result["communication_score"], 76)
        self.assertEqual(result["summary"], "Evidence")

    async def test_repeated_finish_returns_persisted_evaluation(self):
        from shared.session_orchestrator import SessionState, InterviewStage
        from practical_voice.schemas import PracticalFinishRequest
        from datetime import datetime
        state = SessionState("finished", "candidate", "job", "Software", "Developer")
        state.stage = InterviewStage.COMPLETED
        state.completed_at = datetime.utcnow()
        state.practical_evaluation = {"score": 91, "communication_score": 76, "passed": True, "final_score": 83.5}
        with patch.object(practical, "get_session", AsyncMock(return_value=state)), \
             patch.object(practical, "evaluate_practical_interview", AsyncMock()) as evaluate:
            result = await practical.finish_practical_interview(PracticalFinishRequest(session_id="finished", workspace_type="coding"))
        self.assertEqual(result.score, 91)
        self.assertEqual(result.communication_score, 76)
        evaluate.assert_not_awaited()

    async def test_audio_timeout_returns_fallback_signal(self):
        with patch.object(practical.tts, "synthesize_base64", AsyncMock(side_effect=TimeoutError)):
            self.assertIsNone(await practical.safe_tts("Prueba de voz"))
