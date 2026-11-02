import base64
import hashlib
import hmac
import json
import time
import unittest
from unittest.mock import patch
from fastapi import HTTPException
from shared.agent_access import session_grant
from practical_voice.workspace import infer_workspace_type, build_workspace_challenge
from practical_voice.autonomous_agent import _workspace_evidence, _apply_evidence_caps, _evaluation_rules
from types import SimpleNamespace
from unittest.mock import AsyncMock
from practical_voice import router as practical
from practical_voice.schemas import PracticalSessionStartRequest


class RoleChallengeTest(unittest.IsolatedAsyncioTestCase):
    def test_vacancy_language_wins_over_candidate_career_and_generic_template(self):
        from practical_voice.schemas import PracticalWorkspaceType
        for title, requirements, language in [
            ("Desarrollador Java", "React, TypeScript", "java"),
            ("Desarrollador backend", "Java y Spring Boot", "java"),
            ("Desarrollador backend", "TypeScript", "typescript"),
            ("Desarrollador JavaScript", "JavaScript", "javascript"),
            ("Desarrollador Java y Python", "Python", "java"),
            ("Desarrollador Python", "Java", "python"),
            ("Desarrollador fullstack", "TypeScript, SQL", "typescript"),
            ("Desarrollador React con TypeScript", "React", "typescript"),
            ("Desarrollador Node.js TypeScript", "Node.js", "typescript"),
            ("Desarrollador C#", ".NET", "csharp"),
            ("Desarrollador Go", "Go", "go"),
            ("Desarrollador PHP", "PHP", "php"),
            ("Desarrollador Ruby", "Ruby", "ruby"),
            ("Desarrollador de datos PostgreSQL", "SQL", "postgresql"),
            ("Desarrollador MongoDB", "MongoDB", "mongodb"),
        ]:
            with self.subTest(title=title):
                case = build_workspace_challenge(PracticalWorkspaceType.CODING, "Java", title,
                                                 "Puesto profesional", requirements)
                self.assertEqual(case["language"], language)
                if language == "typescript" and case.get("files"):
                    self.assertTrue(any(f["path"].endswith(".ts") for f in case["files"]))
                if title == "Desarrollador fullstack" and language == "typescript":
                    self.assertEqual(case["function_name"], "buildPipelineSummary")

    async def test_start_uses_vacancy_requirements_for_language_and_keeps_normal_twenty_minutes(self):
        with patch.object(practical, "get_session", AsyncMock(return_value=None)), patch.object(practical, "update_session", AsyncMock()):
            result = await practical.start_practical_interview(PracticalSessionStartRequest(
                session_id="requirements-java", career="TypeScript", job_title="Desarrollador backend",
                job_requirements="Java, Spring Boot y PostgreSQL"))
            self.assertEqual(result.challenge["language"], "java")
            self.assertEqual(result.time_limit_minutes, 20)

    async def test_presentation_never_replaces_role_challenge_with_calculator(self):
        request = SimpleNamespace(state=SimpleNamespace(grant={"presentation": {
            "case_code": "java_calculator", "time_limit_minutes": 5}}))
        for title in ("Especialista de marketing digital", "Asesor legal", "Analista contable", "Desarrollador Java"):
            with self.subTest(title=title), patch.object(practical, "get_session", AsyncMock(return_value=None)), patch.object(practical, "update_session", AsyncMock()):
                expected_type = infer_workspace_type("", title)
                expected = build_workspace_challenge(expected_type, "", title)
                result = await practical.start_practical_interview(PracticalSessionStartRequest(
                    session_id="role-check-"+title, career="", job_title=title), request)
                self.assertEqual(result.workspace_type, expected_type)
                self.assertEqual(result.challenge["title"], expected["title"])
                self.assertNotIn("Calculadora", result.challenge["title"])
                self.assertEqual(result.time_limit_minutes, 5)


class PresentationPolicyTest(unittest.TestCase):
    def token(self, session_id="one", expires=None):
        body = {"session_id": session_id, "exp": expires or time.time()+60, "presentation": {"question_count": 3}}
        payload = base64.urlsafe_b64encode(json.dumps(body).encode()).decode().rstrip("=")
        signature = base64.urlsafe_b64encode(hmac.new(b"test-secret", payload.encode(), hashlib.sha256).digest()).decode().rstrip("=")
        return payload+"."+signature

    def test_session_grant_is_bound_to_session_and_expiry(self):
        with patch.dict("os.environ", {"AGENT_SHARED_SECRET": "test-secret"}):
            self.assertEqual(session_grant(self.token(), "one")["presentation"]["question_count"], 3)
            for token, session in [(self.token(), "two"), (self.token(expires=1), "one"), (self.token()+"x", "one")]:
                with self.assertRaises(HTTPException): session_grant(token, session)

    def test_professional_fields_do_not_become_coding_due_to_generic_words(self):
        for career, title, expected in [
            ("Marketing", "Desarrollo de campañas y CRM", "simulation"),
            ("Ingeniería de sistemas", "Especialista de marketing", "simulation"),
            ("Derecho", "Asesor legal de tecnología", "document_review"),
            ("Contabilidad", "Analista contable de sistemas financieros", "case_study"),
            ("Software", "Programador Java Junior", "coding"),
        ]:
            self.assertEqual(infer_workspace_type(career, title).value, expected, title)

    def test_professional_case_can_score_above_75_without_code_or_compilation(self):
        for kind, career, title in [("simulation", "Marketing", "Marketing"), ("document_review", "Derecho", "Abogado"), ("case_study", "Contabilidad", "Contador")]:
            from practical_voice.schemas import PracticalWorkspaceType
            case = build_workspace_challenge(PracticalWorkspaceType(kind), career, title)
            case["workspace_type"] = kind
            evidence = _workspace_evidence({"notes": "Analisis profesional documentado, con supuestos, propuesta, controles y validacion de resultados. "*4}, case, [])
            self.assertEqual(_apply_evidence_caps(90, evidence), 90)
            self.assertIn("NO informatico", _evaluation_rules(case))
