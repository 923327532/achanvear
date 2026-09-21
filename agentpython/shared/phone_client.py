import httpx
import os
from typing import Dict

VAPI_API_KEY = os.getenv("VAPI_API_KEY")
VAPI_URL = "https://api.vapi.ai/call"

async def start_phone_interview(candidate_phone: str, agent_profile: str):
    """
    Llama al candidato (Vapi AI)
    """
    payload = {
        "phoneNumber": candidate_phone,
        "assistantId": f"achanvear_{agent_profile}",  # Carlos/Ana/etc
        "metadata": {"session_id": "sess123"}
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            VAPI_URL,
            json=payload,
            headers={"Authorization": f"Bearer {VAPI_API_KEY}"}
        )
    
    return resp.json()
