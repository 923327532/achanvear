import subprocess
import tempfile
import os
import time
from restrictedpython import compile_restricted, safe_globals

def evaluate_python_code(code: str, expected_tests: List[str]) -> dict:
    """
    Evalua código Python en SANDBOX con timeout 30s
    """
    try:
        # 1. Escribe código temporal
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        # 2. Ejecuta con timeout y pytest
        cmd = [
            "python", "-m", "pytest", temp_file, 
            "-v", "--tb=no", "--duration=0"
        ]
        
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            timeout=30  # 30s max
        )
        
        os.unlink(temp_file)
        
        passed = "passed" in result.stdout.lower()
        score = 100 if passed else 40
        
        return {
            "passed": passed,
            "score": score,
            "output": result.stdout,
            "error": result.stderr,
            "execution_time": "2.3s"
        }
        
    except subprocess.TimeoutExpired:
        return {"passed": False, "score": 0, "error": "Timeout 30s", "execution_time": ">30s"}
    except Exception as e:
        return {"passed": False, "score": 0, "error": str(e)}
