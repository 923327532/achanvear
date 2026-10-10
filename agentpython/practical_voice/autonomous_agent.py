import json
import re
from typing import Any, Dict, List

from langchain_core.messages import HumanMessage, SystemMessage
from shared.llm_client.llm_client import llm


SYSTEM_PROMPT = """
Eres el entrevistador practico autonomo de Achanvear.
Tu estilo es profesional, claro, conversacional y exigente.
Debes sonar como una persona: saluda, escucha, responde a lo que el candidato dice
y mantén un ritmo natural de entrevista laboral.
La entrevista tiene fases:
1. Apertura breve: confirma el nombre del candidato, explica reglas y valida que este listo.
2. Conversacion inicial de 1 a 2 minutos: experiencia, contexto y forma de trabajo.
3. Reto practico: guia el workspace, pide que piense en voz alta y observa sus decisiones.
4. Cierre: pide resumen, riesgos y siguientes pasos.
No adelantes el reto hasta haber hecho una apertura minima y una pregunta inicial humana.
Permite interrupciones: si el candidato corrige, duda o pide aclaracion, adaptate sin repetir todo.
Si el candidato responde "listo", "ya", "dale", "empecemos", "estoy listo" o algo equivalente,
no repitas la bienvenida ni vuelvas a preguntar si esta listo: avanza al reto practico.
Haz preguntas de seguimiento, evalua razonamiento, detecta inconsistencias y pide que explique sus decisiones.
No des la solucion completa. Da pistas breves si el candidato se bloquea.
Cuando haya workspace, usa el estado visible como evidencia: codigo, documentos, notas y alertas.
Responde en espanol latinoamericano, en frases cortas aptas para voz.
"""


def _profile_context(challenge: Dict[str, Any]) -> str:
    profile = challenge.get("interviewer_profile") or {}
    if not profile:
        return ""
    return (
        f"Tu nombre durante esta entrevista es {profile.get('name', 'el entrevistador')}. "
        f"Tu especialidad es {profile.get('role', 'evaluacion practica')}. "
        f"Tu estilo debe ser {profile.get('style', 'profesional y conversacional')}. "
        "Mantente natural: reconoce lo que el candidato dijo, evita repetir frases y haz seguimiento contextual."
    )


def build_turn_prompt(
    transcript: List[Dict[str, str]],
    candidate_text: str,
    workspace_state: Dict[str, Any],
    challenge: Dict[str, Any],
    violations: int,
) -> str:
    recent = transcript[-8:]
    return (
        f"Reto actual:\n{json.dumps(challenge, ensure_ascii=False)[:4000]}\n\n"
        f"Perfil del entrevistador:\n{_profile_context(challenge)}\n\n"
        f"Estado del workspace:\n{json.dumps(workspace_state, ensure_ascii=False)[:5000]}\n\n"
        f"Violaciones antifraude acumuladas: {violations}\n\n"
        f"Conversacion reciente:\n{json.dumps(recent, ensure_ascii=False)}\n\n"
        f"El candidato acaba de decir:\n{candidate_text}\n\n"
        "Si el candidato confirma que esta listo, avanza inmediatamente: dile que tiene 20 minutos, "
        "que puede hacer preguntas si no entiende algo, que debe revisar el boton Caso cuando quiera ver el enunciado, "
        "que puede usar Ejecutar varias veces sin finalizar y que solo Entregar envia la evaluacion final. "
        "Indica el lenguaje o herramienta esperada segun el reto y pidelo empezar con su plan de solucion. "
        "No repitas la bienvenida ni preguntes otra vez si esta listo. "
        "Si ya pasaron al reto, enfocate en evidencia practica del workspace. "
        "Responde como entrevistador practico. Maximo 90 palabras. "
        "Termina con una pregunta o instruccion concreta."
    )


async def generate_interviewer_reply(
    transcript: List[Dict[str, str]],
    candidate_text: str,
    workspace_state: Dict[str, Any],
    challenge: Dict[str, Any],
    violations: int,
) -> str:
    normalized = candidate_text.lower().strip()
    ready_words = ("listo", "lista", "ya", "dale", "empecemos", "comencemos", "estoy listo", "estoy lista")
    if any(word in normalized for word in ready_words):
        language = challenge.get("language") or workspace_state.get("codeLanguage") or "la herramienta indicada en el caso"
        title = challenge.get("title") or "el caso practico"
        return (
            f"Excelente, comenzamos. Tienes 20 minutos para resolver {title}. "
            f"El lenguaje o herramienta evaluada sera {language}. Haz clic en Caso cuando quieras revisar el enunciado. "
            "Puedes ejecutar varias veces para validar; eso no finaliza la entrevista. "
            "Cuando termines, presiona Entregar. Primero explicame tu plan y luego empieza a trabajar."
        )

    if workspace_state.get("codeOutput"):
        return (
            "Ya veo el resultado de tu ejecucion. Ahora explicame que significa esa salida, "
            "que caso borde cubririas y que cambiarias si hubiera candidatos empatados."
        )

    prompt = build_turn_prompt(transcript, candidate_text, workspace_state, challenge, violations)
    response = await llm.ainvoke([
        SystemMessage(content=f"{SYSTEM_PROMPT}\n{_profile_context(challenge)}"),
        HumanMessage(content=prompt),
    ])
    return response.content.strip()


