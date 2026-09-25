from typing import List
import json
import re
from langchain_core.prompts import ChatPromptTemplate
from shared.llm_client.llm_client import llm
from screening.schemas import CandidateProfile, JobRequirements

DEFAULT_SCORE_THRESHOLD = 70.0

SCREENING_PROMPT = """Eres un reclutador senior de Achanvear. Evalua si cada candidato debe pasar a entrevista.

PUESTO: {job_title}
DESCRIPCION: {job_description}
SKILLS REQUERIDOS: {required_skills}
EXPERIENCIA MINIMA: {experience_min} anos
CARRERA / CARRERA AFIN: {career}
PUNTAJE MINIMO PARA PASAR: {threshold}

CANDIDATOS CON EVIDENCIA:
{candidates_text}

REGLAS OBLIGATORIAS:
- No recomiendes a nadie sin evidencia concreta en CV, biografia, carta o skills.
- Si el CV/carta/biografia no menciona tecnologias, experiencia o dominio relacionado al puesto, recommended debe ser false.
- Penaliza CV genericos, vacios, irrelevantes o con contenido que no corresponde al puesto.
- Si la experiencia declarada es menor a la EXPERIENCIA MINIMA, recommended debe ser false.
- Si la CARRERA del puesto esta definida y el candidato no tiene formacion ni experiencia afines, penaliza fuerte.
- recommended=true solo si score >= {threshold} y hay coincidencia clara entre el puesto y el perfil.
- Devuelve SOLO JSON valido, sin markdown.

Estructura exacta:
{{
  "candidates": [
    {{
      "user_id": "id del candidato",
      "name": "nombre del candidato",
      "score": 0-100,
      "match_percentage": 0-100,
      "reason": "explicacion breve basada en evidencia",
      "recommended": true o false
    }}
  ]
}}
"""

STOPWORDS = {
    "para", "con", "los", "las", "una", "uno", "del", "por", "que", "de", "la", "el", "en",
    "and", "the", "for", "from", "this", "that", "you", "your", "job", "work", "project",
    "proyecto", "puesto", "servicio", "experiencia", "perfil", "candidato", "empresa"
}


async def run_screening(
    job: JobRequirements,
    candidates: List[CandidateProfile],
    max_select: int = 16,
    threshold: float = DEFAULT_SCORE_THRESHOLD,
):
    candidates_text = "\n\n".join([format_candidate(c) for c in candidates])

    prompt = ChatPromptTemplate.from_template(SCREENING_PROMPT)
    chain = prompt | llm

    try:
        result_text = await chain.ainvoke({
            "job_title": job.title,
            "job_description": job.description,
            "required_skills": ", ".join(job.required_skills),
            "experience_min": job.experience_min,
            "career": job.career or "No especificada",
            "threshold": threshold,
            "candidates_text": candidates_text,
        })
    except Exception as e:
        print(f"[SCREENING] Error invocando LLM: {e}")
        raise

    if hasattr(result_text, "content"):
        result_text = result_text.content

    json_match = re.search(r"\{.*\}", result_text, re.DOTALL)
    if not json_match:
        raise ValueError(f"No se pudo extraer JSON de la respuesta del LLM: {result_text[:200]}")

    try:
        data = json.loads(json_match.group())
    except json.JSONDecodeError as e:
        raise ValueError(f"Error parseando JSON del LLM: {e}")

    llm_results = {str(c.get("user_id")): c for c in data.get("candidates", [])}
    evaluated = []

    for candidate in candidates:
        llm_result = llm_results.get(candidate.user_id, {})
        guarded = apply_evidence_gate(job, candidate, llm_result, threshold)
        evaluated.append(guarded)

    selected = [c for c in evaluated if c.get("recommended", False)]
    selected = sorted(selected, key=lambda c: c.get("score", 0), reverse=True)[:max_select]
    selected_ids = {c["user_id"] for c in selected}
    rejected = [c for c in evaluated if c["user_id"] not in selected_ids]

    return {
        "selected_candidates": selected,
        "rejected_candidates": rejected,
        "total_evaluated": len(candidates),
    }



def format_candidate(candidate: CandidateProfile) -> str:
    return (
        f"- {candidate.name} (ID: {candidate.user_id})\n"
        f"  skills={candidate.skills}\n"
        f"  experiencia={candidate.experience_years} anos\n"
        f"  carrera={candidate.career}\n"
        f"  biografia={short_text(candidate.biography, 1200)}\n"
        f"  carta={short_text(candidate.cover_letter, 1200)}\n"
        f"  cv_data={short_text(candidate.cv_data, 3500)}\n"
        f"  cv_url={candidate.cv_url or ''}"
    )


