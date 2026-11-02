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
