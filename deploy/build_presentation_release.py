"""Build release images on the VPS without changing running services."""
from pathlib import Path
import subprocess

ROOT = Path('/opt/apps/achanvear/releases/20261102-presentation')
backend = ROOT / 'backend'
agent = ROOT / 'agent'
backend.mkdir(exist_ok=True)
agent.mkdir(exist_ok=True)
subprocess.run(['cp', str(ROOT/'app.jar'), str(backend/'app.jar')], check=True)
subprocess.run(['tar', '-xzf', str(ROOT/'agent.tar.gz'), '-C', str(agent)], check=True)
(backend/'Dockerfile').write_text('FROM achanvear-backend:20261029-r2\nCOPY --chown=appuser:appgroup app.jar /app/app.jar\n')
(agent/'Dockerfile').write_text('''FROM achanvear-ai-agent:360badf-validated
COPY practical_voice /app/practical_voice
COPY theory_interview /app/theory_interview
COPY shared /app/shared
COPY code_runner /app/code_runner
COPY main.py runner_app.py /app/
RUN command -v tsc >/dev/null || npm install --global typescript@5.9.3
RUN if ! command -v mongosh >/dev/null; then curl -fsSL https://downloads.mongodb.com/compass/mongosh-2.5.10-linux-x64.tgz -o /tmp/mongosh.tgz && tar -xzf /tmp/mongosh.tgz -C /opt && ln -sf /opt/mongosh-2.5.10-linux-x64/bin/mongosh /usr/local/bin/mongosh && rm /tmp/mongosh.tgz; fi
RUN mkdir -p /opt/go-cache && printf 'package main\\nimport "fmt"\\nfunc main(){fmt.Println(0)}\\n' > /tmp/warm.go && GOCACHE=/opt/go-cache go run /tmp/warm.go && rm /tmp/warm.go
''')
for name, context in [('backend', backend), ('ai-agent', agent)]:
    with (ROOT/(name+'-build.log')).open('w') as log:
        subprocess.run(['docker', 'build', '-t', 'achanvear-'+name+':20261102-presentation', str(context)], stdout=log, stderr=subprocess.STDOUT, check=True)
print('PASS: ambas imagenes construidas; servicios actuales sin modificar')