def apply_evidence_gate(
    job: JobRequirements,
    candidate: CandidateProfile,
    llm_result: dict,
    threshold: float = DEFAULT_SCORE_THRESHOLD,
) -> dict:
    evidence_text = " ".join([
        candidate.career or "",
        " ".join(candidate.skills or []),
        candidate.biography or "",
        candidate.cover_letter or "",
        candidate.cv_data or "",
    ]).lower()

    job_terms = extract_job_terms(job)
    matched_terms = [term for term in job_terms if term_matches(term, evidence_text)]
    match_ratio = len(matched_terms) / max(len(job_terms), 1)
    has_real_evidence = len(evidence_text.strip()) >= 80

    # Coincidencia obligatoria con el puesto: exige al menos 3 terminos o 40% del total.
    min_overlap = min(3, len(job_terms)) if len(job_terms) >= 3 else len(job_terms)
    has_required_overlap = len(matched_terms) >= min_overlap or match_ratio >= 0.40

    # Experiencia declarada vs experiencia minima del puesto.
    required_years = to_float(job.experience_min)
    candidate_years = to_float(candidate.experience_years)
    meets_experience = True
    if required_years > 0:
        meets_experience = candidate_years >= required_years

    # Carrera afin: solo se evalua si el puesto define una carrera.
    meets_career = True
    required_career = normalize_term(job.career)
    if required_career and required_career not in ("", "no especificada", "sin especificar"):
        career_tokens = [
            t for t in re.findall(r"[a-zA-Z0-9]{4,}", required_career)
            if t not in STOPWORDS
        ]
        meets_career = any(token in evidence_text for token in career_tokens) if career_tokens else True

    raw_score = to_float(llm_result.get("score", 0))
    score = raw_score
    reason = str(llm_result.get("reason") or "").strip()

    # El resultado del LLM nunca puede ser mas permisivo que las reglas duras.
    if not has_real_evidence:
        score = min(score, 20)
        reason = "No hay evidencia suficiente en CV, biografia o carta para validar el perfil."
    elif not has_required_overlap:
        score = min(score, 45)
        reason = (
            "El perfil no muestra coincidencia suficiente con el puesto. "
            f"Coincidencias encontradas: {', '.join(matched_terms[:8]) or 'ninguna'}."
        )
    elif not meets_experience:
        score = min(score, 45)
        reason = (
            f"Experiencia declarada ({candidate_years:g} anos) insuficiente para el puesto "
            f"(minimo {required_years:g} anos)."
        )
    elif not meets_career:
        score = min(score, 55)
        reason = (
            "La formacion o experiencia del candidato no es afina a la carrera solicitada "
            f"({job.career})."
        )

    recommended = (
        score >= threshold
        and has_real_evidence
        and has_required_overlap
        and meets_experience
        and meets_career
        and bool(llm_result.get("recommended", False))
    )

    return {
        "user_id": candidate.user_id,
        "name": candidate.name,
        "score": round(score, 2),
        "match_percentage": round(min(score, match_ratio * 100 if not recommended else score), 2),
        "reason": reason or "Evaluacion completada.",
        "recommended": recommended,
    }



def extract_job_terms(job: JobRequirements) -> List[str]:
    clean = []
    for skill in job.required_skills or []:
        normalized = normalize_term(skill)
        if normalized and normalized not in STOPWORDS and normalized not in clean:
            clean.append(normalized)

    text = " ".join([job.title or "", job.description or "", job.career or ""]).lower()
    tokens = re.findall(r"[a-zA-Z0-9+#.]{3,}", text)
    for token in tokens:
        token = normalize_term(token)
        if token and token not in STOPWORDS and token not in clean:
            clean.append(token)
    return clean[:30]


def term_matches(term: str, evidence_text: str) -> bool:
    escaped = re.escape(term)
    return re.search(rf"(?<![a-zA-Z0-9]){escaped}(?![a-zA-Z0-9])", evidence_text) is not None


def normalize_term(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value.lower()).strip(".,;:()[]{}")


def short_text(value: str | None, max_len: int) -> str:
    if not value:
        return ""
    normalized = re.sub(r"\s+", " ", value).strip()
    return normalized[:max_len]


def to_float(value) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0
