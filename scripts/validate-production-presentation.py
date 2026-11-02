"""Real production evaluation and company delivery, separate from tomorrow's four slots."""
import json
from pathlib import Path
import requests
import uuid
from production_host import ProductionHost

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'.artifacts/rehearsal'
credentials=json.loads((ROOT/'.env.presentation.json').read_text())
API='https://api.achanvear.site/api/v1'
AGENT='https://api.achanvear.site'
def api(method,path,body=None,token=None):
 r=requests.request(method,API+path,json=body,headers={'Authorization':'Bearer '+token} if token else {},timeout=150)
 if not r.ok:raise RuntimeError(f'{method} {path}: HTTP {r.status_code}: '+r.json().get('message',''))
 return r.json().get('data')
tokens={kind:api('POST','/auth/login',{'email':credentials[kind+'_email'],'password':credentials['account_password']})['accessToken'] for kind in ('company','candidate')}
def q(value):return "'"+str(value).replace("'","''")+"'"
fixture_file=OUT/'production-report-fixture.json'
if not fixture_file.exists():
 job,application,process,theory,practical=(str(uuid.uuid4()) for _ in range(5))
 candidate='957cda34-7826-437a-b5cb-99e896b014ab'
 company='0fff0578-a1ff-4ad8-80ac-8ddf0e5899ea'
 statements=["BEGIN",f"INSERT INTO job_posts(id,company_id,title,description,requirements,location,job_type,salary_min,salary_max,currency,vacancies,status,created_at,updated_at,selection_mode,automation_level) VALUES({q(job)},{q(company)},'Verificacion publicada - Java basico','Verificacion real de entrevista y entrega de informes. Calculadora de consola en Java.','Java basico, Scanner, cuatro operaciones y division por cero.','Lima','FULL_TIME',3000,5000,'PEN',1,'DRAFT',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'CONTINUOUS','MANUAL')",f"INSERT INTO job_applications(id,job_post_id,candidate_user_id,cover_letter,applied_at,status) VALUES({q(application)},{q(job)},{q(candidate)},'Verificacion autorizada del despliegue',CURRENT_TIMESTAMP,'SHORTLISTED')",f"INSERT INTO hiring_processes(id,job_id,candidate_id,stage,theory_interview_pass_score,technical_interview_pass_score,max_candidates_per_screening_request) VALUES({q(process)},{q(job)},{q(candidate)},'UNDER_REVIEW',75,75,16)"]
 for interview,kind in ((theory,'THEORY'),(practical,'TECHNICAL')):
  statements += [f"INSERT INTO interviews(id,hiring_process_id,candidate_id,interview_type,status,interviewer_code,interviewer_name,interviewer_style,interviewer_voice,slot_date_time,created_at,updated_at) VALUES({q(interview)},{q(job)},{q(candidate)},{q(kind)},'SCHEDULED','PROFILE_1','Carlos Mendoza','Profesional','MALE1',to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC'-INTERVAL '1 minute','YYYY-MM-DD\"T\"HH24:MI:SS'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",f"INSERT INTO interview_presentation_settings(interview_id,valid_until) VALUES({q(interview)},CURRENT_TIMESTAMP+INTERVAL '1 hour')"]
 statements+=['COMMIT']
 with ProductionHost() as host:
  host.run('python3 /opt/apps/achanvear/releases/20261102-presentation/production_ops.py',json.dumps({'action':'query','sql':';\n'.join(statements)+';'}))
 fixture={'job':job,'application':application,'theory':theory,'practical':practical}
 fixture_file.write_text(json.dumps(fixture,indent=2))
 for interview in (theory,practical):api('POST',f'/interviews/{interview}/consent',{'acceptDataProcessing':True,'acceptAiEvaluation':True,'acceptRecording':True},tokens['candidate'])
 session=api('POST',f'/interviews/{theory}/start',token=tokens['candidate'])
 answers=[
  'En Java una clase define atributos y metodos; un objeto es una instancia. Para la calculadora uso double para los numeros y Scanner para leerlos. Encapsulo cada operacion en un metodo para poder probarla. Valido datos antes de calcular y cierro Scanner al terminar.',
  'Implemento sumar, restar, multiplicar y dividir en un switch segun el operador. Leo dos numeros y el operador con Scanner. Antes de dividir compruebo que el divisor no sea cero y muestro un mensaje claro. Un operador desconocido tambien produce un mensaje de entrada invalida.',
  'Pruebo 8 mas 2 igual a 10, 8 menos 2 igual a 6, 8 por 2 igual a 16 y 8 entre 2 igual a 4. Incluyo negativos, decimales y division entre cero; verifico salida y que no se cierre inesperadamente. La operacion tiene tiempo y espacio constantes.']
 next_question={'id':'q1'}
 for answer in answers:
  assert next_question is not None,'La teoria termino antes de tres respuestas'
  next_question=api('POST',f'/interviews/{theory}/answers',{'questionId':next_question['id'],'answerContent':answer},tokens['candidate'])
 assert next_question is None,'La sesion breve debe terminar con tres preguntas'
 theory_report=api('POST',f'/interviews/{theory}/complete',token=tokens['candidate'])
 print('PASS produccion: teoria de tres preguntas evaluada y persistida',flush=True)
