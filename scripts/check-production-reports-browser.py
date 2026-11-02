"""Download company reports from the published website, using the validation fixture."""
import json
from pathlib import Path
import requests
from playwright.sync_api import sync_playwright, expect
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'.artifacts/rehearsal'
credentials=json.loads((ROOT/'.env.presentation.json').read_text())
fixture=json.loads((OUT/'production-report-fixture.json').read_text())
r=requests.post('https://api.achanvear.site/api/v1/auth/login',json={'email':credentials['company_email'],'password':credentials['account_password']},timeout=30)
r.raise_for_status()
token=r.json()['data']['accessToken']
r=requests.get(f"https://api.achanvear.site/api/v1/jobs/{fixture['job']}/applicants/{fixture['application']}/detail",headers={'Authorization':'Bearer '+token},timeout=30)
r.raise_for_status()
detail=r.json()['data']
downloads=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='msedge',headless=True)
 context=browser.new_context(viewport={'width':1440,'height':1000},accept_downloads=True)
 context.add_init_script("localStorage.setItem('achanvear_auth_token',"+json.dumps(token)+")")
 page=context.new_page()
 page.goto('https://www.achanvear.site/company/pipeline/'+fixture['job'])
 page.get_by_text(detail['candidateName'],exact=True).first.click(timeout=45000)
 expect(page.get_by_role('heading',name='Informes de entrevistas',exact=True)).to_be_visible(timeout=30000)
 for button,filename in [('Descargar PDF teórico','produccion-informe-teorico.pdf'),('Descargar PDF práctico','produccion-informe-practico.pdf'),('Descargar informe completo PDF','produccion-informe-completo.pdf')]:
  with page.expect_download(timeout=60000) as pending:page.get_by_role('button',name=button,exact=True).click()
  pending.value.save_as(OUT/filename)
  pdf=PdfReader(OUT/filename)
  text='\n'.join(p.extract_text() for p in pdf.pages)
  assert 'Figura 1' in text and 'Nota.' in text and 'Java' in text and detail['candidateName'] in text
  assert len(pdf.pages)>=3
  downloads.append({'file':filename,'pages':len(pdf.pages),'result':'PASS'})
 page.locator('section').filter(has=page.get_by_role('heading',name='Informes de entrevistas',exact=True)).scroll_into_view_if_needed()
 page.screenshot(path=str(OUT/'production-company-reports.png'))
 browser.close()
(OUT/'production-pdf-check.json').write_text(json.dumps(downloads,indent=2))
print('PASS publicado: empresa descarga los PDF teorico, practico y completo con graficos y evidencia Java')
