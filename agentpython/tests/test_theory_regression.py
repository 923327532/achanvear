import unittest
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from langchain_core.runnables import RunnableLambda
from shared.session_orchestrator import SessionState, InterviewStage
from theory_interview import router as theory
from theory_interview.question_generator import generate_questions
from theory_interview.answer_evaluator import evaluate_answer


class TheoryRegressionTest(unittest.TestCase):
    def setUp(self):
        self.state = SessionState("test-theory", "candidate", "job", "Java")
        self.questions = [
            {"text": "Explica transacciones", "expected_concepts": ["atomicidad"]},
            {"text": "Explica pruebas", "expected_concepts": ["integracion"]},
        ]
        app = FastAPI()
        app.include_router(theory.router)
        self.client = TestClient(app)
        for target, value in [
            ("get_session", AsyncMock(return_value=self.state)),
            ("update_session", AsyncMock()),
            ("generate_questions", AsyncMock(return_value=self.questions)),
            ("evaluate_answer", AsyncMock(return_value={"score": 80, "details": {}, "passed": True})),
        ]:
            patcher = patch.object(theory, target, value)
            patcher.start()
            self.addCleanup(patcher.stop)

    def start(self):
        return self.client.post("/theory-interview/start", json={
            "session_id": "test-theory", "career": "Java", "job_title": "Backend"})

    def answer(self):
        return self.client.post("/theory-interview/answer", json={
            "session_id": "test-theory", "answer": "Usaria transacciones atomicas"})

    def test_complete_flow_and_no_extra_answers(self):
        self.assertEqual(self.start().json()["total_questions"], 2)
        self.assertEqual(self.answer().json()["next_question"]["index"], 2)
        self.assertEqual(self.answer().json()["interview_status"], "theory_completed")
        result = self.client.post("/theory-interview/result/test-theory")
        self.assertEqual(result.json()["theory_score"], 80)
        self.assertEqual(self.answer().status_code, 400)
        self.assertEqual(len(self.state.answers), 2)

    def test_retry_start_resumes_without_resetting_scores(self):
        self.start()
        self.answer()
        resumed = self.start()
        self.assertEqual(resumed.json()["current_question"]["index"], 2)
        self.assertEqual(self.state.scores, [80])
        theory.generate_questions.assert_awaited_once()

    def test_result_requires_all_questions(self):
        self.start()
        self.answer()
        self.assertEqual(self.client.post("/theory-interview/result/test-theory").status_code, 409)

    def test_unstarted_or_empty_answers_do_not_advance(self):
        self.assertEqual(self.answer().status_code, 409)
        self.start()
        response = self.client.post("/theory-interview/answer", json={"session_id": "test-theory", "answer": " "})
        self.assertEqual(response.status_code, 422)
        self.assertEqual(self.state.current_q, 0)

    def test_provider_failure_keeps_current_answer_retryable(self):
        self.start()
        theory.evaluate_answer.side_effect = HTTPException(503, "AI unavailable")
        self.assertEqual(self.answer().status_code, 503)
        self.assertEqual(self.state.current_q, 0)
        self.assertEqual(self.state.scores, [])


class ProviderFailureRegressionTest(unittest.IsolatedAsyncioTestCase):
    async def test_invalid_provider_does_not_create_questions_or_scores(self):
        def unavailable(_):
            raise RuntimeError("provider unavailable")

        for module, function, args in [
            ("theory_interview.question_generator.llm", generate_questions, ("Java", "Backend")),
            ("theory_interview.answer_evaluator.llm", evaluate_answer, ("Pregunta", "Respuesta", [])),
        ]:
            with patch(module, RunnableLambda(unavailable)):
                with self.assertRaises(HTTPException) as error:
                    await function(*args)
                self.assertEqual(error.exception.status_code, 503)


if __name__ == "__main__":
    unittest.main()
