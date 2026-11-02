"""Run inside the isolated local agent; one real provider clarification, no evaluation or email."""
import asyncio
import json
import uuid
import httpx
import websockets


async def main():
    session = "local-dialogue-" + uuid.uuid4().hex
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post("http://127.0.0.1:8001/practical-interview/start", json={
            "session_id": session, "career": "Software", "job_title": "Python Junior",
            "candidate_name": "Prueba local", "job_description": "API de inventario", "job_requirements": "Python y SQL",
            "interviewer_code": "PROFILE_2", "interviewer_name": "Ana Quispe", "interviewer_style": "Amigable"})
        response.raise_for_status()
        assert response.json()["challenge"]["language"] == "python"
    async with websockets.connect(f"ws://127.0.0.1:8001/practical-interview/ws/{session}") as socket:
        async def receive_turn():
            phase, text = None, ""
            while True:
                message = json.loads(await asyncio.wait_for(socket.recv(), 60))
                if message.get("type") == "agent_text": text = message["text"]
                if message.get("type") == "conversation_phase": phase = message["phase"]
                if message.get("type") in ("agent_audio", "tts_unavailable"): return phase, text
        await receive_turn()
        for text, expected in [("Si, soy la persona registrada", "rules"), ("Si, entiendo las reglas", "experience"),
                               ("He desarrollado funciones Python y consultas SQL para inventarios", "case_ready")]:
            await socket.send(json.dumps({"type": "candidate_text", "text": text, "message_id": uuid.uuid4().hex}))
            phase, _ = await receive_turn()
            assert phase == expected, (phase, expected)
        await socket.send(json.dumps({"type": "candidate_text", "text": "¿Debo entregar un archivo Python o solamente una explicacion?", "message_id": uuid.uuid4().hex}))
        phase, answer = await receive_turn()
        assert phase == "case_ready"
        assert not answer.startswith("El objetivo del caso es:"), "No se obtuvo una aclaracion real del proveedor"
        assert "empecemos:" not in answer.lower() and "comienza ahora" not in answer.lower(), "La aclaracion no debe ordenar el inicio del caso"
        print("ACLARACION REAL:", answer)
        print("PASS: la IA responde la pregunta y mantiene el tiempo sin iniciar")
        await socket.send(json.dumps({"type": "candidate_text", "text": "Si, estoy listo para empezar el reto", "message_id": uuid.uuid4().hex}))
        phase, _ = await receive_turn()
        assert phase == "working"
        print("PASS: el caso comienza solo despues de confirmar explicitamente")


asyncio.run(main())
