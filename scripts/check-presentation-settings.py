"""Verify temporary settings through Java-issued grants and the actual agent."""
import json
from pathlib import Path
import runpy
import urllib.request
import uuid

ROOT=Path(__file__).resolve().parent.parent
local=runpy.run_path(str(ROOT/'scripts/validate-docker-local.py'))
sql,quote,request=(local[k] for k in ('sql','quote','request'))
accounts=json.loads((ROOT/'.env.docker.smoke.json').read_text())
worker=accounts['professional']
token=request('POST','/auth/login',{'email':worker['email'],'password':worker['password']})['accessToken']
fixture=json.loads((ROOT/'evidencias-hallazgos/report-fixture.json').read_text())
subscription=str(uuid.uuid4())
sql(f"INSERT INTO subscriptions(id,company_user_id,plan,status,start_date,end_date) VALUES({quote(subscription)},{quote(accounts['company']['id'])},'BASIC','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP+INTERVAL '1 day')")
try:
 results=[]
 for temporary in (True,False):
  for kind in ('THEORY','TECHNICAL'):
   interview=str(uuid.uuid4())
   sql(f"INSERT INTO interviews(id,hiring_process_id,candidate_id,interview_type,status,interviewer_code,interviewer_name,interviewer_style,interviewer_voice,slot_date_time,created_at,updated_at) VALUES({quote(interview)},{quote(fixture['job'])},{quote(worker['id'])},{quote(kind)},'SCHEDULED','PROFILE_1','Carlos Mendoza','Profesional','MALE1',to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC'-INTERVAL '1 minute','YYYY-MM-DD\"T\"HH24:MI:SS'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)")
   if temporary:sql(f"INSERT INTO interview_presentation_settings(interview_id,valid_until) VALUES({quote(interview)},CURRENT_TIMESTAMP+INTERVAL '1 day')")
   try:
    context=request('GET',f'/interviews/{interview}/job-context',token=token)
    request('POST',f'/interviews/{interview}/consent',{'acceptDataProcessing':True,'acceptAiEvaluation':True,'acceptRecording':True},token=token)
    if kind=='THEORY':
     request('POST',f'/interviews/{interview}/start',token=token)
     count=sql(f"SELECT python_session_id FROM interviews WHERE id={quote(interview)}")
     values=dict(line.split('=',1) for line in (ROOT/'.env.docker.local').read_text().splitlines() if '=' in line and not line.startswith('#'))
     req=urllib.request.Request('http://localhost:8001/theory-interview/start',data=json.dumps({'session_id':count,'career':'Software','job_title':'Java Junior'}).encode(),headers={'Content-Type':'application/json','X-Agent-Service-Key':values['AGENT_SHARED_SECRET']})
     with urllib.request.urlopen(req,timeout=120) as r: result=json.load(r)
     assert result['total_questions']==(3 if temporary else 15),result
    else:
     request('POST',f'/interviews/{interview}/attendance',token=token)
     req=urllib.request.Request('http://localhost:8001/practical-interview/start',data=json.dumps({'session_id':interview,'career':'Software','job_title':'Java Junior'}).encode(),headers={'Content-Type':'application/json','Authorization':'Bearer '+context['agentAccessToken']})
     with urllib.request.urlopen(req,timeout=120) as r: result=json.load(r)
     assert result['time_limit_minutes']==(5 if temporary else 20),result
     if temporary:assert result['challenge']['language']=='java'
    results.append({'temporary':temporary,'type':kind,'passed':True})
    print('PASS:',kind,'temporal' if temporary else 'normal',flush=True)
   finally:sql(f"UPDATE interviews SET status='ABORTED',abort_reason='Validacion local de ajustes' WHERE id={quote(interview)}")
finally:
 sql(f"DELETE FROM subscriptions WHERE id={quote(subscription)}")
(ROOT/'.artifacts/rehearsal/scoped-settings.json').write_text(json.dumps(results,indent=2))
