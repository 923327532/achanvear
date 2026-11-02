import unittest
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch
from theory_interview.final_report import build_theory_report
from shared.session_orchestrator import SessionState


class FinalReportTest(unittest.IsolatedAsyncioTestCase):
    def test_exception_assertion_is_not_a_todo_and_duplicate_editor_content_is_not_counted_twice(self):
        from practical_voice.autonomous_agent import _workspace_evidence
        code = "try:\n    comprar(20)\nexcept ValueError:\n    pass\n# TODO validar producto inexistente"
        result = _workspace_evidence({"code": code, "files": [{"path": "test.py", "content": code}]}, {}, [])
        self.assertEqual(result["todo_count"], 1)
        without_todo = _workspace_evidence({"code": "try:\n    comprar(20)\nexcept ValueError:\n    pass"}, {}, [])
        self.assertEqual(without_todo["todo_count"], 0)
    def state(self):
        state = SessionState("report", "candidate", "job", "Software", "Python Junior")
        state.questions = [{"text": "Explica las transacciones"}, {"text": "Explica un rollback"}]
        state.answers = ["Usaría una transacción atómica", "Revertiría los cambios"]
        state.scores = [80, 60]
        return state

    async def test_narrative_cannot_replace_scores_and_preserves_evidence(self):
        model = AsyncMock(return_value=SimpleNamespace(content=json.dumps({
            "summary": "Identifica atomicidad y reversión.", "strengths": ["Describe atomicidad"],
            "risks": ["Falta un ejemplo"], "recommendation": "Revisar un caso aplicado", "score": 100})))
        with patch("theory_interview.final_report.llm", SimpleNamespace(ainvoke=model)):
            result = await build_theory_report(self.state())
        self.assertEqual(result["score"], 70)
        self.assertFalse(result["passed"])
        self.assertEqual(result["evidence"][1]["answer"], "Revertiría los cambios")
        self.assertEqual(result["generation_status"], "generated")

    async def test_provider_failure_preserves_results_without_inventing_strengths(self):
        with patch("theory_interview.final_report.llm", SimpleNamespace(ainvoke=AsyncMock(side_effect=RuntimeError("offline")))):
            result = await build_theory_report(self.state())
        self.assertEqual(result["score"], 70)
        self.assertEqual(result["strengths"], [])
        self.assertEqual(result["generation_status"], "manual_review")

    async def test_structured_provider_findings_preserve_text_and_supporting_evidence(self):
        content = json.dumps({"summary": "Atomicidad explicada", "strengths": [{"detalle": "Describe transacciones", "evidencia": "transaccion atomica"}], "risks": [], "recommendation": "Revisar ejemplo"})
        with patch("theory_interview.final_report.llm", SimpleNamespace(ainvoke=AsyncMock(return_value=SimpleNamespace(content=content)))):
            result = await build_theory_report(self.state())
        self.assertEqual(result["generation_status"], "generated")
        self.assertIn("transaccion atomica", result["strengths"][0])

    async def test_invalid_model_payload_requires_review(self):
        with patch("theory_interview.final_report.llm", SimpleNamespace(ainvoke=AsyncMock(return_value=SimpleNamespace(content='{"summary":"x","strengths":"invented"}')))):
            result = await build_theory_report(self.state())
        self.assertEqual(result["generation_status"], "manual_review")

    async def test_theory_report_survives_session_roundtrip(self):
        state = self.state()
        state.theory_evaluation = {"summary": "Evidencia conservada", "score": 70}
        restored = SessionState.from_dict(state.to_dict())
        self.assertEqual(restored.theory_evaluation, state.theory_evaluation)


if __name__ == "__main__": unittest.main()
