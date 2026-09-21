from typing import List
import json
import re
from langchain_core.prompts import ChatPromptTemplate
from shared.llm_client.llm_client import llm
from screening.schemas import CandidateProfile, JobRequirements

SCREENING_PROMPT = """
Eres un reclutador senior de Achanvear. Analiza los siguientes candidatos para el puesto:

PUESTO: {job_title}
DESCRIPCION: {job_description}
SKILLS REQUERIDOS: {required_skills}
EXPERIENCIA MINIMA: {experience_min} años
CARRERA: {career}

CANDIDATOS:
{candidates_text}

INSTRUCCIONES:
Evalúa CADA candidato y devuelve SOLO UN JSON con esta estructura exacta:
{{
  "candidates": [
    {{
      "user_id": "id del candidato",
      "name": "nombre del candidato",
      "score": 0-100,
      "match_percentage": 0-100,
      "reason": "explicación breve",
      "recommended": true o false
    }}
  ]
}}

Donde recommended=true si score > 70.
Devuelve SOLO el JSON, sin markdown ni explicaciones adicionales.
"""

async def run_screening(job: JobRequirements, candidates: List[CandidateProfile], max_select: int = 16):
    # Preparar texto de candidatos
    candidates_text = "\n".join([
        f"- {c.name} (ID: {c.user_id}): skills={c.skills}, experiencia={c.experience_years}años, carrera={c.career}"
        for c in candidates
    ])
    
    prompt = ChatPromptTemplate.from_template(SCREENING_PROMPT)
    chain = prompt | llm
    
    try:
        # ✅ ASYNC: usamos ainvoke en lugar de invoke
        result_text = await chain.ainvoke({
            "job_title": job.title,
            "job_description": job.description,
            "required_skills": ", ".join(job.required_skills),
            "experience_min": job.experience_min,
            "career": job.career,
            "candidates_text": candidates_text,
        })
    except Exception as e:
        print(f"[SCREENING] Error invocando LLM: {e}")
        raise
    
    # Extraer contenido del mensaje
    if hasattr(result_text, 'content'):
        result_text = result_text.content
    
    # Extraer JSON de la respuesta
    json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
    if not json_match:
        raise ValueError(f"No se pudo extraer JSON de la respuesta del LLM: {result_text[:200]}")
    
    try:
        data = json.loads(json_match.group())
    except json.JSONDecodeError as e:
        raise ValueError(f"Error parseando JSON del LLM: {e}")
    
    candidates_list = data.get("candidates", [])
    
    selected = [c for c in candidates_list if c.get("recommended", False)]
    rejected = [c for c in candidates_list if not c.get("recommended", False)]
    
    return {
        "selected_candidates": selected,
        "rejected_candidates": rejected,
        "total_evaluated": len(candidates)
    }
