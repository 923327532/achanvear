from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from shared.llm_client.llm_client import llm
from typing import List

async def generate_questions(
    career: str, 
    job_title: str, 
    country: str = "Peru", 
    num_questions: int = 15
) -> List[str]:
    """
    Genera 15 preguntas para entrevista teórica:
    - 5 preguntas psicológicas/soft skills (motivación, trabajo en equipo, etc.)
    - 10 preguntas técnicas específicas del puesto
    Cada pregunta tiene 90 segundos para responder.
    """
    
    parser = JsonOutputParser()

    prompt = ChatPromptTemplate.from_template("""
    Eres un entrevistador experto en reclutamiento freelance.
    Tu tarea es generar exactamente {num_questions} preguntas para una entrevista teórica.

    DATOS DEL PUESTO:
    - Carrera: {career}
    - Cargo: {job_title}
    - Ubicación/Contexto: {country}

    ESTRUCTURA DE LA ENTREVISTA (15 preguntas en total):
    
    PRIMERAS 5 PREGUNTAS — PSICOLÓGICAS / SOFT SKILLS:
    Preguntas sobre el candidato:
    1. ¿Por qué te interesa el puesto de {job_title} que has solicitado?
    2. ¿Cuáles son tus principales fortalezas y debilidades para este rol?
    3. Describe una situación donde trabajaste en equipo y lograste un objetivo.
    4. ¿Cómo manejas el estrés o la presión en el trabajo?
    5. ¿Dónde te ves profesionalmente en los próximos años?

    SIGUIENTES 10 PREGUNTAS — TÉCNICAS (específicas del puesto):
    Preguntas técnicas de nivel Senior (mínimo 3-5 años de experiencia) sobre:
    - Fundamentos sólidos de {career} y {job_title}
    - Herramientas y tecnologías actuales del rubro
    - Resolución de problemas y casos prácticos
    - Adaptadas a la normativa y contexto de {country}

    REGLAS:
    - Cada pregunta debe ser clara, directa y puntual (máximo 2 líneas)
    - Responde ÚNICAMENTE con un array de 15 strings en formato JSON
    - Las 5 primeras deben ser las preguntas psicológicas
    - Las 10 siguientes deben ser las preguntas técnicas
    - NO menciones "Achanvear" ni la plataforma en las preguntas
    - Las preguntas deben ser sobre la empresa que publica el puesto y el trabajo específico
    
    {format_instructions}
    """)

    chain = prompt | llm | parser

    _FALLBACK = [
        "¿Por qué te interesa este puesto?",
        "¿Cuáles son tus principales fortalezas?",
        "Cuéntame sobre una experiencia de trabajo en equipo.",
        "¿Cómo manejas la presión laboral?",
        "¿Dónde te ves en 5 años?",
        f"Describe tu experiencia más significativa en {career}",
        "¿Qué herramientas dominas en tu área?",
        "Explícame un proyecto complejo que hayas liderado.",
        "¿Cómo mantienes actualizados tus conocimientos técnicos?",
        "Resuelve el siguiente caso práctico de tu especialidad.",
        "¿Qué metodologías de trabajo conoces y cuál prefieres?",
        "Describe un error técnico que hayas cometido y cómo lo solucionaste.",
        "¿Cómo evalúas la calidad de tu trabajo?",
        "¿Qué harías si recibes feedback negativo de un cliente?",
        "Propón una mejora para el proceso actual de tu área."
    ]

    try:
        questions = await chain.ainvoke({
            "career": career,
            "job_title": job_title,
            "country": country,
            "num_questions": num_questions,
            "format_instructions": parser.get_format_instructions()
        })
        
        # Si la IA devolvió menos preguntas de las solicitadas, rellenar con fallback
        if not isinstance(questions, list) or len(questions) < num_questions:
            print(f"[WARN] Solo se generaron {len(questions) if isinstance(questions, list) else 0} preguntas. Rellenando con fallback.")
            result = questions[:] if isinstance(questions, list) else []
            while len(result) < num_questions:
                result.append(_FALLBACK[len(result) % len(_FALLBACK)])
            return result[:num_questions]
        
        return questions[:num_questions]
    
    except Exception as e:
        print(f"[ERROR] Question Generator: {str(e)}. Usando fallback.")
        return _FALLBACK[:num_questions]
