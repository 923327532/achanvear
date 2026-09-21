import httpx
import os

VAPI_KEY = os.getenv("VAPI_API_KEY")

@app.post("/vapi/call/{session_id}")
async def start_vapi_call(session_id: str, phone: str):
    session = await SessionManager.get(session_id)
    profile = session["profile"]
    
    payload = {
        "phoneNumber": phone,
        "name": "Achanvear Interview",
        "voiceId": profile["voice_id"],
        "firstMessage": f"Hola {session['candidate_name']}, soy {profile['name']}. Comencemos entrevista.",
        "transcriber": "deepgram",
        "llm": {"provider": "openai", "model": "gpt-4o-mini"}
    }
    
    resp = await httpx.post("https://api.vapi.ai/call", json=payload,
                           headers={"Authorization": f"Bearer {VAPI_KEY}"})
    
    return {"vapi_call_id": resp.json()["id"]}