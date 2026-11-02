"""Regression evidence against achanvear-local only. Never sends real payments or email."""
import json
import uuid
import urllib.request
import base64
import hashlib
import hmac
import re
import secrets
import struct
import time
from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec

ROOT = Path(__file__).resolve().parent.parent
spec = spec_from_file_location("local_smoke", ROOT / "scripts/validate-docker-local.py")
local = module_from_spec(spec)
spec.loader.exec_module(local)
request, sql, quote = local.request, local.sql, local.quote


def main():
    accounts = json.loads((ROOT / ".env.docker.smoke.json").read_text(encoding="utf-8"))
    tokens = {key: request("POST", "/auth/login", {"email": value["email"], "password": value["password"]})["accessToken"]
              for key, value in accounts.items()}
    company, worker = accounts["company"], accounts["professional"]
    client, professional = tokens["company"], tokens["professional"]
    sql("CREATE EXTENSION IF NOT EXISTS pgcrypto")
    evidence = []

    def passed(number, description):
        evidence.append({"observacion": number, "resultado": "PASS", "prueba": description})
        print(f"PASS {number}: {description}")

    assert int(sql("SELECT max(version::int) FROM flyway_schema_history WHERE success")) >= 77
    assert request("GET", "/actuator/health")["status"] == "UP"
    service = request("POST", "/services?publish=true", {
        "title": "Validacion hallazgos " + uuid.uuid4().hex[:8], "description": "Servicio ficticio local para validar la formalizacion en soles.",
        "category": "DESIGN", "basePrice": 100, "deliveryDays": 3, "currency": "PEN"}, professional, expected=201)
    conversation = request("POST", "/chat/conversations", {"freelancerUserId": worker["id"]}, client, expected=(200, 201))
    request("POST", f"/services/conversations/{conversation['id']}/origins/{service['id']}", token=client)
    contract = request("POST", "/services/contracts", {"conversationId": conversation["id"], "serviceId": service["id"], "planId": None,
        "idempotencyKey": str(uuid.uuid4())}, client)
    assert contract["currency"] == "PEN"
    passed(1, "Contrato PEN formalizado mediante API, sin generar cobros")

    profile = request("GET", "/freelance/profiles/me", token=professional)
    if not profile.get("id"):
        profile = request("POST", "/freelance/profiles", {"name": "Profesional de prueba local", "industry": "Software", "specialty": "Python",
            "biography": "Profesional ficticio para pruebas locales de regresion.", "achievements": "Pruebas locales", "paymentMethodType": "BANK_TRANSFER",
            "dni": "87654321", "certifications": []}, professional, expected=201)
    portfolio = "https://github.com/validation-local/portfolio"
    request("PUT", f"/freelance/profiles/{profile['id']}", {"portfolioItems": [{"title": "Portafolio 1", "description": "Portafolio profesional de prueba local",
        "assetUrl": None, "projectUrl": portfolio}]}, professional)
    assert request("GET", "/freelance/profiles/me", token=professional)["portfolioItems"][0]["projectUrl"] == portfolio
    passed(6, "Portafolio guardado por el endpoint persistente y recuperado por un GET nuevo")
    certificate = {"name": "Certificado editado local", "issuingOrganization": "Pruebas", "credentialUrl": "https://example.invalid/certificate"}
    request("PUT", f"/freelance/profiles/{profile['id']}", {"certifications": [certificate]}, professional)
    assert request("GET", "/freelance/profiles/me", token=professional)["certifications"][0]["name"] == certificate["name"]
    passed(7, "Certificado editado y recuperado desde el backend")

    # Independent local fixture exercises proposals without publishing or purchasing a plan.
    project = {"id": str(uuid.uuid4()), "title": "Proyecto hallazgos " + uuid.uuid4().hex[:8]}
    sql(f"INSERT INTO freelance_projects(id,client_user_id,title,description,category,budget,estimated_days,status,created_at,updated_at,currency,min_budget,max_budget) VALUES({quote(project['id'])},{quote(company['id'])},{quote(project['title'])},'Proyecto ficticio para validar propuestas locales','TECHNOLOGY',3000,10,'OPEN',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'PEN',3000,7000)")
    submitted = request("POST", f"/freelance/projects/{project['id']}/proposals", {"coverLetter": "Experiencia suficiente para ejecutar el proyecto y entregar todos sus resultados con evidencia verificable de las pruebas realizadas.",
        "proposedBudget": 5000, "estimatedDays": 10, "portfolioUrl": portfolio}, professional, expected=(200, 201))
    received = request("GET", f"/freelance/projects/{project['id']}", token=client)
    proposal = next(p for p in received["proposals"] if p["freelancerUserId"] == worker["id"])
    assert proposal["portfolioUrl"] == portfolio
    assert proposal["freelancerName"]
    passed(5, "La Empresa recupera el enlace de portafolio enviado en la propuesta")
    accepted = request("POST", f"/freelance/projects/{project['id']}/proposals/{proposal['id']}/accept", token=client)
    fetched = request("GET", f"/freelance/projects/{project['id']}", token=client)
    assert float(fetched["budget"]) == 5000
    assert next(p for p in fetched["proposals"] if p["status"] == "ACCEPTED")["freelancerName"]
    passed(2, "Rango 3000-7000 y propuesta 5000: presupuesto persistido 5000")
    passed(3, "Propuesta aceptada devuelve el nombre real del profesional")
    notifications = request("GET", "/notifications/in-app", token=professional)
    assert any(project["title"] in n["message"] and "seleccion" in n["title"].lower() for n in notifications)
    passed(10, "La seleccion genera una notificacion persistente para el profesional")

    plan = request("GET", "/payments/plans/current", token=client)
    assert plan["planType"] == "FREE", "This test requires the local FREE account"
    request("GET", "/companies/agent-settings", token=client, expected=403)
    request("PATCH", "/companies/agent-settings", {"selectedAgentId": "ana"}, client, expected=403)
    passed(13, "FREE: GET y PATCH de agentes rechazados por HTTP 403 en backend")

    job = str(uuid.uuid4())
    sql(f"INSERT INTO job_posts(id,company_id,title,description,requirements,location,job_type,salary_min,salary_max,currency,vacancies,status,created_at,updated_at,selection_mode,automation_level) VALUES({quote(job)},{quote(company['companyId'])},'Python Junior local','Desarrollo de una API de inventario para validacion local','Python y SQL','Lima','FULL_TIME',3000,7000,'PEN',1,'PUBLISHED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'CONTINUOUS','MANUAL')")
    request("GET", f"/jobs/{job}/automation", token=client, expected=403)
    request("PUT", f"/jobs/{job}/automation", {"automationLevel": "FULLY_AUTOMATED", "autoSendInterviewInvites": True}, client, expected=403)
    request("POST", f"/jobs/{job}/apply", {"coverLetter": "Postulacion local para verificar seleccion manual sin IA"}, professional)
    application = sql(f"SELECT id FROM job_applications WHERE job_post_id={quote(job)} AND candidate_user_id={quote(worker['id'])}")
    manual = request("POST", f"/jobs/{job}/applicants/{application}/advance", {"action": "ADVANCE"}, client)
    assert manual["applicationStatus"] == "HIRED"
    assert sql(f"SELECT count(*) FROM hiring_processes WHERE job_id={quote(job)}") == "0"
    passed(13, "FREE: automatizacion rechazada; aprobacion manual HIRED sin crear proceso de entrevistas")
    request("POST", "/interviews/schedule/generate", {"hiringProcessId": str(uuid.uuid4()), "candidateId": worker["id"],
        "jobId": job, "interviewType": "THEORY", "candidateName": "Prueba local", "jobTitle": "Python Junior local"}, client, expected=403)
    passed(13, "FREE: generacion directa de horarios rechazada antes de crear entrevista o enviar correo")

    interview = str(uuid.uuid4())
    reason = "Entrevista cancelada por permanecer fuera de la pantalla 30 segundos."
    sql(f"INSERT INTO interviews(id,hiring_process_id,candidate_id,interview_type,status,interviewer_name,interviewer_voice,created_at,updated_at) VALUES({quote(interview)},{quote(job)},{quote(worker['id'])},'TECHNICAL','IN_PROGRESS','Ana Quispe','FEMALE1',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)")
    request("POST", f"/interviews/{interview}/abort", {"reason": reason}, professional)
    history = request("GET", f"/interviews/my?candidateId={worker['id']}", token=professional)
    item = next(i for i in history if i["interviewId"] == interview)
    assert item["position"] == "Python Junior local"
    assert item["company"] == "Empresa Docker Local"
    assert item["abortReason"] == reason
    assert item["status"] == "ABORTED"
    passed(16, "Historial recupera el empleo y la empresa reales desde la base")
    passed(18, "Cancelacion por 30 segundos conserva el motivo tras guardar y volver a consultar")

    preferences = {"availabilityStatus": "OPEN_TO_OFFERS", "cvVisibility": "VERIFIED_COMPANIES_ONLY", "preferredCurrency": "PEN",
        "language": "es-PE", "timezone": "UTC-5", "notificationPreferences": '{"new_job":true,"interview":true,"payment":false,"match":false}'}
    request("PUT", f"/freelance/profiles/{profile['id']}", preferences, professional)
    reloaded = request("GET", "/freelance/profiles/me", token=professional)
    assert all(reloaded[k] == v for k, v in preferences.items())
    request("PATCH", "/companies/preferences", {"language": "es-PE", "timezone": "UTC-5"}, client)
    assert request("GET", "/companies/preferences", token=client)["timezone"] == "UTC-5"
    privacy = {"incognitoMode": False, "showContactInfo": False, "showInDirectory": True, "visibilityNotifications": False}
    request("PUT", "/companies/privacy-settings", privacy, client)
    assert request("GET", "/companies/privacy-settings", token=client) == privacy
    request("GET", "/companies/collaborators", token=client)
    request("GET", "/auth/2fa/status", token=client)
    request("GET", "/auth/2fa/status", token=professional)
    passed(14, "Preferencias de ambos perfiles guardadas y leidas de nuevo; equipo y estado 2FA consultables. Los efectos se auditan por separado")
    for role, token in (("company", client), ("professional", professional)):
        account = accounts[role]
        try:
            setup = request("POST", "/auth/2fa/enable", token=token)
            assert re.fullmatch(r"[A-Z2-7]{32}", setup["secret"])
            assert not request("GET", "/auth/2fa/status", token=token)["enabled"]
            assert not request("POST", "/auth/2fa/verify", {"code": "xxxxxx"}, token)["verified"]
            key = base64.b32decode(setup["secret"])
            digest = hmac.new(key, struct.pack(">Q", int(time.time()) // 30), hashlib.sha1).digest()
            offset = digest[-1] & 15
            code = f"{(int.from_bytes(digest[offset:offset+4], 'big') & 0x7fffffff) % 1000000:06d}"
            assert request("POST", "/auth/2fa/verify", {"code": code}, token)["verified"]
            assert request("GET", "/auth/2fa/status", token=token)["enabled"]
            challenge = request("POST", "/auth/login", {"email": account["email"], "password": account["password"]})
            assert challenge["tokenType"] == "2FA_REQUIRED"
            completed = request("POST", "/auth/2fa/complete-login", {"tempToken": challenge["accessToken"], "code": code})
            assert completed["accessToken"] and completed["tokenType"] == "Bearer"
            assert request("GET", "/auth/me", token=completed["accessToken"])["id"] == account["id"]
        finally:
            request("POST", "/auth/2fa/disable", token=token)
        assert not request("GET", "/auth/2fa/status", token=token)["enabled"]
        changed = "Local!" + secrets.token_hex(16) + "A9"
        try:
            request("POST", "/auth/change-password", {"currentPassword": account["password"], "newPassword": changed}, token)
            assert request("POST", "/auth/login", {"email": account["email"], "password": changed})["accessToken"]
            request("POST", "/auth/login", {"email": account["email"], "password": account["password"]}, expected=(400, 401, 403))
        finally:
            sql(f"UPDATE users SET password_hash=crypt({quote(account['password'])},gen_salt('bf',10)) WHERE id={quote(account['id'])}")
    passed(14, "Empresa y Profesional: 2FA Base32 verificado, login exige TOTP, desactivacion efectiva y cambio de contrasena probado/restaurado")

    cv_url = "https://example.invalid/00000000-0000-4000-8000-000000000001-CV_Local.pdf"
    request("PUT", f"/freelance/profiles/{profile['id']}", {"curriculumUrl": cv_url, "cvVisibility": "PRIVATE"}, professional)
    assert request("GET", "/freelance/profiles/me", token=professional)["curriculumUrl"] == cv_url
    assert request("GET", f"/freelance/profiles/{profile['id']}", token=client)["curriculumUrl"] is None
    assert request("GET", f"/profiles/by-user/{worker['id']}", token=client)["curriculumUrl"] is None
    request("PUT", f"/freelance/profiles/{profile['id']}", {"cvVisibility": "VERIFIED_COMPANIES_ONLY"}, professional)
    assert request("GET", f"/freelance/profiles/{profile['id']}", token=client)["curriculumUrl"] == cv_url
    passed(14, "CV privado oculto para la Empresa por ambos endpoints; propietario conserva acceso; empresa verificada puede verlo al permitirlo")

    request("PUT", f"/freelance/profiles/{profile['id']}", {"availabilityStatus": "NOT_AVAILABLE"}, professional)
    assert all(p["userId"] != worker["id"] for p in request("GET", "/profiles?size=100", token=client)["items"])
    request("PUT", f"/freelance/profiles/{profile['id']}", {"availabilityStatus": "OPEN_TO_OFFERS"}, professional)
    assert any(p["userId"] == worker["id"] for p in request("GET", "/profiles?size=100", token=client)["items"])
    passed(14, "Disponibilidad cambia realmente la inclusion del profesional en busquedas")

    notification_key = "settings-test:" + uuid.uuid4().hex
    sql(f"INSERT INTO in_app_notifications(user_id,category,title,message,event_key) VALUES({quote(worker['id'])},'PAYMENT','Pago local de prueba','Sin cobro real',{quote(notification_key)})")
    assert all(n["category"] != "PAYMENT" for n in request("GET", "/notifications/in-app", token=professional))
    request("PUT", f"/freelance/profiles/{profile['id']}", {"notificationPreferences": '{"new_job":true,"interview":true,"payment":true,"match":true}'}, professional)
    assert any(n["title"] == "Pago local de prueba" for n in request("GET", "/notifications/in-app", token=professional))
    passed(14, "Activar/desactivar avisos de pago cambia realmente las notificaciones visibles")

    assert request("GET", f"/companies/public/{company['companyId']}", token=professional)["email"] is None
    privacy.update(showContactInfo=True, visibilityNotifications=True, incognitoMode=True)
    request("PUT", "/companies/privacy-settings", privacy, client)
    assert request("GET", f"/companies/public/{company['companyId']}", token=professional)["email"] == company["email"]
    assert any(n["title"] == "Tu perfil fue consultado" for n in request("GET", "/notifications/in-app", token=client))
    assert all(c["id"] != company["companyId"] for c in request("GET", "/companies?size=100", token=client)["items"])
    privacy.update(incognitoMode=False, showInDirectory=True, visibilityNotifications=False)
    request("PUT", "/companies/privacy-settings", privacy, client)
    assert any(c["id"] == company["companyId"] for c in request("GET", "/companies?size=100", token=client)["items"])
    passed(14, "Privacidad Empresa: contacto visible/oculto, alerta de visita y modo incognito con efecto en directorio")

    # A paid-plan fixture tests agent selection without invoking a payment provider.
    subscription = str(uuid.uuid4())
    original_agent = sql(f"SELECT COALESCE(ai_agent_id,'carlos') FROM companies WHERE id={quote(company['companyId'])}")
    original_threshold = sql(f"SELECT COALESCE(match_score_threshold,70) FROM companies WHERE id={quote(company['companyId'])}")
    sql(f"INSERT INTO subscriptions(id,company_user_id,plan,status,start_date,end_date) VALUES({quote(subscription)},{quote(company['id'])},'BASIC','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP+INTERVAL '1 day')")
    practical_id = None
    try:
        request("PATCH", "/companies/agent-settings", {"selectedAgentId": "ana", "matchScoreThreshold": 75}, client)
        assert request("GET", "/companies/agent-settings", token=client)["selectedAgentId"] == "ana"
        sql(f"UPDATE job_applications SET screening_score=82 WHERE id={quote(application)}")
        notice = sql(f"SELECT id FROM in_app_notifications WHERE user_id={quote(company['id'])} AND event_key={quote('application:' + application)}")
        request("PATCH", "/companies/agent-settings", {"matchScoreThreshold": 95}, client)
        assert all(n["id"] != notice for n in request("GET", "/notifications/in-app", token=client))
        request("PATCH", "/companies/agent-settings", {"matchScoreThreshold": 50}, client)
        assert any(n["id"] == notice for n in request("GET", "/notifications/in-app", token=client))
        passed(14, "Umbral de avisos IA: candidato con 82 se oculta con minimo 95 y se muestra con minimo 50")
        practical_id = str(uuid.uuid4())
        sql(f"INSERT INTO interviews(id,hiring_process_id,candidate_id,interview_type,status,interviewer_code,interviewer_name,interviewer_style,interviewer_voice,created_at,updated_at) VALUES({quote(practical_id)},{quote(job)},{quote(worker['id'])},'TECHNICAL','SCHEDULED','PROFILE_2','Ana Quispe','Amigable','FEMALE1',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)")
        context = request("GET", f"/interviews/{practical_id}/job-context", token=professional)
        assert context["interviewerCode"] == "PROFILE_2" and context["interviewerName"] == "Ana Quispe"
        body = {"session_id": practical_id, "career": "Software", "job_title": context["title"], "job_description": context["description"],
            "job_requirements": context["requirements"], "interviewer_code": context["interviewerCode"], "interviewer_name": context["interviewerName"],
            "interviewer_style": context["interviewerStyle"]}
        req = urllib.request.Request("http://127.0.0.1:8001/practical-interview/start", data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=30) as response:
            started = json.load(response)
        assert started["challenge"]["interviewer_profile"]["name"] == "Ana Quispe"
        assert started["challenge"]["language"] == "python"
        assert "Python y SQL" in started["challenge"]["prompt"]
        passed(19, "Empresa elige Ana por API; contexto y agente practico HTTP usan Ana Quispe (PROFILE_2)")
        passed(16, "Caso practico HTTP en Python incorpora los requisitos Python y SQL del empleo")
    finally:
        sql(f"DELETE FROM subscriptions WHERE id={quote(subscription)}; UPDATE companies SET ai_agent_id={quote(original_agent)},match_score_threshold={int(original_threshold)} WHERE id={quote(company['companyId'])}; UPDATE job_applications SET screening_score=NULL WHERE id={quote(application)}")
        if practical_id:
            sql(f"DELETE FROM interviews WHERE id={quote(practical_id)}")

    result = ROOT / "evidencias-hallazgos" / "api-local.json"
    result.parent.mkdir(exist_ok=True)
    result.write_text(json.dumps({"entorno": "achanvear-local", "pruebas": evidence}, indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
