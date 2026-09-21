# shared/n8n_client.py
import os
import httpx

EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL", "")
EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY", "")
EVOLUTION_INSTANCE = os.getenv("EVOLUTION_INSTANCE_NAME", "agent01")
MAILERLITE_API_KEY = os.getenv("MAILERLITE_API_KEY", "")


def notify_whatsapp(phone: str, message: str) -> bool:
    if not EVOLUTION_API_URL or not EVOLUTION_API_KEY:
        print(f"[WhatsApp SKIP] No credentials. Message: {message}")
        return False
    try:
        url = f"{EVOLUTION_API_URL}/message/sendText/{EVOLUTION_INSTANCE}"
        headers = {"apikey": EVOLUTION_API_KEY, "Content-Type": "application/json"}
        payload = {
            "number": phone.replace("+", "").replace(" ", ""),
            "text": message
        }
        r = httpx.post(url, json=payload, headers=headers, timeout=10)
        return r.status_code == 201
    except Exception as e:
        print(f"[WhatsApp ERROR] {e}")
        return False


def notify_email(to_email: str, subject: str, html_content: str) -> bool:
    if not MAILERLITE_API_KEY:
        print(f"[Email SKIP] No credentials. Subject: {subject}")
        return False
    try:
        r = httpx.post(
            "https://connect.mailerlite.com/api/campaigns",
            headers={
                "Authorization": f"Bearer {MAILERLITE_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "name": subject,
                "type": "regular",
                "emails": [{"subject": subject, "from_name": "Achanvear", "from": "noreply@achanvear.pe"}]
            },
            timeout=10
        )
        return r.status_code in [200, 201]
    except Exception as e:
        print(f"[Email ERROR] {e}")
        return False
