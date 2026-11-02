"""Activate a backed-up release, preserving Redis and isolating candidate execution."""
import json
import os
from pathlib import Path
import secrets
import subprocess
from urllib.parse import urlparse

ROOT = Path('/opt/apps/achanvear')
RELEASE = ROOT/'releases/20261102-presentation'
os.umask(0o077)

def environment(path, additions):
    lines = path.read_text().splitlines() if path.exists() else []
    lines = [line for line in lines if line.split('=',1)[0] not in additions]
    path.write_text('\n'.join(lines + [k+'='+v for k,v in additions.items()])+'\n')
    path.chmod(0o600)

existing = dict(line.split('=',1) for line in (ROOT/'.env.backend').read_text().splitlines() if '=' in line and not line.startswith('#'))
secret = existing.get('AGENT_SHARED_SECRET') or secrets.token_urlsafe(48)
runner = dict(line.split('=',1) for line in (ROOT/'.env.runner').read_text().splitlines() if '=' in line) if (ROOT/'.env.runner').exists() else {}
password = urlparse(runner['PRACTICAL_POSTGRES_DSN']).password if runner else secrets.token_hex(24)
environment(ROOT/'.env.backend', {'AGENT_SHARED_SECRET':secret})
environment(ROOT/'.env.agent', {'AGENT_SHARED_SECRET':secret, 'AGENT_AUTH_REQUIRED':'true'})
environment(ROOT/'.env.runner', {'PRACTICAL_POSTGRES_DSN':'postgresql://practice:'+password+'@practice-postgres:5432/practice', 'PRACTICAL_MONGODB_URI':'mongodb://practice:'+password+'@practice-mongo:27017/?authSource=admin'})
environment(ROOT/'.env.practice', {'POSTGRES_USER':'practice','POSTGRES_PASSWORD':password,'POSTGRES_DB':'practice','MONGO_INITDB_ROOT_USERNAME':'practice','MONGO_INITDB_ROOT_PASSWORD':password})

def health(url, start='20s'):
    return dict(test=['CMD','curl','-f',url],interval='10s',timeout='5s',retries=12,start_period=start)

agent_image='achanvear-ai-agent:20261102-presentation'
services={
 'redis':dict(image='redis:7-alpine',container_name='achanvear-redis',restart='unless-stopped',command=['redis-server','--appendonly','yes'],volumes=['redis_data:/data'],networks=['achanvear-network'],healthcheck=dict(test=['CMD','redis-cli','ping'],interval='10s',timeout='5s',retries=5)),
 'ai-agent':dict(image=agent_image,container_name='achanvear-ai-agent',restart='unless-stopped',ports=['127.0.0.1:8001:8001'],env_file=['.env.agent'],environment={'ENV':'docker','REDIS_URL':'redis://redis:6379','CODE_RUNNER_URL':'http://code-runner:8002'},networks=['achanvear-network','runner-network'],healthcheck=health('http://localhost:8001/health'),depends_on={'redis':{'condition':'service_healthy'},'code-runner':{'condition':'service_healthy'}}),
 'backend':dict(image='achanvear-backend:20261102-presentation',container_name='achanvear-backend',restart='unless-stopped',ports=['127.0.0.1:8081:8081'],env_file=['.env.backend'],environment={'PORT':'8081','SPRING_PROFILES_ACTIVE':'docker','APP_FRONTEND_URL':'https://achanvear.site','CORS_ALLOWED_ORIGINS':'https://achanvear.site,https://www.achanvear.site','AI_API_URL':'http://ai-agent:8001','REDIS_HOST':'redis','REDIS_PORT':'6379'},networks=['achanvear-network'],healthcheck=health('http://localhost:8081/api/v1/actuator/health','60s'),depends_on={'redis':{'condition':'service_healthy'},'ai-agent':{'condition':'service_healthy'}}),
 'code-runner':dict(image=agent_image,container_name='achanvear-code-runner',restart='unless-stopped',command=['python','-m','uvicorn','runner_app:app','--host','0.0.0.0','--port','8002'],user='65534:65534',read_only=True,tmpfs=['/tmp:size=536870912,mode=1777,exec'],cap_drop=['ALL'],security_opt=['no-new-privileges:true'],mem_limit='1g',cpus=1.0,pids_limit=128,env_file=['.env.runner'],environment={'HOME':'/tmp','TMPDIR':'/tmp','PYTHONDONTWRITEBYTECODE':'1'},networks=['runner-network'],healthcheck=health('http://localhost:8002/health'),depends_on={'practice-postgres':{'condition':'service_healthy'},'practice-mongo':{'condition':'service_healthy'}}),
 'practice-postgres':dict(image='postgres:17-alpine',restart='unless-stopped',env_file=['.env.practice'],networks=['runner-network'],volumes=['practice_postgres_data:/var/lib/postgresql/data'],healthcheck=dict(test=['CMD','pg_isready','-U','practice','-d','practice'],interval='10s',timeout='5s',retries=10)),
 'practice-mongo':dict(image='mongo:7',restart='unless-stopped',env_file=['.env.practice'],networks=['runner-network'],volumes=['practice_mongo_data:/data/db'],healthcheck=dict(test=['CMD','mongosh','--quiet','--eval','db.adminCommand("ping").ok'],interval='10s',timeout='5s',retries=10))
}
services['ai-agent']['volumes']=['speech_model_cache:/root/.cache/huggingface']
compose={'services':services,'volumes':{'redis_data':{},'practice_postgres_data':{},'practice_mongo_data':{},'speech_model_cache':{}},'networks':{'achanvear-network':{'driver':'bridge'},'runner-network':{'internal':True}}}
# JSON is valid YAML. Keep the established compose path/project and existing Redis volume.
(ROOT/'docker-compose.yml').write_text(json.dumps(compose,indent=2)+'\n')
with (RELEASE/'activation.log').open('w') as log:
    subprocess.run(['docker','compose','-f',str(ROOT/'docker-compose.yml'),'up','-d','--wait','--wait-timeout','240'],cwd=ROOT,stdout=log,stderr=subprocess.STDOUT,check=True)
print('PASS: release activado; servicios saludables')
