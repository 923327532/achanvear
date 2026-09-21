from langchain_core.prompts import ChatPromptTemplate
from shared.llm_client.llm_client import llm
import json

# PROMPT UNIVERSAL DE EVALUACIÓN TÉCNICA
UNIVERSAL_EVAL_PROMPT = """
Eres un Senior Lead y Reclutador Experto en {country} para la carrera de {career}.
Tu objetivo es evaluar la solución técnica de un candidato para el puesto de {job_title}.

CONTEXTO DE EVALUACIÓN:
- Utiliza estándares internacionales y normativas locales de {country} vigentes a 2026.
- Evalúa la profundidad técnica, el uso de herramientas modernas y la viabilidad práctica.

RETO PLANTEADO: {question}
RESPUESTA DEL CANDIDATO: {answer}

CRITERIOS DE CALIFICACIÓN (0-100):
1. Precisión Técnica (50%): ¿Es correcta la solución para un nivel Senior?
2. Contexto Local (20%): ¿Aplica normativas o estándares de {country} (ej. SUNAT, leyes, ISO, reglamentos)?
3. Calidad y Estructura (30%): ¿La respuesta es profesional y bien fundamentada?

RESPONDE EXCLUSIVAMENTE EN FORMATO JSON:
{{
  "score": 0-100,
  "accuracy_level": "alta | media | baja",
  "strengths": ["punto 1", "punto 2"],
  "weaknesses": ["falta X", "error en Y"],
  "technical_feedback": "Resumen detallado de la evaluación..."
}}
"""

async def evaluate_technical_challenge(career: str, job_title: str, question: str, answer: str, country: str = "Peru") -> dict:
    prompt = ChatPromptTemplate.from_template(UNIVERSAL_EVAL_PROMPT)
    
    chain = prompt | llm
    
    # ✅ ASYNC: usamos ainvoke en lugar de invoke
    response = await chain.ainvoke({
        "career": career,
        "job_title": job_title,
        "country": country,
        "question": question,
        "answer": answer
    })
    
    try:
        # Parseamos el JSON generado por la IA
        eval_data = json.loads(response.content)
    except:
        # Fallback de seguridad si la IA no devuelve JSON limpio
        eval_data = {
            "score": 50,
            "accuracy_level": "desconocida",
            "strengths": [],
            "weaknesses": ["Error en el formato de evaluación"],
            "technical_feedback": response.content
        }
    
    return eval_data