async def evaluate_practical_interview(
    transcript: List[Dict[str, str]],
    workspace_state: Dict[str, Any],
    challenge: Dict[str, Any],
    violations: int,
) -> Dict[str, Any]:
    security_events = workspace_state.get("securityEvents", [])
    disqualified = any(event.get("type") == "disqualified" for event in security_events if isinstance(event, dict))
    if disqualified:
        return {
            "score": 0,
            "communication_score": 0,
            "passed": False,
            "summary": "Entrevista descalificada por incumplir reglas de permanencia en pantalla.",
            "communication_summary": "No se evalua comunicacion por descalificacion automatica.",
            "strengths": [],
            "risks": ["Descalificacion antifraude por salida de pantalla."],
            "recommendation": "No avanzar. Requiere nueva postulacion o revision manual de la empresa.",
            "next_action": "reject",
        }

    evidence = _workspace_evidence(workspace_state, challenge, transcript)
    prompt = (
        "Evalua esta entrevista practica para seleccion laboral. Devuelve SOLO JSON valido con: "
        "score entero 0-100 para la practica, communication_score entero 0-100, "
        "passed boolean, summary string, communication_summary string, strengths array, risks array, "
        "recommendation string, next_action string ('reject'|'schedule_human_meeting'|'manual_review').\n\n"
        "Reglas obligatorias de evaluacion:\n"
        "- Usa evidencia del workspace: archivos, codigo, notas, salida de ejecucion y conversacion.\n"
        "- Evalua sobre 100 con criterios: cumplimiento funcional 35, arquitectura/diseno 25, calidad y mantenibilidad 15, ejecucion/validacion 15, comunicacion 10.\n"
        "- Para perfiles senior exige estructura profesional: varios archivos cuando el caso lo amerita, separacion de responsabilidades, nombres claros, patrones simples, manejo de errores y decisiones justificadas.\n"
        "- No premies solo que compile: si el codigo corre pero ignora arquitectura, accesibilidad, seguridad o requisitos del puesto, baja el puntaje.\n"
        "- Si creo carpetas/archivos con extensiones coherentes y explico el diseno, consideralo evidencia positiva aun si faltan detalles menores.\n"
        "- Si no ejecuto el programa, puede aprobar solo si el codigo/notas muestran una solucion claramente completa y explicada.\n"
        "- Si dejo TODOs principales, codigo casi vacio o solo hablo sin construir, debe reprobar.\n"
        "- Si ejecuto con errores pero el diseno es razonable, puede quedar en revision manual, no aprobar automatico.\n"
        "- Penaliza incumplimiento de requisitos esperados del reto.\n\n"
        f"Evidencia objetiva calculada: {json.dumps(evidence, ensure_ascii=False)}\n"
        f"Reto: {json.dumps(challenge, ensure_ascii=False)}\n"
        f"Workspace: {json.dumps(workspace_state, ensure_ascii=False)[:7000]}\n"
        f"Violaciones: {violations}\n"
        f"Transcripcion: {json.dumps(transcript, ensure_ascii=False)[:10000]}"
    )
    response = await llm.ainvoke([
        SystemMessage(content=f"{SYSTEM_PROMPT}\n{_profile_context(challenge)}"),
        HumanMessage(content=prompt),
    ])
    raw = response.content.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        raw = raw.removeprefix("json").strip()
    try:
        data = json.loads(raw)
    except Exception:
        data = {
            "score": 0,
            "passed": False,
            "summary": raw[:1000],
            "strengths": [],
            "risks": ["No se pudo parsear la evaluacion JSON del agente."],
            "recommendation": "Revision manual requerida.",
            "next_action": "manual_review",
        }
    score = int(data.get("score", 0))
    score = _apply_evidence_caps(score, evidence)
    data["score"] = max(0, min(100, score - min(violations * 8, 40)))
    data["communication_score"] = max(0, min(100, int(data.get("communication_score", data["score"]))))
    data["communication_summary"] = data.get("communication_summary", "")
    data["evidence_summary"] = evidence
    data["passed"] = bool(data.get("passed", data["score"] >= 75)) and data["score"] >= 75
    if data["passed"] and data.get("next_action") not in {"schedule_human_meeting", "manual_review"}:
        data["next_action"] = "schedule_human_meeting"
    return data


