"""Real Edge UI checks against localhost:3000 and the isolated local API."""
import json
import re
import os
from datetime import datetime, timezone
from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parent.parent
spec = spec_from_file_location("local_smoke", ROOT / "scripts/validate-docker-local.py")
local = module_from_spec(spec)
spec.loader.exec_module(local)
FRONTEND = os.getenv("FINDINGS_FRONTEND_URL", "http://localhost:3000").rstrip("/")
assert FRONTEND in ("http://localhost:3000", "http://localhost:3001"), "Solo se permiten las vistas locales aisladas"
OUT = ROOT / "evidencias-hallazgos"
OUT.mkdir(exist_ok=True)


def main():
    accounts = json.loads((ROOT / ".env.docker.smoke.json").read_text())
    tokens = {role: local.request("POST", "/auth/login", {"email": account["email"], "password": account["password"]})["accessToken"]
              for role, account in accounts.items()}
    results = []
    conversation = local.request("POST", "/chat/conversations", {"freelancerUserId": accounts["professional"]["id"]}, tokens["company"], expected=(200, 201))
    local.request("POST", "/chat/messages", {"conversationId": conversation["id"], "content": "Mensaje local para comprobar la burbuja sin leer"}, tokens["company"], expected=(200, 201))
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 768})
        context.add_init_script("localStorage.setItem('achanvear_auth_token', " + json.dumps(tokens["professional"]) + ")")
        page = context.new_page()
        page.goto(FRONTEND + "/freelancer/profile")
        expect(page.get_by_role("heading", name="Certificaciones", exact=True)).to_be_visible(timeout=90000)
        expect(page.get_by_role("link", name=re.compile(r"^Mensajes\s+\d+"))).to_be_visible(timeout=15000)
        results.append({"observacion": 11, "resultado": "PASS", "prueba": "Mensaje real de la Empresa genera burbuja sin leer en el menu del Profesional"})
        expect(page.get_by_role("heading", name="Evaluaciones de Agentes IA")).to_have_count(0)
        results.append({"observacion": 8, "resultado": "PASS", "prueba": "Perfil real sin evaluaciones ficticias"})
        expect(page.get_by_text("CV_Local.pdf", exact=True)).to_be_visible()
        expect(page.get_by_text("Fecha de actualización no registrada", exact=True)).to_be_visible()
        results.append({"observacion": 9, "resultado": "PASS", "prueba": "CV muestra nombre sin UUID y ausencia de fecha sin inventar una actualizacion"})
        section = page.locator("div.bg-white").filter(has=page.get_by_role("heading", name="Certificaciones", exact=True)).last
        section.get_by_role("button", name="Editar", exact=True).click()
        section.get_by_role("button", name=re.compile("Editar Certificado", re.I)).click()
        section.get_by_placeholder("Nombre del certificado", exact=True).fill("Certificado corregido en navegador")
        section.get_by_role("button", name="Aplicar cambios", exact=True).click()
        section.get_by_role("button", name="Guardar", exact=True).click()
        page.reload()
        expect(page.get_by_text("Certificado corregido en navegador", exact=True)).to_be_visible(timeout=30000)
        results.append({"observacion": 7, "resultado": "PASS", "prueba": "Editar, guardar y recargar certificado en Edge"})
        page.screenshot(path=str(OUT / "perfil-certificado.png"), full_page=True)

        page.goto(FRONTEND + "/freelancer/settings")
        page.get_by_role("button", name="Seguridad y Proctoring", exact=True).click()
        external_qr = []
        page.on("request", lambda request: external_qr.append(True) if "api.qrserver.com" in request.url else None)
        try:
            page.get_by_role("switch").click()
            qr = page.get_by_role("img", name="2FA QR Code", exact=True)
            expect(qr).to_be_visible(timeout=15000)
            assert qr.get_attribute("src").startswith("data:image/png;base64,")
            assert not external_qr
            results.append({"observacion": 14, "resultado": "PASS", "prueba": "QR de 2FA generado localmente en Edge; no se envia el secreto a un generador externo"})
        finally:
            local.request("POST", "/auth/2fa/disable", token=tokens["professional"])
        page.goto(FRONTEND + "/freelancer/settings")
        page.locator("select").nth(0).select_option("en-US")
        page.locator("select").nth(1).select_option("UTC-4")
        page.get_by_role("button", name="Guardar Cambios", exact=True).click()
        expect(page.get_by_role("button", name="Guardado", exact=True)).to_be_visible()
        page.reload()
        expect(page.locator("select").nth(0)).to_have_value("en-US")
        expect(page.locator("select").nth(1)).to_have_value("UTC-4")
        slot_time = datetime.now(timezone.utc).isoformat()

        page.route("**/interviews/my?*", lambda route: route.fulfill(json={"success": True, "data": [{
            "interviewId": "local-layout-check", "position": "Python Junior", "company": "Empresa local",
            "date": "2026-11-01", "time": "17:00", "scheduledAt": slot_time,
            "agent": "Ana Quispe", "status": "SCHEDULED", "interviewType": "THEORY", "score": None, "passed": False
        }]}))
        page.goto(FRONTEND + "/freelancer/interviews")
        expect(page.get_by_role("heading", name="Centro de Evaluación IA")).to_be_visible(timeout=60000)
        formatted = page.evaluate("iso => new Date(iso).toLocaleString('en-US', {timeZone:'Etc/GMT+4',weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})", slot_time)
        expect(page.get_by_text(formatted, exact=True)).to_be_visible()
        results.append({"observacion": 14, "resultado": "PASS", "prueba": "Formulario guarda formato en-US y UTC-4, sobrevive recarga y cambia la hora/fecha de entrevistas"})
        # Open the consent screen without submitting consent or contacting an AI provider.
        page.get_by_role("button", name="Iniciar Entrevista", exact=True).click()
        page.locator("select").filter(has=page.locator("option[value='THEORY']")).select_option("THEORY")
        page.get_by_role("button", name="Iniciar Entrevista", exact=True).last.click()
        expect(page.get_by_text("Antes de comenzar necesitamos tu consentimiento informado")).to_be_visible(timeout=15000)
        cancel = page.get_by_role("button", name="Cancelar", exact=True).last
        cancel.scroll_into_view_if_needed()
        box = cancel.bounding_box()
        assert box and 0 <= box["y"] and box["y"] + box["height"] <= 768
        page.screenshot(path=str(OUT / "consentimiento-1366x768.png"))
        results.append({"observacion": 12, "resultado": "PASS", "prueba": "Consentimiento desplazable y Cancelar visible a 1366x768"})
        # Exercise automatic expiry with a controlled WebSocket and a simulated 20-minute clock.
        # This does not create an interview, submit a real evaluation or call an AI provider.
        page.route("**/interviews/my?*", lambda route: route.fulfill(json={"success": True, "data": [{
            "interviewId": "local-clock-check", "position": "Python Junior", "company": "Empresa local",
            "date": "2026-11-01", "time": "17:00", "scheduledAt": datetime.now(timezone.utc).isoformat(),
            "agent": "Ana Quispe", "status": "SCHEDULED", "interviewType": "TECHNICAL", "score": None, "passed": False}]}))
        page.route("**/interviews/local-clock-check/consent", lambda route: route.fulfill(json={"success": True, "data": {"readyToStart": True}}))
        page.route("**/interviews/local-clock-check/attendance", lambda route: route.fulfill(json={"success": True, "data": None}))
        page.route("**/interviews/local-clock-check/job-context", lambda route: route.fulfill(json={"success": True, "data": {
            "title": "Python Junior", "description": "API", "requirements": "Python", "candidateName": "Prueba local",
            "interviewerCode": "PROFILE_2", "interviewerName": "Ana Quispe", "interviewerStyle": "Amigable"}}))
        page.route("**/practical-interview/start", lambda route: route.fulfill(json={"session_id": "local-clock-check",
            "workspace_type": "case_study", "time_limit_minutes": 20, "websocket_url": "/practical-interview/ws/local-clock-check",
            "challenge": {"title": "Caso local", "prompt": "Analiza el caso", "workspace_tool": "case_notes", "interviewer_profile": {
                "id": "PROFILE_2", "name": "Ana Quispe", "role": "Entrevistadora", "voice": "es-PE-CamilaNeural", "gender": "female", "style": "Amigable"}}}))
        finished = []
        def finish(route):
            finished.append(route.request.post_data_json)
            route.fulfill(json={"session_id": "local-clock-check", "score": 80, "communication_score": 80, "passed": True,
                "summary": "Resultado simulado de prueba", "strengths": [], "risks": [], "recommendation": "Prueba", "next_action": "manual_review"})
        page.route("**/practical-interview/finish", finish)
        page.route("**/interviews/local-clock-check/complete", lambda route: route.fulfill(json={"success": True, "data": {}}))
        def socket(ws):
            ws.send(json.dumps({"type": "ready"}))
            ws.send(json.dumps({"type": "agent_text", "text": "Inicio del caso de prueba"}))
            ws.send(json.dumps({"type": "conversation_phase", "phase": "working"}))
        page.route_web_socket("**/practical-interview/ws/local-clock-check", socket)
        page.goto(FRONTEND + "/freelancer/interviews")
        page.get_by_role("button", name="Iniciar Entrevista", exact=True).click()
        page.locator("select").filter(has=page.locator("option[value='TECHNICAL']")).first.select_option("TECHNICAL")
        page.get_by_role("button", name="Iniciar Entrevista", exact=True).last.click()
        page.get_by_role("checkbox").nth(0).check()
        page.get_by_role("checkbox").nth(1).check()
        page.get_by_role("button", name=re.compile("Aceptar|Iniciar")).last.click()
        expect(page.get_by_text("20:00", exact=True).first).to_be_visible(timeout=30000)
        expect(page.get_by_text("Tiempo", exact=True)).to_be_visible(timeout=30000)
        page.clock.install()
        page.clock.run_for(1_201_000)
        page.wait_for_timeout(1500)
        page.screenshot(path=str(OUT / "fin-tiempo-simulado.png"))
        assert len(finished) == 1, f"Expected one automatic submission, got {len(finished)}"
        results.append({"observacion": 20, "resultado": "PASS", "prueba": "Edge: 20 minutos simulados envian automaticamente una sola evaluacion, sin pulsar Entregar"})
        context.close()

        context = browser.new_context(viewport={"width": 1366, "height": 768})
        context.add_init_script("localStorage.setItem('achanvear_auth_token', " + json.dumps(tokens["company"]) + ")")
        page = context.new_page()
        page.goto(FRONTEND + "/company")
        expect(page.get_by_role("heading", name="Panel de Control")).to_be_visible(timeout=90000)
        expect(page.get_by_text("Pipeline en progreso", exact=True)).to_have_count(0)
        expect(page.get_by_text("Entrevistas en proceso", exact=True)).to_have_count(0)
        page.screenshot(path=str(OUT / "empresa-free.png"), full_page=True)
        page.goto(FRONTEND + "/company/settings")
        expect(page.get_by_role("heading", name="Configuración de empresa")).to_be_visible(timeout=60000)
        expect(page.get_by_role("button", name=re.compile("Agente IA"))).to_have_count(0)
        results.append({"observacion": 13, "resultado": "PASS", "prueba": "Empresa FREE sin pipeline, tarjetas de entrevistas ni pestaña de agentes"})
        service_ids = ["00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002", "00000000-0000-4000-8000-000000000003"]
        page.route("**/services/conversations/*/offers", lambda route: route.fulfill(json={"success": True, "data": [
            {"serviceId": service_id, "planId": None, "freelancerId": accounts["professional"]["id"], "title": "Cotizacion de prueba", "planName": "Base",
             "amount": 100, "deliveryDays": 3, "currency": currency} for service_id, currency in zip(service_ids, [" pen ", "  ", "USD"])]}))
        page.goto(FRONTEND + f"/company/chat?userId={accounts['professional']['id']}")
        page.get_by_text("Contrataciones de servicios", exact=True).click()
        offer = page.get_by_label("Servicio y plan", exact=True)
        for service_id in service_ids[:2]:
            offer.select_option(service_id + ":base")
            expect(page.get_by_role("button", name="Formalizar contratación", exact=True)).to_be_enabled()
        offer.select_option(service_ids[2] + ":base")
        expect(page.get_by_role("button", name="Formalizar contratación", exact=True)).to_be_disabled()
        expect(page.get_by_text(re.compile("El servicio está publicado en USD"))).to_be_visible()
        results.append({"observacion": 1, "resultado": "PASS", "prueba": "Edge con cotizaciones controladas: PEN y moneda vacia permiten contratar; USD se identifica y se bloquea con explicacion en espanol"})
        application = local.sql("SELECT id || '|' || job_post_id FROM job_applications ORDER BY applied_at DESC LIMIT 1").split("|")
        local.sql(f"UPDATE job_applications SET status='SUBMITTED' WHERE id={local.quote(application[0])}")
        page.goto(FRONTEND + f"/company/pipeline/{application[1]}")
        expect(page.get_by_role("heading", name="Selección manual", exact=True)).to_be_visible(timeout=30000)
        expect(page.get_by_text("Score IA", exact=True)).to_have_count(0)
        expect(page.get_by_text("Entrevistas", exact=True)).to_have_count(0)
        page.get_by_role("button", name="Revisar candidato", exact=True).first.click()
        expect(page.get_by_text("Fases del Proceso", exact=True)).to_have_count(0)
        expect(page.get_by_text("Reporte Ejecutivo IA", exact=True)).to_have_count(0)
        page.get_by_role("button", name="Aprobar candidato", exact=True).click()
        expect(page.get_by_role("button", name="Candidato contratado", exact=True)).to_be_disabled(timeout=15000)
        assert local.request("GET", f"/jobs/{application[1]}/applicants/{application[0]}/detail", token=tokens["company"])["applicationStatus"] == "HIRED"
        page.screenshot(path=str(OUT / "seleccion-manual-free.png"), full_page=True)
        results.append({"observacion": 13, "resultado": "PASS", "prueba": "Edge: FREE aprueba candidato manualmente, sin fases, puntajes ni informes IA"})
        page.goto(FRONTEND + "/company/projects")
        expect(page.get_by_text("1 propuesta", exact=True).first).to_be_visible(timeout=30000)
        expect(page.get_by_text("1 propuestas", exact=True)).to_have_count(0)
        results.append({"observacion": 4, "resultado": "PASS", "prueba": "Listado real muestra singular: 1 propuesta"})
        project_id = local.sql("SELECT id FROM freelance_projects WHERE title LIKE 'Proyecto hallazgos %' AND status='IN_PROGRESS' ORDER BY created_at DESC LIMIT 1")
        worker_profile = local.request("GET", "/freelance/profiles/me", token=tokens["professional"])
        page.goto(FRONTEND + f"/company/projects/{project_id}")
        expect(page.get_by_text(worker_profile["name"], exact=True).first).to_be_visible(timeout=30000)
        expect(page.get_by_text(re.compile(r"Presupuesto:.*5[,.]000")).first).to_be_visible()
        page.screenshot(path=str(OUT / "proyecto-acordado-5000.png"), full_page=True)
        results.extend([
            {"observacion": 2, "resultado": "PASS", "prueba": "Pantalla real de proyecto aceptado muestra presupuesto acordado 5000"},
            {"observacion": 3, "resultado": "PASS", "prueba": "Pantalla real muestra nombre del profesional en la propuesta aceptada"}])
        browser.close()
    profile = local.request("GET", "/freelance/profiles/me", token=tokens["professional"])
    local.request("PUT", f"/freelance/profiles/{profile['id']}", {"language": "es-PE", "timezone": "UTC-5"}, tokens["professional"])
    (OUT / "navegador-local.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    for result in results:
        print(f"PASS {result['observacion']}: {result['prueba']}")


if __name__ == "__main__":
    main()
