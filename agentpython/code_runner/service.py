import json
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any


LANGUAGE_ALIASES = {
    "js": "javascript",
    "node": "javascript",
    "javascript": "javascript",
    "ts": "typescript",
    "typescript": "typescript",
    "py": "python",
    "python": "python",
    "java": "java",
    "csharp": "csharp",
    "cs": "csharp",
    "c#": "csharp",
    "go": "go",
    "golang": "go",
    "php": "php",
    "ruby": "ruby",
    "rb": "ruby",
    "sql": "postgresql",
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "pgsql": "postgresql",
    "mongo": "mongodb",
    "mongodb": "mongodb",
    "nosql": "mongodb",
}

FORBIDDEN_POSTGRES_PATTERNS = (
    r"\bDROP\s+DATABASE\b",
    r"\bCREATE\s+DATABASE\b",
    r"\bALTER\s+SYSTEM\b",
    r"\bCOPY\b.+\bPROGRAM\b",
    r"\bCREATE\s+EXTENSION\b",
    r"\bALTER\s+ROLE\b",
    r"\bALTER\s+USER\b",
    r"\bCREATE\s+ROLE\b",
    r"\bCREATE\s+USER\b",
    r"\bGRANT\b",
    r"\bREVOKE\b",
    r"\bTRUNCATE\b.+\bCASCADE\b",
    r"\bpg_sleep\s*\(",
)

FORBIDDEN_MONGODB_PATTERNS = (
    r"\bdropDatabase\s*\(",
    r"\bdrop\s*\(",
    r"\bshutdownServer\s*\(",
    r"\bcreateUser\s*\(",
    r"\bupdateUser\s*\(",
    r"\bdropUser\s*\(",
    r"\bgrantRolesToUser\s*\(",
    r"\brevokeRolesFromUser\s*\(",
    r"\bcreateRole\s*\(",
    r"\bdropRole\s*\(",
    r"\bserverStatus\s*\(",
    r"\bfsyncLock\s*\(",
    r"\bsetProfilingLevel\s*\(",
    r"\bsleep\s*\(",
    r"\bwhile\s*\(\s*true\s*\)",
    r"\bfor\s*\(\s*;\s*;\s*\)",
)


def run_code(
    language: str,
    code: str,
    files: list[dict[str, Any]] | None = None,
    entry_file: str | None = None,
    function_name: str | None = None,
    test_cases: list[Any] | None = None,
    timeout_seconds: int = 8,
) -> dict[str, Any]:
    normalized = LANGUAGE_ALIASES.get(language.lower().strip(), language.lower().strip())
    timeout = max(1, min(timeout_seconds, 15))
    test_cases = test_cases or []

    with tempfile.TemporaryDirectory(prefix="achanvear-run-") as tmp:
        workdir = Path(tmp)
        try:
            if files:
                return _run_project(workdir, normalized, files, entry_file, timeout)
            if normalized in {"javascript", "typescript"}:
                return _run_javascript(workdir, code, function_name, test_cases, timeout)
            if normalized == "python":
                return _run_python(workdir, code, function_name, test_cases, timeout)
            if normalized == "java":
                return _run_java(workdir, code, function_name, test_cases, timeout)
            if normalized == "csharp":
                return _run_csharp(workdir, code, timeout)
            if normalized == "go":
                return _run_file(workdir, "main.go", code, ["go", "run", "main.go"], timeout, "go")
            if normalized == "php":
                return _run_file(workdir, "main.php", code, ["php", "main.php"], timeout, "php")
            if normalized == "ruby":
                return _run_file(workdir, "main.rb", code, ["ruby", "main.rb"], timeout, "ruby")
            if normalized == "postgresql":
                return _run_postgresql(code, timeout)
            if normalized == "mongodb":
                return _run_mongodb(code, timeout)
            return _unsupported(normalized)
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "language": normalized,
                "stdout": "",
                "stderr": f"Timeout: el programa excedio {timeout} segundos.",
                "exit_code": 124,
                "runtime_available": True,
            }
        except Exception as exc:
            return {
                "success": False,
                "language": normalized,
                "stdout": "",
                "stderr": str(exc),
                "exit_code": 1,
                "runtime_available": True,
            }


