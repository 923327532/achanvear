"""Local evidence: actual AI evaluations -> durable Java reports -> owning company.
Fixtures are deliberately isolated; no real payments or emails are sent.
"""
import json
import runpy
import subprocess
import urllib.request
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
local = runpy.run_path(str(ROOT / "scripts/validate-docker-local.py"))
sql, quote, request = (local[k] for k in ("sql", "quote", "request"))


def main():
    accounts = json.loads((ROOT / ".env.docker.smoke.json").read_text())
    company, worker = accounts["company"], accounts["professional"]
    tokens = {k: request("POST", "/auth/login", {"email": a["email"], "password": a["password"]})["accessToken"] for k, a in accounts.items()}
    job, application, process, theory, practical = (str(uuid.uuid4()) for _ in range(5))
    sql(f"INSERT INTO job_posts(id,company_id,title,description,requirements,location,job_type,salary_min,salary_max,currency,vacancies,status,created_at,updated_at,selection_mode,automation_level) VALUES({quote(job)},{quote(company['companyId'])},'Python Junior - informes verificados','API de inventario con Python y SQLite','Transacciones, validacion de stock y pruebas','Lima','FULL_TIME',3000,5000,'PEN',1,'PUBLISHED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'CONTINUOUS','MANUAL')")
    sql(f"INSERT INTO job_applications(id,job_post_id,candidate_user_id,cover_letter,applied_at,status) VALUES({quote(application)},{quote(job)},{quote(worker['id'])},'Candidato local para probar los informes de ambas entrevistas',CURRENT_TIMESTAMP,'SHORTLISTED')")
    sql(f"INSERT INTO hiring_processes(id,job_id,candidate_id,stage,theory_interview_pass_score,technical_interview_pass_score,max_candidates_per_screening_request) VALUES({quote(process)},{quote(job)},{quote(worker['id'])},'THEORY_INTERVIEW',75,75,16)")
    for interview, kind in [(theory, "THEORY"), (practical, "TECHNICAL")]:
        sql(f"INSERT INTO interviews(id,hiring_process_id,candidate_id,interview_type,status,interviewer_code,interviewer_name,interviewer_style,interviewer_voice,python_session_id,created_at,updated_at) VALUES({quote(interview)},{quote(job)},{quote(worker['id'])},{quote(kind)},'IN_PROGRESS','PROFILE_2','Ana Quispe','Profesional','FEMALE1',{quote(interview)},CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)")
    fixture = {"job": job, "application": application, "theory": theory, "practical": practical}
    (ROOT / "evidencias-hallazgos/report-fixture.json").write_text(json.dumps(fixture, indent=2), encoding="utf-8")
    # Use the live provider to score the actual answer, then seed its completed session state.
    seed = f'''
import asyncio
from shared.session_orchestrator import SessionState, InterviewStage, update_session
from theory_interview.answer_evaluator import evaluate_answer
async def main():
 s=SessionState({theory!r},{worker['id']!r},{job!r},'Software','Python Junior')
 s.stage=InterviewStage.THEORY
 s.questions=[{{'text':'Como evitas stock negativo y mantienes atomicidad al descontar inventario en SQLite?', 'expected_concepts':['transaccion','validacion','rollback']}}]
 s.answers=['Valido que la cantidad sea positiva. Inicio una transaccion, uso UPDATE productos SET stock=stock-? WHERE id=? AND stock>=? con parametros. Si rowcount es cero lanzo un error y hago rollback; solo confirmo commit si la operacion completa es valida. Pruebo cantidad invalida, stock insuficiente y compra exitosa.']
 e=await evaluate_answer(s.questions[0]['text'],s.answers[0],s.questions[0]['expected_concepts'])
 s.scores=[e['score']]; s.current_q=1
 await update_session(s)
 t=SessionState({practical!r},{worker['id']!r},{job!r},'Software','Python Junior')
 t.stage=InterviewStage.TECHNICAL
 t.challenge={{'title':'Inventario transaccional en Python', 'description':'Implementar descuento de stock con SQLite, validacion, rollback y pruebas.', 'prompt':'Python, SQLite, transaccion y control de errores'}}
 await update_session(t)
asyncio.run(main())
'''
    done = subprocess.run(["docker", "exec", "-i", "achanvear-local-ai-agent", "python", "-"], input=seed, text=True, capture_output=True)
    if done.returncode: raise RuntimeError("No se pudo preparar la evidencia evaluada por IA")
    code = '''import sqlite3
def comprar(db, cantidad):
    if cantidad <= 0: raise ValueError("Cantidad invalida")
    with db:
        cursor=db.execute("UPDATE productos SET stock=stock-? WHERE id=1 AND stock>=?", (cantidad,cantidad))
        if cursor.rowcount != 1: raise ValueError("Stock insuficiente")
db=sqlite3.connect(":memory:")
db.execute("CREATE TABLE productos(id INTEGER PRIMARY KEY, stock INTEGER NOT NULL)")
db.execute("INSERT INTO productos VALUES(1,10)"); db.commit()
comprar(db,3)
assert db.execute("SELECT stock FROM productos").fetchone()[0] == 7
try: comprar(db,20)
except ValueError: pass
assert db.execute("SELECT stock FROM productos").fetchone()[0] == 7
print("Pruebas de inventario y rollback aprobadas")
'''
    executed = subprocess.run(["python", "-c", code], capture_output=True, text=True, check=True)
    workspace = {"code": code, "files": [{"path": "inventario.py", "content": code}],
                 "notes": "Se usan parametros SQL y una actualizacion condicional en transaccion. Las pruebas verifican compra exitosa y rollback cuando falta stock.",
                 "lastRun": {"success": True}, "codeOutput": executed.stdout}
    body = {"session_id": practical, "workspace_type": "coding", "workspace_state": workspace, "violations": 0,
            "transcript": [{"role": "agent", "content": "Explica tu solucion"}, {"role": "candidate", "content": "Uso SQL parametrizado, una transaccion y rowcount para evitar stock negativo. Las pruebas verifican el rollback y el inventario restante."}]}
    req = urllib.request.Request("http://127.0.0.1:8001/practical-interview/finish", data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "X-Agent-Service-Key": dict(line.split("=",1) for line in (ROOT/".env.docker.local").read_text().splitlines() if "=" in line and not line.startswith("#"))["AGENT_SHARED_SECRET"]})
    with urllib.request.urlopen(req, timeout=120) as response: practical_result = json.load(response)
    reports = []
    for interview in [theory, practical]:
        if interview == practical:
            # Keep this local evidence check from triggering an outbound email event.
            sql(f"UPDATE hiring_processes SET stage='UNDER_REVIEW' WHERE id={quote(process)}")
        result = request("POST", f"/interviews/{interview}/complete", token=tokens["professional"])
        assert result["status"] == "COMPLETED" and result["assessment"]["summary"]
        assert request("POST", f"/interviews/{interview}/complete", token=tokens["professional"]) == result
        reports.append(result)
    assert reports[0]["assessment"]["generation_status"] == "generated", "Se requiere una sintesis del proveedor real"
    assert reports[0]["assessment"]["evidence"][0]["answer"]
    assert reports[1]["finalScore"] == practical_result["score"]
    assert reports[1]["assessment"]["workspace_state"]["code"] == code
    company_reports = request("GET", f"/jobs/{job}/applicants/{application}/interview-reports", token=tokens["company"])
    assert {r["interviewId"] for r in company_reports} == {theory, practical}
    request("GET", f"/jobs/{job}/applicants/{application}/interview-reports", token=tokens["professional"], expected=403)
    request("GET", f"/jobs/{uuid.uuid4()}/applicants/{application}/interview-reports", token=tokens["company"], expected=404)
    for interview in [theory, practical]:
        assert sql(f"SELECT count(*) FROM in_app_notifications WHERE user_id={quote(company['id'])} AND event_key={quote('interview-report:'+interview)}") == "1"
    result = {"resultado": "PASS", "entorno": "achanvear-local; candidatos y puesto de prueba", "pruebas": [
        "Respuesta teorica evaluada y sintesis generada por el proveedor IA real",
        "Practica con codigo Python y pruebas SQLite ejecutadas, evaluada por IA real",
        "Ambas evaluaciones y evidencias persistidas por Java y recuperadas por la empresa propietaria",
        "Completar repetidamente conserva el resultado; un solo aviso por entrevista a la empresa",
        "Acceso de candidato a ruta empresarial rechazado; postulacion de otra vacante rechazada"], "reports": reports}
    (ROOT / "evidencias-hallazgos/final-reports-api.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print("PASS: IA real, persistencia, entrega a empresa, notificaciones y control de acceso")


if __name__ == "__main__": main()
