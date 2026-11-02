"""Execute real multi-file projects for every installed runtime in the local sandbox."""
import json
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parent.parent


def main():
    values = dict(line.split("=", 1) for line in (ROOT / ".env.docker.local").read_text().splitlines() if "=" in line and not line.startswith("#"))
    headers = {"Content-Type": "application/json", "X-Agent-Service-Key": values["AGENT_SHARED_SECRET"]}
    cases = [
        ("python", "src/main.py", [{"path": "src/main.py", "content": "from calculator import add\nprint(add(2,3))"}, {"path": "src/calculator.py", "content": "def add(a,b): return a+b"}], ""),
        ("javascript", "src/main.js", [{"path": "src/main.js", "content": "const {add}=require('./calculator'); console.log(add(2,3));"}, {"path": "src/calculator.js", "content": "exports.add=(a,b)=>a+b;"}], ""),
        ("typescript", "src/main.ts", [{"path": "src/main.ts", "content": "import {add} from './calculator'; console.log(add(2,3));"}, {"path": "src/calculator.ts", "content": "export function add(a:number,b:number):number {return a+b;}"}], ""),
        ("java", "src/demo/Main.java", [{"path": "src/demo/Main.java", "content": "package demo; import java.util.Scanner; public class Main {public static void main(String[] args){Scanner in=new Scanner(System.in);System.out.println(Calculator.add(in.nextInt(),in.nextInt()));}}"}, {"path": "src/demo/Calculator.java", "content": "package demo; public class Calculator {public static int add(int a,int b){return a+b;}}"}, {"path": "README.md", "content": "Calculadora de consola"}], "2 3"),
        ("csharp", "src/Program.cs", [{"path": "src/Program.cs", "content": "using System;class Program {static void Main(){Console.WriteLine(Calculator.Add(2,3));}}"}, {"path": "src/Calculator.cs", "content": "class Calculator {public static int Add(int a,int b){return a+b;}}"}], ""),
        ("go", "main.go", [{"path": "main.go", "content": 'package main\nimport "fmt"\nfunc main(){fmt.Println(add(2,3))}'}, {"path": "calculator.go", "content": "package main\nfunc add(a int,b int) int{return a+b}"}], ""),
        ("php", "src/main.php", [{"path": "src/main.php", "content": "<?php require __DIR__.'/calculator.php'; echo add(2,3);"}, {"path": "src/calculator.php", "content": "<?php function add($a,$b){return $a+$b;}"}], ""),
        ("ruby", "src/main.rb", [{"path": "src/main.rb", "content": "require_relative 'calculator'\nputs add(2,3)"}, {"path": "src/calculator.rb", "content": "def add(a,b)\n a+b\nend"}], ""),
        ("postgresql", "main.sql", [{"path": "main.sql", "content": "SELECT 2+3;"}], ""),
        ("mongodb", "main.mongo", [{"path": "main.mongo", "content": 'db.items.insertOne({"value": 5}); print(db.items.findOne().value);'}], ""),
    ]
    results = []
    for language, entry, files, stdin in cases:
        body = {"language": language, "entry_file": entry, "files": files, "code": "", "stdin": stdin}
        request = urllib.request.Request("http://127.0.0.1:8001/code-runner/run", data=json.dumps(body).encode(), headers=headers)
        with urllib.request.urlopen(request, timeout=50) as response:
            result = json.load(response)
        passed = result["success"] and "5" in result["stdout"]
        print(language, "PASS" if passed else "FAIL", result["stderr"][:300])
        results.append({"language": language, "passed": passed, "entry": entry, "files": files, "result": result})
    destination = ROOT / ".artifacts/rehearsal/runner-final.json"
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    assert all(item["passed"] for item in results), "Revisar runtimes que fallaron"


if __name__ == "__main__": main()
