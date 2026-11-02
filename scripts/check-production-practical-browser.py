"""Public practical room and authenticated WSS smoke test; never uses tomorrow's slots."""
import json
from pathlib import Path
import requests
import uuid
from playwright.sync_api import sync_playwright, expect
from production_host import ProductionHost

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'.artifacts/rehearsal'
credentials=json.loads((ROOT/'.env.presentation.json').read_text())
fixture=json.loads((OUT/'production-report-fixture.json').read_text())
interview=str(uuid.uuid4())
with ProductionHost() as host:
 def sql(s):return host.run('python3 /opt/apps/achanvear/releases/20261102-presentation/production_ops.py',json.dumps({'action':'query','sql':s}))
 sql(f"INSERT INTO interviews(id,hiring_process_id,candidate_id,interview_type,status,interviewer_code,interviewer_name,interviewer_style,interviewer_voice,slot_date_time,created_at,updated_at) SELECT '{interview}',hiring_process_id,candidate_id,'TECHNICAL','SCHEDULED',interviewer_code,interviewer_name,interviewer_style,interviewer_voice,to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC'-INTERVAL '1 minute','YYYY-MM-DD\"T\"HH24:MI:SS'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM interviews WHERE id='{fixture['practical']}'; INSERT INTO interview_presentation_settings(interview_id,valid_until) VALUES('{interview}',CURRENT_TIMESTAMP+INTERVAL '1 hour');")
 try:
  r=requests.post('https://api.achanvear.site/api/v1/auth/login',json={'email':credentials['candidate_email'],'password':credentials['account_password']},timeout=30);r.raise_for_status();token=r.json()['data']['accessToken']
  frames=[]
  with sync_playwright() as p:
   browser=p.chromium.launch(channel='msedge',headless=True,args=['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream'])
   context=browser.new_context(viewport={'width':1440,'height':1000})
   context.add_init_script("localStorage.setItem('achanvear_auth_token',"+json.dumps(token)+")")
   page=context.new_page()
   page.on('websocket',lambda ws:ws.on('framereceived',lambda payload:frames.append(json.loads(payload).get('type'))))
   page.goto('https://www.achanvear.site/freelancer/interviews')
   heading=page.get_by_role('heading',name='Verificacion publicada - Java basico',exact=True)
   expect(heading.first).to_be_visible(timeout=45000)
   cards=heading.locator("xpath=ancestor::div[contains(@class,'border-l-4')][1]")
   card=cards.filter(has=page.get_by_role('button',name='Iniciar Entrevista',exact=True)).first
   card.get_by_role('button',name='Iniciar Entrevista',exact=True).click()
   page.get_by_role('button',name='Iniciar Entrevista',exact=True).last.click()
   page.get_by_role('checkbox').nth(0).check();page.get_by_role('checkbox').nth(1).check()
   page.get_by_role('button',name='Iniciar',exact=True).click()
   expect(page.get_by_role('button',name='Ejecutar',exact=True)).to_be_visible(timeout=60000)
   for _ in range(60):
    if 'agent_audio' in frames:break
    page.wait_for_timeout(500)
   assert 'agent_text' in frames and 'agent_audio' in frames,frames
   page.get_by_role('button',name='Ocultar sala',exact=True).click()
   page.wait_for_function('window.monaco && window.monaco.editor.getModels().length>0')
   page.locator('.monaco-editor').click(position={'x':80,'y':35})
   page.keyboard.press('Control+A');page.keyboard.insert_text('public class Main { public static void main(String[] args) { System.out.println(2+3); } }')
   page.wait_for_timeout(500)
   with page.expect_response('**/code-runner/run',timeout=45000) as response:page.get_by_role('button',name='Ejecutar',exact=True).click()
   result=response.value.json();assert result['success'] and '5' in result['stdout'],result
   page.screenshot(path=str(OUT/'production-practical-room.png'))
   browser.close()
  (OUT/'production-practical-browser.json').write_text(json.dumps({'result':'PASS','javaOutput':result['stdout'],'websocketEvents':list(dict.fromkeys(frames)),'interview':interview},indent=2))
  print('PASS publicado: consentimiento, sala Java, permiso firmado, WSS con voz y ejecucion real')
 finally:sql(f"UPDATE interviews SET status='ABORTED',abort_reason='Validacion tecnica autorizada de navegador terminada' WHERE id='{interview}' AND status<>'COMPLETED';")
