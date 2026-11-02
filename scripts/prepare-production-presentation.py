"""Create only the four explicitly requested, temporary presentation interviews."""
import json
from pathlib import Path
import uuid
from production_host import ProductionHost

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'.artifacts/rehearsal/production-presentation.json'
assert not OUT.exists(), 'Presentation already prepared; verify existing IDs instead of duplicating'
COMPANY='0fff0578-a1ff-4ad8-80ac-8ddf0e5899ea'
OWNER='7ceff42f-ee25-49a2-86e0-4d652c25448c'
CANDIDATE='957cda34-7826-437a-b5cb-99e896b014ab'
def quote(value):return "'"+str(value).replace("'","''")+"'"
records=[]
statements=['BEGIN;']
for label in ('A','B'):
 job,application,process=(str(uuid.uuid4()) for _ in range(3))
 title=f'Sustentacion {label} - Java basico'
 statements.append(f"INSERT INTO job_posts(id,company_id,title,description,requirements,location,job_type,salary_min,salary_max,currency,vacancies,status,created_at,updated_at,selection_mode,automation_level) VALUES({quote(job)},{quote(COMPANY)},{quote(title)},'Presentacion privada: desarrollar una solucion de software acorde al puesto de desarrollador Java junior.','Java basico, metodos, validacion de entradas, manejo de errores y pruebas.','Lima','FULL_TIME',3000,5000,'PEN',1,'DRAFT',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'CONTINUOUS','MANUAL')")
 statements.append(f"INSERT INTO job_applications(id,job_post_id,candidate_user_id,cover_letter,applied_at,status) VALUES({quote(application)},{quote(job)},{quote(CANDIDATE)},'Entrevistas breves para sustentacion del 2 de noviembre',CURRENT_TIMESTAMP,'SHORTLISTED')")
 statements.append(f"INSERT INTO hiring_processes(id,job_id,candidate_id,stage,theory_interview_pass_score,technical_interview_pass_score,max_candidates_per_screening_request) VALUES({quote(process)},{quote(job)},{quote(CANDIDATE)},'UNDER_REVIEW',75,75,16)")
 for kind in ('THEORY','TECHNICAL'):
  interview=str(uuid.uuid4())
  statements.append(f"INSERT INTO interviews(id,hiring_process_id,candidate_id,interview_type,status,interviewer_code,interviewer_name,interviewer_style,interviewer_voice,slot_date_time,created_at,updated_at) VALUES({quote(interview)},{quote(job)},{quote(CANDIDATE)},{quote(kind)},'SCHEDULED','PROFILE_1','Carlos Mendoza','Profesional','MALE1','2026-11-02T14:00:00',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)")
  statements.append(f"INSERT INTO interview_presentation_settings(interview_id,question_count,time_limit_minutes,case_code,valid_until) VALUES({quote(interview)},3,5,'java_calculator','2026-11-03T04:59:59Z')")
  records.append({'group':label,'type':kind,'interview':interview,'job':job,'application':application,'scheduledLima':'2026-11-02 09:00','companyUrl':'https://www.achanvear.site/company/pipeline/'+job})
statements.append('COMMIT;')
with ProductionHost() as host:
 def sql(statement):return host.run('python3 /opt/apps/achanvear/releases/20261102-presentation/production_ops.py',json.dumps({'action':'query','sql':statement}))
 assert sql("SELECT count(*) FROM flyway_schema_history WHERE version='79' AND success;").strip()=='1','Migration V79 must be deployed first'
 assert sql(f"SELECT count(*) FROM companies WHERE id={quote(COMPANY)} AND owner_user_id={quote(OWNER)};").strip()=='1'
 sql('\n'.join(s+';' if not s.endswith(';') else s for s in statements))
 OUT.write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
 print('PASS: cuatro entrevistas creadas para 02/11/2026 09:00 Lima; solo estas tienen 3 preguntas/5 minutos')
