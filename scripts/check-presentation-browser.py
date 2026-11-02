"""Real local interview UI: folders/files, four runtimes, and three professional workspaces."""
import json
import re
import runpy
import uuid
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parent.parent
local = runpy.run_path(str(ROOT / "scripts/validate-docker-local.py"))
sql, quote, request = (local[k] for k in ("sql", "quote", "request"))
OUT = ROOT / ".artifacts/rehearsal"


def main():
    accounts = json.loads((ROOT / ".env.docker.smoke.json").read_text())
    company, worker = accounts["company"], accounts["professional"]
    token = request("POST", "/auth/login", {"email": worker["email"], "password": worker["password"]})["accessToken"]
    subscription = str(uuid.uuid4())
    sql(f"INSERT INTO subscriptions(id,company_user_id,plan,status,start_date,end_date) VALUES({quote(subscription)},{quote(company['id'])},'BASIC','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP+INTERVAL '1 day')")
    scenarios = [
        ("Python", "Programador Python", "main.py", "print(2+3)", ""),
        ("JavaScript", "Desarrollador JavaScript", "main.js", "console.log(2+3)", ""),
        ("Java", "Programador Java", "Main.java", "package checks; import java.util.Scanner; public class Main {public static void main(String[] a){Scanner s=new Scanner(System.in);System.out.println(s.nextInt()+s.nextInt());}}", "2 3"),
        ("Csharp", "Programador C#", "Program.cs", "namespace checks { class Program {static void Main(){System.Console.WriteLine(2+3);}} }", ""),
        ("Marketing", "Especialista de marketing digital", "", "", ""),
        ("Legal", "Asesor legal", "", "", ""),
        ("Contable", "Analista contable", "", "", ""),
    ]
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True, args=["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"])
        try:
            for label, position, filename, code, stdin in scenarios:
                job, application, process, interview = (str(uuid.uuid4()) for _ in range(4))
                title = "Validacion previa " + position + " " + job[:6]
                sql(f"INSERT INTO job_posts(id,company_id,title,description,requirements,location,job_type,salary_min,salary_max,currency,vacancies,status,created_at,updated_at,selection_mode,automation_level) VALUES({quote(job)},{quote(company['companyId'])},{quote(title)},'Caso profesional para validar el workspace','Criterio profesional y solucion sustentada','Lima','FULL_TIME',3000,5000,'PEN',1,'DRAFT',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'CONTINUOUS','MANUAL')")
                sql(f"INSERT INTO job_applications(id,job_post_id,candidate_user_id,cover_letter,applied_at,status) VALUES({quote(application)},{quote(job)},{quote(worker['id'])},'Prueba local',CURRENT_TIMESTAMP,'SHORTLISTED'); INSERT INTO hiring_processes(id,job_id,candidate_id,stage,theory_interview_pass_score,technical_interview_pass_score,max_candidates_per_screening_request) VALUES({quote(process)},{quote(job)},{quote(worker['id'])},'UNDER_REVIEW',75,75,16)")
                sql(f"INSERT INTO interviews(id,hiring_process_id,candidate_id,interview_type,status,interviewer_code,interviewer_name,interviewer_style,interviewer_voice,slot_date_time,created_at,updated_at) VALUES({quote(interview)},{quote(job)},{quote(worker['id'])},'TECHNICAL','SCHEDULED','PROFILE_2','Ana Quispe','Profesional','FEMALE1',to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '1 minute','YYYY-MM-DD\"T\"HH24:MI:SS'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)")
                context = browser.new_context(viewport={"width": 1440, "height": 1000})
                context.add_init_script("localStorage.setItem('achanvear_auth_token'," + json.dumps(token) + ")")
                page = context.new_page()
                try:
                    page.goto("http://localhost:3001/freelancer/interviews")
                    heading = page.get_by_role("heading", name=title, exact=True)
                    expect(heading).to_be_visible(timeout=60000)
                    card = heading.locator("xpath=ancestor::div[contains(@class,'border-l-4')][1]")
                    card.get_by_role("button", name="Iniciar Entrevista", exact=True).click()
                    page.get_by_role("button", name="Iniciar Entrevista", exact=True).last.click()
                    page.get_by_role("checkbox").nth(0).check()
                    page.get_by_role("checkbox").nth(1).check()
                    page.get_by_role("button", name=re.compile("Aceptar|Iniciar")).last.click()
                    if filename:
                        expect(page.get_by_role("button", name="Ejecutar", exact=True)).to_be_visible(timeout=45000)
                        page.get_by_role("button", name="Ocultar sala", exact=True).click()
                        page.get_by_title("Crear carpeta", exact=True).click()
                        page.get_by_placeholder("src/services", exact=True).fill("checks")
                        page.get_by_role("button", name="Crear", exact=True).click()
                        page.get_by_title("Crear archivo en checks", exact=True).first.click()
                        page.get_by_placeholder("CandidateService.ts", exact=True).fill(filename)
                        page.get_by_role("button", name="Crear", exact=True).click()
                        page.wait_for_function("window.monaco && window.monaco.editor.getModels().length > 0", timeout=60000)
                        page.wait_for_timeout(500)
                        page.locator(".monaco-editor").click(position={"x": 80, "y": 35})
                        page.keyboard.press("Control+A")
                        page.keyboard.insert_text(code)
                        page.wait_for_timeout(300)
                        page.get_by_label("Entrada del programa", exact=True).click()
                        page.get_by_label("Entrada de terminal", exact=True).fill(stdin)
                        with page.expect_response("**/code-runner/run", timeout=45000) as response:
                            page.get_by_role("button", name="Ejecutar", exact=True).click()
                        result = response.value.json()
                        if not result["stdout"]:
                            print("Payload de archivo:", response.value.request.post_data_json.get("files"), flush=True)
                        assert result["success"] and "5" in result["stdout"], result
                        if label == "Python":
                            separator = page.get_by_role("separator", name="Ajustar altura de la terminal")
                            before = separator.locator("..").bounding_box()["height"]
                            bounds = separator.bounding_box()
                            page.mouse.move(bounds["x"] + 50, bounds["y"] + 4)
                            page.mouse.down()
                            page.mouse.move(bounds["x"] + 50, bounds["y"] - 45, steps=5)
                            page.mouse.up()
                            assert separator.locator("..").bounding_box()["height"] > before
                            page.get_by_label("Maximizar panel", exact=True).click()
                            page.get_by_label("Restaurar panel", exact=True).click()
                            page.get_by_label("Ocultar panel", exact=True).click()
                            expect(page.get_by_label("Salida de terminal", exact=True)).to_have_count(0)
                            page.get_by_label("Mostrar panel", exact=True).click()
                            expect(page.get_by_label("Salida de terminal", exact=True)).to_contain_text("5")
                    else:
                        expect(page.get_by_placeholder("Escribe tu analisis, supuestos, calculos o decisiones mientras conversas con el agente...", exact=True)).to_be_visible(timeout=45000)
                        expect(page.get_by_role("button", name="Ejecutar", exact=True)).to_have_count(0)
                    page.screenshot(path=str(OUT / ("workspace-" + label + ".png")))
                    results.append({"caso": label, "resultado": "PASS", "carpeta_archivo_y_ejecucion": bool(filename), "entrevista": interview})
                    print("PASS navegador:", label, flush=True)
                except Exception:
                    page.screenshot(path=str(OUT / "workspace-error.png"))
                    print(page.locator("body").inner_text()[-4000:])
                    raise
                finally:
                    context.close()
                    sql(f"UPDATE interviews SET status='ABORTED',abort_reason='Validacion local terminada' WHERE id={quote(interview)} AND status<>'COMPLETED'")
        finally:
            browser.close()
            sql(f"DELETE FROM subscriptions WHERE id={quote(subscription)}")
    (OUT / "browser-workspaces.json").write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding="utf-8")


if __name__ == "__main__": main()
