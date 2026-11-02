"""Download and inspect the actual company PDFs in Edge; temporary local paid plan only."""
import json
import re
import runpy
import uuid
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "evidencias-hallazgos"
local = runpy.run_path(str(ROOT / "scripts/validate-docker-local.py"))
sql, quote, request = (local[k] for k in ("sql", "quote", "request"))


def main():
    fixture = json.loads((OUT / "report-fixture.json").read_text())
    accounts = json.loads((ROOT / ".env.docker.smoke.json").read_text())
    company = accounts["company"]
    token = request("POST", "/auth/login", {"email": company["email"], "password": company["password"]})["accessToken"]
    detail = request("GET", f"/jobs/{fixture['job']}/applicants/{fixture['application']}/detail", token=token)
    subscription = str(uuid.uuid4())
    sql(f"INSERT INTO subscriptions(id,company_user_id,plan,status,start_date,end_date) VALUES({quote(subscription)},{quote(company['id'])},'BASIC','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP+INTERVAL '1 day')")
    downloads = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(channel="msedge", headless=True)
            context = browser.new_context(viewport={"width": 1440, "height": 1000}, accept_downloads=True)
            context.add_init_script("localStorage.setItem('achanvear_auth_token', " + json.dumps(token) + ")")
            page = context.new_page()
            page.goto(f"http://localhost:3001/company/pipeline/{fixture['job']}")
            try:
                page.get_by_text(detail["candidateName"], exact=True).first.click(timeout=20000)
            except Exception:
                page.screenshot(path=str(OUT / "empresa-informes-diagnostico.png"))
                print(page.locator("body").inner_text()[-5000:])
                raise
            expect(page.get_by_role("heading", name="Informes de entrevistas", exact=True)).to_be_visible(timeout=30000)
            for button, filename in [("Descargar PDF teórico", "informe-teorico-verificado.pdf"),
                                     ("Descargar PDF práctico", "informe-practico-verificado.pdf"),
                                     ("Descargar informe completo PDF", "informe-completo-verificado.pdf")]:
                with page.expect_download(timeout=60000) as pending:
                    page.get_by_role("button", name=button, exact=True).click()
                pending.value.save_as(OUT / filename)
                reader = PdfReader(OUT / filename)
                content = "\n".join(p.extract_text() for p in reader.pages)
                assert "Figura 1" in content and "Nota." in content and "SQLite" in content
                assert "Python Junior" in content and detail["candidateName"] in content
                assert "Puesto 1 entre" not in content and "PSICOLOGICO" not in content
                assert len(reader.pages) >= 3
                downloads.append({"archivo": filename, "paginas": len(reader.pages), "resultado": "PASS"})
            panel = page.locator("section").filter(has=page.get_by_role("heading", name="Informes de entrevistas", exact=True))
            panel.scroll_into_view_if_needed()
            page.screenshot(path=str(OUT / "empresa-informes-reales.png"))
            browser.close()
    finally:
        sql(f"DELETE FROM subscriptions WHERE id={quote(subscription)}")
    import fitz
    document = fitz.open(OUT / "informe-completo-verificado.pdf")
    for number in [0, 1, 2]:
        document[number].get_pixmap(matrix=fitz.Matrix(1.4, 1.4)).save(OUT / f"informe-vista-pagina-{number+1}.png")
    # Ensure generated words fit the physical page (including long code and identifiers).
    for page in document:
        assert all(word[0] >= 0 and word[2] <= page.rect.width + 1 and word[1] >= 0 and word[3] <= page.rect.height + 1 for word in page.get_text("words"))
    result = {"resultado": "PASS", "entorno": "Edge con frontend compilado localhost:3001 y backend real local",
              "prueba": "Empresa descarga los PDF teorico, practico y conjunto; texto, evidencias, graficos y limites de pagina verificados", "descargas": downloads}
    (OUT / "final-reports-browser.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print("PASS: empresa descarga los 3 PDF; contenido y paginacion verificados")


if __name__ == "__main__": main()
