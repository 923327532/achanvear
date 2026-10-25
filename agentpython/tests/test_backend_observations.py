import unittest
from unittest.mock import AsyncMock, patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from langchain_core.runnables import RunnableLambda
from theory_interview import question_generator as generator
from practical_voice import router as practical
from shared.session_orchestrator import SessionState, InterviewStage
from practical_voice.workspace import infer_workspace_type, build_workspace_challenge
from practical_voice.schemas import PracticalWorkspaceType

class QuestionPolicyTest(unittest.IsolatedAsyncioTestCase):
    async def test_A24_exactly_fifteen_even_when_provider_returns_twenty(self):
        with patch.object(generator, "llm", RunnableLambda(lambda _: '["Q"]'[:-1] + ',"Q"' * 19 + ']')):
            questions = await generator.generate_questions("Software", "Desarrollador Junior HTML")
        self.assertEqual(len(questions), 15)

    async def test_A24_short_provider_response_gets_all_categories(self):
        with patch.object(generator, "llm", RunnableLambda(lambda _: '[]')):
            questions = await generator.generate_questions("Software", "Desarrollador Junior HTML")
        self.assertEqual(len(questions), 15)
        self.assertEqual([q["category"] for q in questions].count("technical"), 8)
        self.assertEqual([q["category"] for q in questions].count("psychological"), 3)
        self.assertEqual([q["category"] for q in questions].count("teamwork"), 2)
        self.assertEqual([q["category"] for q in questions].count("open"), 2)

class PracticalResultTest(unittest.TestCase):
    def setUp(self):
        self.state = SessionState("observations-practical", "candidate", "job", "software", "Desarrollador Junior HTML")
        app = FastAPI(); app.include_router(practical.router)
        self.client = TestClient(app)
        for name, value in [("get_session", AsyncMock(return_value=self.state)),
                            ("update_session", AsyncMock()),
                            ("evaluate_practical_interview", AsyncMock(return_value={"score":22,"passed":False,"summary":"Desaprobado"}))]:
            patcher = patch.object(practical, name, value); patcher.start(); self.addCleanup(patcher.stop)
        patcher = patch.dict("os.environ", {"COMPANY_REPORT_EMAIL":""}); patcher.start(); self.addCleanup(patcher.stop)
        self.addCleanup(practical._runtime_sessions.pop, self.state.session_id, None)

    def test_A17_A18_result_unavailable_until_agent_finishes_and_does_not_trust_caller_score(self):
        self.assertEqual(self.client.get("/practical-interview/result/"+self.state.session_id).status_code,409)
        self.client.post("/practical-interview/start",json={"session_id":self.state.session_id,"career":"software","job_title":self.state.job_title})
        response = self.client.post("/practical-interview/finish",json={"session_id":self.state.session_id,"workspace_type":"coding","transcript":[],"workspace_state":{},"violations":0,"score":100})
        self.assertEqual(response.status_code,200,response.text)
        self.assertEqual(self.state.stage,InterviewStage.FAILED)
        self.assertEqual(self.client.get("/practical-interview/result/"+self.state.session_id).json()["score"],22)

    def test_A25_html_developer_creates_coding_challenge_using_job_title(self):
        area = infer_workspace_type("software",self.state.job_title)
        self.assertEqual(area,PracticalWorkspaceType.CODING)
        response=self.client.post("/practical-interview/start",json={"session_id":self.state.session_id,"career":"software","job_title":self.state.job_title})
        self.assertEqual(response.status_code,200,response.text)
        self.assertIn("HTML",str(response.json()["challenge"]))
