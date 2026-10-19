"""Initialize/update Supabase: python scripts/initialize-database.py.

Requires Java 17+, Python, and the packaged backend JAR (build it first).
Reads connection credentials from the root .env without printing them.
"""
from pathlib import Path
import subprocess
from zipfile import ZipFile

root = Path(__file__).resolve().parents[1]
backend = root / 'achanvear.backend'
jars = list((backend / 'target').glob('achanvear-*.jar'))
if not jars:
    raise SystemExit('Build the backend JAR before initializing the database.')
libraries = backend / 'target' / 'database-tools'
libraries.mkdir(exist_ok=True)
with ZipFile(jars[0]) as archive:
    for name in archive.namelist():
        if name.startswith('BOOT-INF/lib/') and name.endswith('.jar'):
            (libraries / Path(name).name).write_bytes(archive.read(name))
result = subprocess.run(
    ['java', '-cp', str(libraries / '*'), 'scripts/InitializeDatabase.java'], cwd=root
)
raise SystemExit(result.returncode)
