from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from shared.llm_client.llm_client import llm
from typing import List


async def generate_questions(
    career: str,
    job_title: str,
    country: str = "Peru",
    num_questions: int = 20
) -> List[dict]:
    """
    Genera 20 preguntas para entrevista teorica:
    - 10 tecnicas del empleo
    - 5 psicologicas
    - 3 de trabajo en equipo
    - 2 abiertas
    """

    parser = JsonOutputParser()

    prompt = ChatPromptTemplate.from_template("""
    Eres un entrevistador senior. Genera exactamente {num_questions} preguntas para una entrevista teorica.

    DATOS DEL PUESTO:
    - Carrera o rubro: {career}
    - Cargo: {job_title}
    - Contexto: {country}

    DISTRIBUCION OBLIGATORIA:
    - Preguntas 1 a 10: tecnicas y especificas del empleo {job_title}.
    - Preguntas 11 a 15: psicologicas/laborales.
    - Preguntas 16 a 18: trabajo en equipo, comunicacion y conflictos.
    - Preguntas 19 a 20: abiertas para explicar experiencia, logros o propuesta de mejora.

    REGLAS:
    - Cada pregunta debe ser clara, directa y responderse en 60-90 segundos.
    - Las preguntas tecnicas deben evaluar herramientas, arquitectura, resolucion de problemas, calidad, seguridad, despliegue, pruebas y criterio profesional segun el cargo.
    - Si el puesto no es tecnologia, adapta las tecnicas al rubro, funciones, normativa, herramientas y casos reales del empleo.
    - No preguntes cosas genericas si puedes hacerlas especificas al cargo.
    - Devuelve SOLO JSON valido: un array de objetos.

    Formato exacto de cada objeto:
    {{
      "text": "pregunta",
      "category": "technical | psychological | teamwork | open",
      "expected_concepts": ["concepto1", "concepto2", "concepto3"]
    }}

    {format_instructions}
    """)

    chain = prompt | llm | parser
    fallback = fallback_questions(career, job_title)

    try:
        questions = await chain.ainvoke({
            "career": career or "No especificada",
            "job_title": job_title or "el puesto",
            "country": country,
            "num_questions": num_questions,
            "format_instructions": parser.get_format_instructions()
        })

        if not isinstance(questions, list):
            print("[WARN] El generador no devolvio una lista. Usando fallback.")
            return fallback[:num_questions]

        normalized = []
        for item in questions:
            if isinstance(item, dict):
                text = str(item.get("text") or "").strip()
                if text:
                    normalized.append({
                        "text": text,
                        "category": str(item.get("category") or "technical"),
                        "expected_concepts": item.get("expected_concepts") or []
                    })
            elif str(item).strip():
                normalized.append({
                    "text": str(item).strip(),
                    "category": infer_category(len(normalized)),
                    "expected_concepts": []
                })

        while len(normalized) < num_questions:
            normalized.append(fallback[len(normalized)])

        return normalized[:num_questions]

    except Exception as e:
        print(f"[ERROR] Question Generator: {str(e)}. Usando fallback.")
        return fallback[:num_questions]


def infer_category(index: int) -> str:
    if index < 10:
        return "technical"
    if index < 15:
        return "psychological"
    if index < 18:
        return "teamwork"
    return "open"


def fallback_questions(career: str, job_title: str) -> List[dict]:
    role = job_title or "el puesto"
    area = career or role
    return [
        q(f"Explica tu experiencia tecnica mas relevante para {role}.", "technical", ["experiencia", "herramientas", "resultados"]),
        q(f"Que arquitectura o enfoque usarias para resolver un caso real de {role}?", "technical", ["arquitectura", "criterio", "solucion"]),
        q("Como aseguras calidad antes de entregar una funcionalidad o trabajo?", "technical", ["pruebas", "revision", "calidad"]),
        q("Describe una herramienta clave que dominas y como la aplicaste en produccion.", "technical", ["herramienta", "produccion", "impacto"]),
        q("Como investigas y resuelves un error dificil cuando no tienes la respuesta inmediata?", "technical", ["diagnostico", "investigacion", "solucion"]),
        q(f"Que riesgos tecnicos o funcionales revisarias antes de iniciar un proyecto de {area}?", "technical", ["riesgos", "planificacion", "prevencion"]),
        q("Como documentas tu trabajo para que otra persona pueda continuarlo?", "technical", ["documentacion", "claridad", "transferencia"]),
        q("Que indicadores usas para saber si tu solucion funciona bien?", "technical", ["metricas", "rendimiento", "calidad"]),
        q("Describe un problema de rendimiento, seguridad o estabilidad que hayas solucionado.", "technical", ["rendimiento", "seguridad", "estabilidad"]),
        q(f"Que decisiones tecnicas tomarias en los primeros dias si fueras elegido para {role}?", "technical", ["priorizacion", "analisis", "ejecucion"]),
        q(f"Por que te interesa el puesto de {role}?", "psychological", ["motivacion", "alineacion", "objetivo"]),
        q("Cuales son tus principales fortalezas y que aspecto estas mejorando?", "psychological", ["fortalezas", "mejora", "autoconocimiento"]),
        q("Como manejas la presion cuando hay fechas ajustadas?", "psychological", ["presion", "organizacion", "resiliencia"]),
        q("Que haces cuando recibes feedback critico sobre tu trabajo?", "psychological", ["feedback", "aprendizaje", "mejora"]),
        q("Donde te ves profesionalmente en los proximos anos?", "psychological", ["metas", "crecimiento", "coherencia"]),
        q("Describe una situacion donde tu equipo no estaba de acuerdo y como ayudaste a resolverla.", "teamwork", ["equipo", "conflicto", "comunicacion"]),
        q("Como coordinas tareas con perfiles de otras areas?", "teamwork", ["coordinacion", "comunicacion", "colaboracion"]),
        q("Que haces si un companero bloquea una entrega importante?", "teamwork", ["apoyo", "gestion", "responsabilidad"]),
        q("Cuentame un logro profesional del que estes orgulloso y por que.", "open", ["logro", "impacto", "aprendizaje"]),
        q(f"Propón una mejora que podrias aportar al area o proyecto relacionado con {role}.", "open", ["mejora", "propuesta", "valor"]),
    ]


def q(text: str, category: str, concepts: List[str]) -> dict:
    return {"text": text, "category": category, "expected_concepts": concepts}