else:
 fixture=json.loads(fixture_file.read_text())
 job,application,theory,practical=(fixture[k] for k in ('job','application','theory','practical'))
context=api('GET',f'/interviews/{practical}/job-context',token=tokens['candidate'])
api('POST',f'/interviews/{practical}/attendance',token=tokens['candidate'])
headers={'Authorization':'Bearer '+context['agentAccessToken']}
def agent(path,body):
 r=requests.post(AGENT+path,json=body,headers=headers,timeout=150);r.raise_for_status();return r.json()
started=agent('/practical-interview/start',{'session_id':practical,'career':'Software','job_title':'Java basico','candidate_name':'ROBERTO CARLOS LOPEZ CALLE'})
assert started['time_limit_minutes']==5 and started['challenge']['language']=='java'
code='''import java.util.Scanner;
public class Main {
 public static void main(String[] args) {
  Scanner in = new Scanner(System.in);
  double a=in.nextDouble(); String op=in.next(); double b=in.nextDouble();
  switch(op) {
   case "+": System.out.println(a+b); break;
   case "-": System.out.println(a-b); break;
   case "*": System.out.println(a*b); break;
   case "/": if(b==0) System.out.println("No se puede dividir entre cero"); else System.out.println(a/b); break;
   default: System.out.println("Operador invalido");
  }
  in.close();
 }
}'''
runs=[]
for stdin,expected in [('8 + 2','10.0'),('8 - 2','6.0'),('8 * 2','16.0'),('8 / 2','4.0'),('8 / 0','cero')]:
 result=agent('/code-runner/run',{'session_id':practical,'language':'java','code':'','files':[{'path':'Main.java','content':code}],'entry_file':'Main.java','stdin':stdin})
 assert result['success'] and expected in result['stdout'],result
 runs.append({'input':stdin,'output':result['stdout']})
workspace={'files':[{'path':'Main.java','content':code,'language':'java'}],'code':code,'activeFilePath':'Main.java','notes':'Scanner lee numeros y operador; switch selecciona la operacion. Se valida divisor cero. Se probaron las cuatro operaciones y division por cero.','codeOutput':json.dumps(runs),'lastRun':{'success':True}}
evaluation=agent('/practical-interview/finish',{'session_id':practical,'workspace_type':'coding','workspace_state':workspace,'violations':0,'transcript':[{'role':'agent','content':'Explica la solucion y las pruebas.'},{'role':'candidate','content':workspace['notes']}]})
practical_report=api('POST',f'/interviews/{practical}/complete',token=tokens['candidate'])
assert practical_report['finalScore']==evaluation['score']
reports=api('GET',f'/jobs/{job}/applicants/{application}/interview-reports',token=tokens['company'])
assert {r['interviewId'] for r in reports}=={theory,practical}
assert all(r['assessment']['summary'] for r in reports)
with ProductionHost() as host:
 sql=f"SELECT count(*) FROM in_app_notifications WHERE user_id='7ceff42f-ee25-49a2-86e0-4d652c25448c' AND event_key IN ({q('interview-report:'+theory)},{q('interview-report:'+practical)});"
 assert host.run('python3 /opt/apps/achanvear/releases/20261102-presentation/production_ops.py',json.dumps({'action':'query','sql':sql})).strip()=='2'
(OUT/'production-reports.json').write_text(json.dumps({'reports':reports,'runs':runs,'result':'PASS'},ensure_ascii=False,indent=2),encoding='utf-8')
print('PASS produccion: calculadora Java, cinco ejecuciones, IA real, dos informes y dos avisos a empresa')