def _run_project(
    workdir: Path,
    language: str,
    files: list[dict[str, Any]],
    entry_file: str | None,
    timeout: int,
) -> dict[str, Any]:
    written = _write_project_files(workdir, files)
    entry = entry_file or _default_entry_file(language, written)
    if not entry:
        return {
            "success": False,
            "language": language,
            "stdout": "",
            "stderr": "No se encontro archivo de entrada para ejecutar el proyecto.",
            "exit_code": 2,
            "runtime_available": True,
        }

    if language in {"javascript", "typescript"}:
        return _run_process(["node", entry], workdir, timeout, "javascript")
    if language == "python":
        python_cmd = shutil.which("python") or shutil.which("python3")
        if not python_cmd:
            return _missing_runtime("python", "python")
        return _run_process([python_cmd, entry], workdir, timeout, "python")
    if language == "java":
        compile_result = _run_process(["javac", *written], workdir, timeout, "java")
        if compile_result["exit_code"] != 0:
            return compile_result
        main_class = Path(entry).stem
        return _run_process(["java", main_class], workdir, timeout, "java")
    if language == "csharp":
        compile_result = _run_process(["mcs", "-out:Program.exe", *written], workdir, timeout, "csharp")
        if compile_result["exit_code"] != 0:
            return compile_result
        return _run_process(["mono", "Program.exe"], workdir, timeout, "csharp")
    if language == "go":
        return _run_process(["go", "run", "."], workdir, timeout, "go")
    if language == "php":
        return _run_process(["php", entry], workdir, timeout, "php")
    if language == "ruby":
        return _run_process(["ruby", entry], workdir, timeout, "ruby")
    if language == "postgresql":
        combined_sql = "\n\n".join(("-- " + Path(path).name + "\n" + (workdir / path).read_text(encoding="utf-8")) for path in written)
        return _run_postgresql(combined_sql, timeout)
    if language == "mongodb":
        combined_js = "\n\n".join(("// " + Path(path).name + "\n" + (workdir / path).read_text(encoding="utf-8")) for path in written)
        return _run_mongodb(combined_js, timeout)
    return _unsupported(language)


