from langchain_core.prompts import ChatPromptTemplate
from shared.llm_client.llm_client import llm
from technical_interview.schemas import ChallengeType, Challenge
import json

# PROMPT MAESTRO: No importa la carrera, la IA decide el tipo de reto.
UNIVERSAL_CHALLENGE_PROMPT = """
Eres un Reclutador Senior Experto en {country}. 
Tu misión es generar un reto técnico de alto nivel para la posición de {job_title} en la carrera de {career}.

INSTRUCCIONES:
1. El reto debe ser realista y contextualizado a la realidad laboral de {country}.
2. Identifica el tipo de reto adecuado: 
   - Si es tecnología: CODING.
   - Si es leyes: LEGAL_CASE.
   - Si es creativo: DESIGN_BRIEF.
   - Cualquier otro: ANALYTICAL_CASE (Resolución de problemas).
3. Incluye:
   - Título impactante.
   - Descripción detallada del problema.
   - Instrucciones paso a paso.
   - 3 criterios de evaluación o 'outputs' esperados.

FORMATO DE SALIDA (ESTRICTO JSON):
{{
  "type": "CODING | LEGAL_CASE | DESIGN_BRIEF | ANALYTICAL_CASE",
  "title": "Nombre del reto",
  "description": "Explicación del problema...",
  "instructions": "1. Paso uno, 2. Paso dos...",
  "expected_output": ["criterio 1", "criterio 2", "criterio 3"],
  "time_limit": 900
}}
"""

async def generate_challenge(career: str, job_title: str, country: str = "Peru") -> Challenge:
    # 1. Configuramos el prompt universal
    prompt = ChatPromptTemplate.from_template(UNIVERSAL_CHALLENGE_PROMPT)
    
    # 2. Creamos la cadena (Chain)
    chain = prompt | llm
    
    # 3. ✅ ASYNC: Invocamos a la IA con los datos del candidato
    response = await chain.ainvoke({
        "career": career,
        "job_title": job_title,
        "country": country
    })
    
    # 4. Intentamos parsear el JSON (asumiendo que el LLM cumple el formato)
    try:
        data = json.loads(response.content)
    except:
        # Fallback si la IA falla en el formato
        data = {
            "type": "ANALYTICAL_CASE",
            "title": f"Evaluación de {job_title}",
            "description": response.content[:500],
            "instructions": "Resuelve el caso planteado con ética y profesionalismo.",
            "expected_output": ["Resolución lógica", "Claridad", "Dominio técnico"],
            "time_limit": 900
        }

    return Challenge(
        id="ch_" + career[:3].lower() + "_" + job_title[:3].lower(),
        type=data["type"],
        title=data["title"],
        description=data["description"],
        instructions=data["instructions"],
        time_limit=data["time_limit"],
        expected_output=data["expected_output"]
    )
