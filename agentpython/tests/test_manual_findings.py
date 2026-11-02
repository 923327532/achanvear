import unittest
from unittest.mock import AsyncMock, patch
from practical_voice.onboarding import confirmed, advance_onboarding
from practical_voice import router as practical
from practical_voice.schemas import PracticalSessionStartRequest


class ManualFindingsTest(unittest.IsolatedAsyncioTestCase):
    def test_questions_do_not_confirm_the_start_of_the_case(self):
        for text in ["¿Si uso Python, está bien?", "Puedo usar una lista?", "Qué debo entregar", "No estoy listo"]:
            self.assertFalse(confirmed(text), text)
            runtime = {"conversation_phase": "case_ready", "challenge": {"prompt": "API para el empleo Python"}}
            advance_onboarding(runtime, text)
            self.assertEqual(runtime["conversation_phase"], "case_ready")
        self.assertTrue(confirmed("Sí, estoy listo, empecemos"))

    async def test_preparation_questions_receive_answers_without_starting_the_clock(self):
        runtime = {"conversation_phase": "case_ready", "challenge": {"prompt": "API Python"}, "transcript": []}
        socket = AsyncMock()
        with patch.object(practical, "generate_interviewer_reply", AsyncMock(return_value="Entrega el archivo indicado.")), \
             patch.object(practical, "safe_tts", AsyncMock(return_value=None)):
            await practical.handle_candidate_turn(socket, runtime, "¿Qué archivo entrego?")
        self.assertEqual(runtime["conversation_phase"], "case_ready")
        self.assertTrue(any("Entrega el archivo" in str(call) for call in socket.send_json.call_args_list))
        self.assertFalse(any(call.args[0].get("phase") == "working" for call in socket.send_json.call_args_list))

    async def test_selected_company_agent_and_job_context_reach_the_practical_challenge(self):
        with patch.object(practical, "get_session", AsyncMock(return_value=None)), patch.object(practical, "update_session", AsyncMock()):
            result = await practical.start_practical_interview(PracticalSessionStartRequest(
                session_id="manual-findings-agent", career="Software", job_title="Python Junior",
                job_description="API de inventario", job_requirements="Python y SQL",
                interviewer_code="PROFILE_2", interviewer_name="Ana Quispe", interviewer_style="Amigable"))
        self.assertEqual(result.challenge["interviewer_profile"]["name"], "Ana Quispe")
        self.assertEqual(result.challenge["interviewer_profile"]["id"], "PROFILE_2")
        self.assertEqual(result.challenge["job_requirements"], "Python y SQL")
        self.assertEqual(result.challenge["language"], "python")
        self.assertIn("API de inventario", result.challenge["prompt"])
        self.assertEqual(practical._runtime_sessions.pop("manual-findings-agent")["job_title"], "Python Junior")