def _run_postgresql(code: str, timeout: int) -> dict[str, Any]:
    if not shutil.which("psql"):
        return _missing_runtime("postgresql", "psql")
    if os.getenv("PRACTICAL_SQL_ENABLED", "true").lower() not in {"1", "true", "yes"}:
        return {
            "success": False,
            "language": "postgresql",
            "stdout": "",
            "stderr": "El runner SQL esta desactivado en este entorno.",
            "exit_code": 126,
            "runtime_available": False,
        }
    blocked = _blocked_postgres_reason(code)
    if blocked:
        return {
            "success": False,
            "language": "postgresql",
            "stdout": "",
            "stderr": blocked,
            "exit_code": 2,
            "runtime_available": True,
        }
    dsn = os.getenv("PRACTICAL_POSTGRES_DSN") or os.getenv("DATABASE_URL")
    if not dsn:
        return {
            "success": False,
            "language": "postgresql",
            "stdout": "",
            "stderr": "No hay DSN configurado. Define PRACTICAL_POSTGRES_DSN para ejecutar pruebas SQL.",
            "exit_code": 127,
            "runtime_available": False,
        }
    schema = "interview_" + next(tempfile._get_candidate_names()).replace("-", "_")
    statement_timeout_ms = max(1000, min(timeout * 1000, 15000))
    wrapped = f"""
BEGIN;
CREATE SCHEMA {schema};
SET search_path TO {schema}, public;
SET LOCAL statement_timeout = {statement_timeout_ms};
SET LOCAL lock_timeout = 1000;
SET LOCAL idle_in_transaction_session_timeout = {statement_timeout_ms};
{code}
ROLLBACK;
"""
    result = subprocess.run(
        ["psql", dsn, "-v", "ON_ERROR_STOP=1", "-X", "-q"],
        input=wrapped,
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    return {
        "success": result.returncode == 0,
        "language": "postgresql",
        "stdout": result.stdout[-12000:],
        "stderr": result.stderr[-12000:],
        "exit_code": result.returncode,
        "runtime_available": True,
    }


def _blocked_postgres_reason(code: str) -> str | None:
    compact = re.sub(r"\s+", " ", code.strip(), flags=re.MULTILINE)
    for pattern in FORBIDDEN_POSTGRES_PATTERNS:
        if re.search(pattern, compact, flags=re.IGNORECASE):
            return f"Comando SQL no permitido en entrevistas: {pattern}"
    return None


def _run_mongodb(code: str, timeout: int) -> dict[str, Any]:
    if os.getenv("PRACTICAL_MONGODB_ENABLED", "true").lower() not in {"1", "true", "yes"}:
        return {
            "success": False,
            "language": "mongodb",
            "stdout": "",
            "stderr": "El runner MongoDB esta desactivado en este entorno.",
            "exit_code": 126,
            "runtime_available": False,
        }
    blocked = _blocked_mongodb_reason(code)
    if blocked:
        return {
            "success": False,
            "language": "mongodb",
            "stdout": "",
            "stderr": blocked,
            "exit_code": 2,
            "runtime_available": True,
        }
    dsn = os.getenv("PRACTICAL_MONGODB_URI") or os.getenv("MONGODB_URI")
    if not dsn:
        return {
            "success": False,
            "language": "mongodb",
            "stdout": "",
            "stderr": "No hay URI configurada. Define PRACTICAL_MONGODB_URI para ejecutar pruebas MongoDB.",
            "exit_code": 127,
            "runtime_available": False,
        }

    try:
        from pymongo import MongoClient
    except ImportError:
        return _missing_runtime("mongodb", "pymongo")

    database_name = "interview_" + next(tempfile._get_candidate_names()).replace("-", "_")
    stdout_lines: list[str] = []

    def print_value(*values: Any) -> None:
        stdout_lines.append(" ".join(_mongo_to_text(value) for value in values))

    client = MongoClient(
        dsn,
        serverSelectionTimeoutMS=min(timeout * 1000, 15000),
        socketTimeoutMS=min(timeout * 1000, 15000),
        connectTimeoutMS=min(timeout * 1000, 15000),
    )

    try:
        client.admin.command("ping")
        db = _SandboxMongoDatabase(client[database_name], print_value)
        globals_scope = {
            "db": db,
            "print": print_value,
            "ObjectId": _safe_object_id,
            "NumberInt": int,
            "NumberLong": int,
            "ISODate": _safe_iso_date,
            "true": True,
            "false": False,
            "null": None,
        }
        exec(_translate_mongo_shell(code), {"__builtins__": _safe_builtins()}, globals_scope)
        return {
            "success": True,
            "language": "mongodb",
            "stdout": "\n".join(stdout_lines)[-12000:],
            "stderr": "",
            "exit_code": 0,
            "runtime_available": True,
        }
    except Exception as exc:
        return {
            "success": False,
            "language": "mongodb",
            "stdout": "\n".join(stdout_lines)[-12000:],
            "stderr": str(exc)[-12000:],
            "exit_code": 1,
            "runtime_available": True,
        }
    finally:
        try:
            client.drop_database(database_name)
        finally:
            client.close()


def _blocked_mongodb_reason(code: str) -> str | None:
    compact = re.sub(r"\s+", " ", code.strip(), flags=re.MULTILINE)
    for pattern in FORBIDDEN_MONGODB_PATTERNS:
        if re.search(pattern, compact, flags=re.IGNORECASE):
            return f"Comando MongoDB no permitido en entrevistas: {pattern}"
    return None


def _translate_mongo_shell(code: str) -> str:
    translated = code
    translated = re.sub(r"\btrue\b", "True", translated)
    translated = re.sub(r"\bfalse\b", "False", translated)
    translated = re.sub(r"\bnull\b", "None", translated)
    translated = re.sub(r"([{,]\s*)([$A-Za-z_][\w$]*)\s*:", lambda match: f'{match.group(1)}"{match.group(2)}":', translated)
    translated = re.sub(r"\.toArray\s*\(\s*\)", ".to_list()", translated)
    translated = re.sub(r"\bprintjson\s*\(", "print(", translated)
    return translated


class _SandboxMongoDatabase:
    def __init__(self, database: Any, printer: Any) -> None:
        self._database = database
        self._printer = printer

    def __getattr__(self, collection_name: str) -> "_SandboxMongoCollection":
        if collection_name.startswith("_"):
            raise AttributeError(collection_name)
        return self.getCollection(collection_name)

    def getCollection(self, collection_name: str) -> "_SandboxMongoCollection":
        return _SandboxMongoCollection(self._database[collection_name], self._printer)

    def createCollection(self, collection_name: str) -> dict[str, Any]:
        self._database.create_collection(collection_name)
        return {"ok": 1}


class _SandboxMongoCollection:
    def __init__(self, collection: Any, printer: Any) -> None:
        self._collection = collection
        self._printer = printer

    def insertOne(self, document: dict[str, Any]) -> dict[str, Any]:
        result = self._collection.insert_one(document)
        return {"acknowledged": result.acknowledged, "insertedId": str(result.inserted_id)}

    def insertMany(self, documents: list[dict[str, Any]]) -> dict[str, Any]:
        result = self._collection.insert_many(documents)
        return {"acknowledged": result.acknowledged, "insertedIds": [str(item) for item in result.inserted_ids]}

    def find(self, query: dict[str, Any] | None = None, projection: dict[str, Any] | None = None) -> "_SandboxMongoCursor":
        return _SandboxMongoCursor(self._collection.find(query or {}, projection))

    def findOne(self, query: dict[str, Any] | None = None, projection: dict[str, Any] | None = None) -> dict[str, Any] | None:
        return self._collection.find_one(query or {}, projection)

    def updateOne(self, query: dict[str, Any], update: dict[str, Any]) -> dict[str, Any]:
        result = self._collection.update_one(query, update)
        return {"matchedCount": result.matched_count, "modifiedCount": result.modified_count}

    def updateMany(self, query: dict[str, Any], update: dict[str, Any]) -> dict[str, Any]:
        result = self._collection.update_many(query, update)
        return {"matchedCount": result.matched_count, "modifiedCount": result.modified_count}

    def deleteOne(self, query: dict[str, Any]) -> dict[str, Any]:
        result = self._collection.delete_one(query)
        return {"deletedCount": result.deleted_count}

    def deleteMany(self, query: dict[str, Any]) -> dict[str, Any]:
        result = self._collection.delete_many(query)
        return {"deletedCount": result.deleted_count}

    def countDocuments(self, query: dict[str, Any] | None = None) -> int:
        return self._collection.count_documents(query or {})

    def createIndex(self, keys: Any, **kwargs: Any) -> str:
        return self._collection.create_index(keys, **kwargs)

    def aggregate(self, pipeline: list[dict[str, Any]]) -> "_SandboxMongoCursor":
        return _SandboxMongoCursor(self._collection.aggregate(pipeline))


class _SandboxMongoCursor:
    def __init__(self, cursor: Any) -> None:
        self._cursor = cursor

    def sort(self, *args: Any, **kwargs: Any) -> "_SandboxMongoCursor":
        self._cursor = self._cursor.sort(*args, **kwargs)
        return self

    def limit(self, limit: int) -> "_SandboxMongoCursor":
        self._cursor = self._cursor.limit(limit)
        return self

    def skip(self, count: int) -> "_SandboxMongoCursor":
        self._cursor = self._cursor.skip(count)
        return self

    def to_list(self) -> list[Any]:
        return list(self._cursor)

    def __iter__(self) -> Any:
        return iter(self._cursor)


def _safe_object_id(value: str | None = None) -> Any:
    from bson import ObjectId

    return ObjectId(value) if value else ObjectId()


def _safe_iso_date(value: str) -> Any:
    from datetime import datetime

    normalized = value.replace("Z", "+00:00")
    return datetime.fromisoformat(normalized)


def _mongo_to_text(value: Any) -> str:
    from bson import json_util

    return json_util.dumps(value, ensure_ascii=False, indent=2)


def _safe_builtins() -> dict[str, Any]:
    return {
        "dict": dict,
        "list": list,
        "len": len,
        "range": range,
        "str": str,
        "int": int,
        "float": float,
        "bool": bool,
        "sum": sum,
        "min": min,
        "max": max,
        "sorted": sorted,
        "enumerate": enumerate,
        "Exception": Exception,
    }


def _write_project_files(workdir: Path, files: list[dict[str, Any]]) -> list[str]:
    written: list[str] = []
    for file in files:
        raw_path = str(file.get("path") or "").strip().replace("\\", "/")
        if not raw_path or raw_path.startswith("/") or ".." in Path(raw_path).parts:
            raise ValueError(f"Ruta de archivo invalida: {raw_path}")
        target = workdir / raw_path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(str(file.get("content") or ""), encoding="utf-8")
        written.append(raw_path)
    return written


def _default_entry_file(language: str, files: list[str]) -> str | None:
    preferred = {
        "javascript": ("main.js", "index.js", "app.js", "server.js"),
        "typescript": ("main.js", "index.js", "app.js", "server.js"),
        "python": ("main.py", "app.py"),
        "java": ("Main.java",),
        "csharp": ("Program.cs",),
        "go": ("main.go",),
        "php": ("index.php", "main.php"),
        "ruby": ("main.rb", "app.rb"),
    }.get(language, ())
    for candidate in preferred:
        if candidate in files:
            return candidate
    return files[0] if files else None


def _run_javascript(
    workdir: Path,
    code: str,
    function_name: str | None,
    test_cases: list[Any],
    timeout: int,
) -> dict[str, Any]:
    if not shutil.which("node"):
        return _missing_runtime("javascript", "node")
    executable = _strip_typescript(code)
    harness = ""
    if function_name and test_cases:
        harness = (
            "\nconst __testCases = " + json.dumps(test_cases) + ";\n"
            f"const __fn = typeof {function_name} !== 'undefined' ? {function_name} : globalThis.{function_name};\n"
            "if (typeof __fn !== 'function') throw new Error('No se encontro la funcion solicitada');\n"
            "const __results = __testCases.map((testCase) => Array.isArray(testCase) ? __fn(...testCase) : __fn(testCase));\n"
            "console.log(JSON.stringify(__results, null, 2));\n"
        )
    return _run_file(workdir, "main.js", executable + harness, ["node", "main.js"], timeout, "javascript")


def _run_python(
    workdir: Path,
    code: str,
    function_name: str | None,
    test_cases: list[Any],
    timeout: int,
) -> dict[str, Any]:
    python_cmd = shutil.which("python") or shutil.which("python3")
    if not python_cmd:
        return _missing_runtime("python", "python")
    harness = ""
    if function_name and test_cases:
        harness = (
            "\nimport json as __json\n"
            f"__test_cases = __json.loads({json.dumps(json.dumps(test_cases))})\n"
            f"__fn = globals().get({json.dumps(function_name)})\n"
            "if not callable(__fn): raise Exception('No se encontro la funcion solicitada')\n"
            "__results = [__fn(test_case) for test_case in __test_cases]\n"
            "print(__json.dumps(__results, ensure_ascii=False, indent=2))\n"
        )
    return _run_file(workdir, "main.py", code + harness, [python_cmd, "main.py"], timeout, "python")


def _run_java(
    workdir: Path,
    code: str,
    function_name: str | None,
    test_cases: list[Any],
    timeout: int,
) -> dict[str, Any]:
    if not shutil.which("javac") or not shutil.which("java"):
        return _missing_runtime("java", "javac/java")
    source = workdir / "Main.java"
    executable = code
    if function_name and test_cases and "public static void main" not in code and "static public void main" not in code:
        executable = _inject_java_test_harness(code, function_name, test_cases)
    source.write_text(executable, encoding="utf-8")
    compile_result = _run_process(["javac", "Main.java"], workdir, timeout)
    if compile_result["exit_code"] != 0:
        compile_result["language"] = "java"
        return compile_result
    return _run_process(["java", "Main"], workdir, timeout, "java")


def _inject_java_test_harness(code: str, function_name: str, test_cases: list[Any]) -> str:
    insertion_point = code.rfind("}")
    if insertion_point == -1:
        raise ValueError("Para pruebas automaticas en Java, el codigo debe declarar una clase Main.")

    calls = []
    for test_case in test_cases:
        args = test_case if isinstance(test_case, list) else [test_case]
        call_args = ", ".join(_java_literal(arg) for arg in args)
        calls.append(f'        __printResult(__candidate.{function_name}({call_args}));')

    harness = f"""

    public static void main(String[] args) {{
        Main __candidate = new Main();
{chr(10).join(calls)}
    }}

    private static void __printResult(Object value) {{
        if (value == null) {{
            System.out.println("null");
        }} else if (value instanceof int[]) {{
            System.out.println(java.util.Arrays.toString((int[]) value));
        }} else if (value instanceof long[]) {{
            System.out.println(java.util.Arrays.toString((long[]) value));
        }} else if (value instanceof double[]) {{
            System.out.println(java.util.Arrays.toString((double[]) value));
        }} else if (value instanceof boolean[]) {{
            System.out.println(java.util.Arrays.toString((boolean[]) value));
        }} else if (value instanceof Object[]) {{
            System.out.println(java.util.Arrays.deepToString((Object[]) value));
        }} else {{
            System.out.println(value);
        }}
    }}
"""
    return code[:insertion_point] + harness + code[insertion_point:]


def _java_literal(value: Any) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if value is None:
        return "null"
    if isinstance(value, str):
        return json.dumps(value)
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        return "new Object[]{" + ", ".join(_java_literal(item) for item in value) + "}"
    raise ValueError(f"Tipo de caso no soportado para Java: {type(value).__name__}")


def _run_csharp(workdir: Path, code: str, timeout: int) -> dict[str, Any]:
    if shutil.which("dotnet"):
        project = workdir / "Runner.csproj"
        project.write_text(
            '<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework></PropertyGroup></Project>',
            encoding="utf-8",
        )
        (workdir / "Program.cs").write_text(code, encoding="utf-8")
        return _run_process(["dotnet", "run", "--no-restore"], workdir, timeout, "csharp")

    if shutil.which("mcs") and shutil.which("mono"):
        (workdir / "Program.cs").write_text(code, encoding="utf-8")
        compile_result = _run_process(["mcs", "-out:Program.exe", "Program.cs"], workdir, timeout, "csharp")
        if compile_result["exit_code"] != 0:
            return compile_result
        return _run_process(["mono", "Program.exe"], workdir, timeout, "csharp")

    return _missing_runtime("csharp", "dotnet o mono/mcs")


def _run_file(
    workdir: Path,
    filename: str,
    code: str,
    command: list[str],
    timeout: int,
    language: str | None = None,
) -> dict[str, Any]:
    runtime = command[0]
    if not os.path.isabs(runtime) and not shutil.which(runtime):
        return _missing_runtime(language or runtime, runtime)
    (workdir / filename).write_text(code, encoding="utf-8")
    return _run_process(command, workdir, timeout, language)


def _run_process(
    command: list[str],
    workdir: Path,
    timeout: int,
    language: str | None = None,
) -> dict[str, Any]:
    result = subprocess.run(
        command,
        cwd=workdir,
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    return {
        "success": result.returncode == 0,
        "language": language,
        "stdout": result.stdout[-12000:],
        "stderr": result.stderr[-12000:],
        "exit_code": result.returncode,
        "runtime_available": True,
    }


def _strip_typescript(code: str) -> str:
    import re

    code = re.sub(r"interface\s+\w+\s*\{[\s\S]*?\}\s*", "", code)
    code = re.sub(r"type\s+\w+\s*=\s*\{[\s\S]*?\};", "", code)
    code = re.sub(r"export\s+", "", code)
    code = re.sub(r":\s*Array<[^>]+>", "", code)
    code = re.sub(r":\s*[A-Za-z_$][\w$]*(\[\])?", "", code)
    code = re.sub(r"\)\s*:\s*[A-Za-z_$][\w$]*(\[\])?\s*\{", ") {", code)
    return code


def _missing_runtime(language: str, runtime: str) -> dict[str, Any]:
    return {
        "success": False,
        "language": language,
        "stdout": "",
        "stderr": f"Runtime no disponible: instala o agrega '{runtime}' al contenedor/PATH.",
        "exit_code": 127,
        "runtime_available": False,
    }


def _unsupported(language: str) -> dict[str, Any]:
    return {
        "success": False,
        "language": language,
        "stdout": "",
        "stderr": f"Lenguaje no soportado todavia por el runner: {language}.",
        "exit_code": 2,
        "runtime_available": False,
    }