def _workspace_evidence(
    workspace_state: Dict[str, Any],
    challenge: Dict[str, Any],
    transcript: List[Dict[str, str]],
) -> Dict[str, Any]:
    files = workspace_state.get("files") or []
    if not isinstance(files, list):
        files = []
    folders = workspace_state.get("folders") or []
    if not isinstance(folders, list):
        folders = []
    code = str(workspace_state.get("code") or "")
    file_paths = [str(item.get("path") or "") for item in files if isinstance(item, dict)]
    file_texts = [str(item.get("content") or "") for item in files if isinstance(item, dict)]
    combined_code = "\n".join([code, *file_texts])
    normalized_code = combined_code.strip()
    notes = str(workspace_state.get("notes") or "").strip()
    last_run = workspace_state.get("lastRun") if isinstance(workspace_state.get("lastRun"), dict) else None
    code_output = str(workspace_state.get("codeOutput") or "")
    expected = challenge.get("expected_output") or []
    expected_text = " ".join(str(item).lower() for item in expected)
    transcript_text = " ".join(str(turn.get("content") or "") for turn in transcript if isinstance(turn, dict))

    meaningful_lines = [
        line for line in normalized_code.splitlines()
        if line.strip() and not line.strip().startswith(("//", "#", "--"))
    ]
    todo_count = len(re.findall(r"\bTODO\b|Escribe tu solucion aqui|return candidates;|pass\b", combined_code, flags=re.IGNORECASE))
    has_code = len(normalized_code) >= 80 or len(meaningful_lines) >= 4
    has_notes = len(notes) >= 80
    ran = bool(last_run) or "Ejecucion correcta" in code_output or "Ejecucion con errores" in code_output
    run_success = bool(last_run.get("success")) if last_run else "Ejecucion correcta" in code_output
    run_error = bool(last_run and not last_run.get("success")) or "Ejecucion con errores" in code_output or "Error al ejecutar" in code_output

    lower_code = combined_code.lower()
    lower_paths = " ".join(file_paths).lower()
    extensions = sorted({path.rsplit(".", 1)[-1].lower() for path in file_paths if "." in path})
    architecture_terms = (
        "service", "controller", "repository", "domain", "model", "schema", "dto",
        "component", "hook", "utils", "validator", "factory", "strategy", "interface",
        "test", "spec", "middleware", "adapter", "usecase", "use-case"
    )
    architecture_hits = sum(1 for token in architecture_terms if token in lower_code or token in lower_paths)
    has_project_structure = len(files) >= 2 or len(folders) >= 1 or "/" in lower_paths
    has_tests_or_validation = any(token in lower_paths or token in lower_code for token in ("test", "spec", "assert", "expect(", "describe(", "it(", "console.assert"))
    has_error_handling = any(token in lower_code for token in ("try", "catch", "except", "raise", "throw", "error", "validation", "validar"))
    expected_hits = 0
    if any(word in expected_text for word in ("sql", "indice", "index", "trigger")):
        if any(token in lower_code for token in ("select ", "create table", "create index", "create trigger", "db.")):
            expected_hits += 1
    if any(word in expected_text for word in ("responsabilidades", "dominio", "arquitectura")):
        if any(token in lower_code for token in ("class ", "function ", "service", "module.exports", "export function")):
            expected_hits += 1
    if any(word in expected_text for word in ("html", "accesible")):
        if any(token in lower_code for token in ("<", "aria", "role=", "class=", "html")):
            expected_hits += 1
    if len(transcript_text) >= 200:
        expected_hits += 1

    completion_level = "none"
    if has_code or has_notes:
        completion_level = "attempted"
    if (has_code and todo_count <= 1 and expected_hits >= 1) or (has_notes and expected_hits >= 1):
        completion_level = "partial"
    if run_success and todo_count <= 1:
        completion_level = "executed_success"

    return {
        "has_code": has_code,
        "has_notes": has_notes,
        "meaningful_code_lines": len(meaningful_lines),
        "todo_count": todo_count,
        "file_count": len(files),
        "folder_count": len(folders),
        "file_paths": file_paths[:30],
        "extensions": extensions,
        "has_project_structure": has_project_structure,
        "architecture_hits": architecture_hits,
        "has_tests_or_validation": has_tests_or_validation,
        "has_error_handling": has_error_handling,
        "ran_code": ran,
        "run_success": run_success,
        "run_error": run_error,
        "expected_hits": expected_hits,
        "completion_level": completion_level,
        "last_run_language": last_run.get("language") if last_run else workspace_state.get("codeLanguage"),
        "last_run_exit_code": last_run.get("exit_code") if last_run else None,
    }


def _apply_evidence_caps(score: int, evidence: Dict[str, Any]) -> int:
    completion_level = evidence.get("completion_level")
    if completion_level == "none":
        return min(score, 25)
    if completion_level == "attempted":
        return min(score, 55)
    if completion_level == "partial" and not evidence.get("ran_code"):
        cap = 78 if evidence.get("has_project_structure") and evidence.get("architecture_hits", 0) >= 2 else 72
        return min(score, cap)
    if evidence.get("run_error"):
        cap = 82 if evidence.get("has_project_structure") and evidence.get("architecture_hits", 0) >= 3 else 74
        return min(score, cap)
    if evidence.get("todo_count", 0) >= 3:
        return min(score, 60)
    return score
