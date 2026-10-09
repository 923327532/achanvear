from typing import List
import json
import re
from langchain_core.prompts import ChatPromptTemplate
from shared.llm_client.llm_client import llm
from screening.schemas import CandidateProfile, JobRequirements

DEFAULT_SCORE_THRESHOLD = 60.0

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
- Si el CV/carta/biografia no menciona tecnologias, experiencia, funciones o dominio relacionado al puesto, recommended debe ser false.
- Para recomendar, identifica seniales positivas: experiencia relevante, proyectos/logros, herramientas dominadas, rubro afin, responsabilidades similares o formacion/certificaciones afines.
- No basta con repetir una palabra clave del puesto; debe existir evidencia de uso, trabajo, estudio, proyecto o logro relacionado.
- Penaliza CV genericos, vacios, irrelevantes o con contenido que no corresponde al puesto.
- Si la experiencia declarada es menor a la EXPERIENCIA MINIMA, recommended debe ser false.
- Si la CARRERA del puesto esta definida explicitamente y el candidato no tiene formacion ni experiencia afines, penaliza fuerte.
- Evalua segun el nivel real del puesto: junior/trainee no debe exigir historial senior; senior/lider si debe exigir evidencia fuerte.
- Para puestos no tecnologicos, no fuerces tecnologias: evalua funciones, rubro, logros, herramientas y experiencia del CV.
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
    "un", "al", "lo", "su", "sus", "y", "o", "a", "se", "ser", "como", "mas", "muy",
    "requisito", "requisitos", "deseable", "indispensable", "minimo", "minima", "nivel",
    "basico", "intermedio", "avanzado", "conocimiento", "conocimientos", "manejo", "dominio",
    "anos", "aos", "años", "experiencia", "experiencias", "trabajo", "trabajar",
    "and", "the", "for", "from", "this", "that", "you", "your", "job", "work", "project",
    "proyecto", "puesto", "servicio", "perfil", "candidato", "empresa"
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
    evidence_quality = assess_evidence_quality(candidate, evidence_text, matched_terms)
    has_real_evidence = evidence_quality["has_real_evidence"]

    # Coincidencia obligatoria solo cuando el puesto tiene requisitos concretos.
    # Si no hay skills/requisitos claros, el LLM evalua semantica por rubro, funciones y seniority.
    requires_literal_overlap = len(job.required_skills or []) >= 2
    min_overlap = min(2, len(job_terms)) if len(job_terms) >= 2 else len(job_terms)
    has_required_overlap = (
        not requires_literal_overlap
        or len(matched_terms) >= min_overlap
        or match_ratio >= 0.25
    )
    has_cv_or_profile_evidence = evidence_quality["substantive_sources"] >= 1
    has_positive_fit = evidence_quality["positive_signal_count"] >= 2

    # Experiencia declarada vs experiencia minima del puesto.
    required_years = to_float(job.experience_min)
    candidate_years = to_float(candidate.experience_years)
    meets_experience = True
    if required_years > 0:
        meets_experience = candidate_years >= required_years

    # Carrera afin: solo se evalua si el puesto define una carrera.
    meets_career = True
    required_career = normalize_term(job.career)
    explicit_career = required_career and required_career not in ("", "no especificada", "sin especificar")
    if explicit_career:
        career_tokens = [
            t for t in re.findall(r"[a-zA-Z0-9]{4,}", required_career)
            if t not in STOPWORDS
        ]
        # No tratar titulos genericos como carrera obligatoria.
        meets_career = True if len(career_tokens) < 2 else any(token in evidence_text for token in career_tokens)

    raw_score = to_float(llm_result.get("score", 0))
    score = raw_score
    reason = str(llm_result.get("reason") or "").strip()

    # El resultado del LLM nunca puede ser mas permisivo que las reglas duras.
    if not has_real_evidence:
        score = min(score, 20)
        reason = "No hay evidencia suficiente en CV, biografia o carta para validar el perfil."
    elif not has_cv_or_profile_evidence:
        score = min(score, 35)
        reason = "El candidato no presenta evidencia sustantiva en CV, biografia o carta para sustentar una entrevista teorica."
    elif not has_required_overlap:
        score = min(score, 68)
        reason = (
            "El perfil tiene evidencia, pero no muestra suficientes coincidencias con los requisitos configurados. "
            f"Coincidencias encontradas: {', '.join(matched_terms[:8]) or 'ninguna'}."
        )
    elif not has_positive_fit:
        score = min(score, 69)
        reason = (
            "Hay algunas coincidencias, pero faltan seniales positivas suficientes de experiencia, proyectos, herramientas, "
            "logros o formacion afin para recomendar entrevista teorica."
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

    llm_recommended = bool(llm_result.get("recommended", False))
    recommended = (
        score >= threshold
        and has_real_evidence
        and has_cv_or_profile_evidence
        and has_required_overlap
        and has_positive_fit
        and meets_experience
        and meets_career
    )
    if recommended and not llm_recommended:
        reason = (
            (reason + " " if reason else "")
            + "Validado por puntaje y evidencia suficiente aunque la respuesta inicial del agente fue conservadora."
        )

    return {
        "user_id": candidate.user_id,
        "name": candidate.name,
        "score": round(score, 2),
        "match_percentage": round(min(score, match_ratio * 100 if not recommended else score), 2),
        "reason": enrich_reason(reason, evidence_quality, matched_terms),
        "recommended": recommended,
    }


def assess_evidence_quality(
    candidate: CandidateProfile,
    evidence_text: str,
    matched_terms: List[str],
) -> dict:
    sources = [
        candidate.cv_data or "",
        candidate.biography or "",
        candidate.cover_letter or "",
    ]
    substantive_sources = sum(1 for source in sources if len(short_text(source, 5000).split()) >= 12)
    has_real_evidence = len(evidence_text.strip()) >= 120 and substantive_sources >= 1

    positive_patterns = [
        r"\b(trabaje|trabajo|experiencia|desarrolle|implemente|lidere|participe|gestione|coordine)\b",
        r"\b(proyecto|proyectos|sistema|sistemas|aplicacion|plataforma|servicio|api|crm)\b",
        r"\b(logre|mejore|optimice|reduje|aumente|automatice|despliegue|deploy|pruebas|tests?)\b",
        r"\b(certificacion|certificado|curso|bootcamp|universidad|instituto|carrera|formacion)\b",
        r"\b(java|spring|react|next|astro|aws|docker|sql|postgres|mysql|python|node|typescript)\b",
        r"\b(banca|seguros|finanzas|ventas|retail|operaciones|administrativo|legal|marketing)\b",
    ]
    positive_signal_count = sum(1 for pattern in positive_patterns if re.search(pattern, evidence_text))

    if len(matched_terms) >= 2:
        positive_signal_count += 1
    if candidate.experience_years and candidate.experience_years > 0:
        positive_signal_count += 1
    if candidate.cv_url:
        positive_signal_count += 1

    return {
        "has_real_evidence": has_real_evidence,
        "substantive_sources": substantive_sources,
        "positive_signal_count": positive_signal_count,
    }


def enrich_reason(reason: str, evidence_quality: dict, matched_terms: List[str]) -> str:
    base = reason or "Evaluacion completada."
    sources = evidence_quality.get("substantive_sources", 0)
    signals = evidence_quality.get("positive_signal_count", 0)
    matches = ", ".join(matched_terms[:6]) if matched_terms else "sin coincidencias fuertes"
    return (
        f"{base} Evidencia revisada: {sources} fuente(s) sustantiva(s), "
        f"{signals} senial(es) positiva(s), coincidencias: {matches}."
    )



def extract_job_terms(job: JobRequirements) -> List[str]:
    clean = []
    for skill in job.required_skills or []:
        normalized = normalize_term(skill)
        if is_useful_term(normalized) and normalized not in clean:
            clean.append(normalized)
        for token in split_terms(normalized):
            if token not in clean:
                clean.append(token)

    if clean:
        return clean[:30]

    text = " ".join([job.title or "", job.description or "", job.career or ""]).lower()
    tokens = re.findall(r"[a-zA-Z0-9+#.]{3,}", text)
    for token in tokens:
        token = normalize_term(token)
        if is_useful_term(token) and token not in clean:
            clean.append(token)
    return clean[:30]


def term_matches(term: str, evidence_text: str) -> bool:
    escaped = re.escape(term)
    return re.search(rf"(?<![a-zA-Z0-9]){escaped}(?![a-zA-Z0-9])", evidence_text) is not None


def normalize_term(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value.lower()).strip(".,;:()[]{}")


def split_terms(value: str) -> List[str]:
    if not value:
        return []
    tokens = re.findall(r"[a-zA-Z0-9+#.]{3,}", value)
    return [token for token in (normalize_term(t) for t in tokens) if is_useful_term(token)]


def is_useful_term(value: str | None) -> bool:
    if not value:
        return False
    if value in STOPWORDS:
        return False
    if len(value) < 3:
        return False
    return True


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
