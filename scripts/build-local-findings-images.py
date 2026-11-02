"""Package the tested JAR and agent changes for the existing isolated local stack.

Uses temporary build contexts containing only the JAR or Python source, never .env files.
The original image IDs are retained in the evidence manifest for local rollback.
"""
import json
import shutil
import subprocess
import tempfile
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "evidencias-hallazgos"
OUT.mkdir(exist_ok=True)
manifest = OUT / "imagenes-locales.json"
images = json.loads(manifest.read_text(encoding="utf-8")) if manifest.exists() else {}
services = sys.argv[1:] or ["backend", "ai-agent"]
assert set(services) <= {"backend", "ai-agent"}
for service in services:
    container = "achanvear-local-" + service
    info = json.loads(subprocess.check_output(["docker", "inspect", container], text=True))[0]
    assert info["Config"]["Labels"]["com.docker.compose.project"] == "achanvear-local"
    tag = info["Config"]["Image"]
    images[service] = {"tag": tag, "previousImage": info["Image"]}
    with tempfile.TemporaryDirectory(prefix="achanvear-findings-build-") as temporary:
        context = Path(temporary)
        assert context.resolve().parent == Path(tempfile.gettempdir()).resolve()
        assert context.name.startswith("achanvear-findings-build-")
        if service == "backend":
            shutil.copy2(ROOT / "achanvear.backend/target/achanvear-0.0.1-SNAPSHOT.jar", context / "app.jar")
            copy = "COPY --chown=appuser:appgroup app.jar /app/app.jar\n"
        else:
            copy = ""
            for module in ("practical_voice", "theory_interview", "shared", "code_runner"):
                shutil.copytree(ROOT / "agentpython" / module, context / module, ignore=shutil.ignore_patterns("__pycache__", "*.pyc", ".env*"))
                copy += f"COPY {module} /app/{module}\n"
            for filename in ("main.py", "runner_app.py"):
                shutil.copy2(ROOT / "agentpython" / filename, context / filename)
                copy += f"COPY {filename} /app/{filename}\n"
            copy += "RUN command -v tsc >/dev/null || npm install --global typescript@5.9.3\n"
            copy += 'RUN if ! command -v mongosh >/dev/null; then curl -fsSL https://downloads.mongodb.com/compass/mongosh-2.5.10-linux-x64.tgz -o /tmp/mongosh.tgz && tar -xzf /tmp/mongosh.tgz -C /opt && ln -sf /opt/mongosh-2.5.10-linux-x64/bin/mongosh /usr/local/bin/mongosh && rm /tmp/mongosh.tgz; fi\n'
            copy += 'RUN mkdir -p /opt/go-cache && printf \'package main\\nimport "fmt"\\nfunc main(){fmt.Println(0)}\\n\' > /tmp/warm.go && GOCACHE=/opt/go-cache go run /tmp/warm.go && rm /tmp/warm.go\n'
        (context / "Dockerfile").write_text(f"FROM {tag}\n" + copy, encoding="utf-8")
        with (OUT / f"{service}-image-build.log").open("w", encoding="utf-8") as log:
            subprocess.run(["docker", "build", "-t", tag, str(context)], stdout=log, stderr=subprocess.STDOUT, check=True)
    images[service]["testedImage"] = subprocess.check_output(["docker", "image", "inspect", tag, "--format", "{{.Id}}"], text=True).strip()
    print(f"PASS: imagen local {service} preparada")
manifest.write_text(json.dumps(images, indent=2), encoding="utf-8")
