"""Private SSH-only database operations; reads the existing server environment in memory."""
import json
import os
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse, parse_qs


def database_environment():
    values = {}
    for line in Path("/opt/apps/achanvear/.env.backend").read_text().splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip().strip('"').strip("'")
    url = values.get("FLYWAY_URL") or values.get("DB_URL") or values.get("SPRING_DATASOURCE_URL")
    parsed = urlparse(url.removeprefix("jdbc:"))
    return {**os.environ, "PGHOST": parsed.hostname, "PGPORT": str(parsed.port or 5432),
            "PGDATABASE": parsed.path.lstrip("/"), "PGUSER": values.get("DB_USERNAME") or values.get("SPRING_DATASOURCE_USERNAME"),
            "PGPASSWORD": values.get("DB_PASSWORD") or values.get("SPRING_DATASOURCE_PASSWORD"),
            "PGSSLMODE": parse_qs(parsed.query).get("sslmode", ["require"])[0]}


def main():
    request = json.load(sys.stdin)
    environment = database_environment()
    client = ["docker", "run", "--rm", "-i"]
    for name in ("PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD", "PGSSLMODE"):
        client.extend(["-e", name])
    if request["action"] == "backup":
        folder = Path(request["folder"]).resolve()
        if not str(folder).startswith("/root/achanvear-backups/"):
            raise ValueError("Invalid backup folder")
        folder.mkdir(parents=True, exist_ok=True, mode=0o700)
        target = folder / "database.dump"
        mounted = client + ["-v", str(folder) + ":/backup", "postgres:17-alpine"]
        subprocess.run(mounted + ["pg_dump", "-Fc", "--no-owner", "--no-privileges", "-f", "/backup/database.dump"], env=environment, check=True, capture_output=True)
        subprocess.run(mounted + ["pg_restore", "--list", "/backup/database.dump"], env=environment, check=True, capture_output=True)
        print(json.dumps({"backup": str(target), "bytes": target.stat().st_size, "validated": True}))
    else:
        result = subprocess.run(client + ["postgres:17-alpine", "psql", "-X", "-qAt", "-v", "ON_ERROR_STOP=1"], input=request["sql"], text=True,
                                capture_output=True, env=environment)
        if result.returncode:
            raise RuntimeError("Database operation failed: " + result.stderr[:500])
        print(result.stdout.strip())


if __name__ == "__main__":
    main()
