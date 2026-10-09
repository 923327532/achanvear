from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from shared.llm_client.llm_client import llm
from typing import List
import re

from shared.schemas import AnswerEval


async def evaluate_answer(
    question: str,
    answer: str,
    expected_concepts: List[str]
):
    """
    Evalua una respuesta teorica/tecnica basada en evidencia y conceptos esperados.
    """

    parser = PydanticOutputParser(pydantic_object=AnswerEval)

    prompt = ChatPromptTemplate.from_template("""
    Eres un evaluador senior de entrevistas laborales.

    Evalua la siguiente respuesta:

    PREGUNTA:
    {question}

    RESPUESTA:
    {answer}

    CONCEPTOS ESPERADOS:
    {concepts}

    Instrucciones:
    - Evalua del 0 al 100.
    - Considera precision tecnica, claridad, evidencia concreta, experiencia y cobertura de conceptos.
    - No pongas 0 si la respuesta tiene evidencia laboral real, aunque sea breve o tenga errores de escritura.
    - Usa 0-20 solo para respuestas vacias, incoherentes o totalmente fuera de tema.
    - Usa 40-60 para respuestas basicas pero relacionadas.
    - Usa 60-80 para respuestas con ejemplos concretos, herramientas o decisiones razonables.
    - Usa 80-100 para respuestas completas, especificas y bien fundamentadas.
    - Devuelve JSON valido.

    {format_instructions}
    """)

    chain = prompt | llm | parser

    try:
        evaluation = await chain.ainvoke({
            "question": question,
            "answer": answer,
            "concepts": ", ".join(expected_concepts or []),
            "format_instructions": parser.get_format_instructions()
        })

        validated_eval = evaluation if isinstance(evaluation, AnswerEval) else AnswerEval(**evaluation)
        safe_score = max(float(validated_eval.score), heuristic_score(question, answer, expected_concepts))

        details = validated_eval.model_dump()
        details["heuristic_floor"] = heuristic_score(question, answer, expected_concepts)

        return {
            "score": round(min(safe_score, 100), 2),
            "details": details,
            "passed": safe_score >= 75
        }

    except Exception as e:
        print(f"Error evaluando respuesta teorica: {e}")
        score = heuristic_score(question, answer, expected_concepts)
        hits = matched_concepts(answer, expected_concepts)
        return {
            "score": score,
            "details": {
                "error": str(e),
                "fallback": "Evaluacion heuristica aplicada por error del LLM/parser",
                "concepts_hit": hits,
                "concepts_missed": [c for c in (expected_concepts or []) if c not in hits],
            },
            "passed": score >= 75
        }


def heuristic_score(question: str, answer: str, expected_concepts: List[str]) -> float:
    text = (answer or "").strip().lower()
    if len(text) < 8:
        return 5.0

    words = re.findall(r"[a-zA-Z0-9+#.]{3,}", text)
    if len(words) < 4:
        return 25.0

    score = 35.0
    if len(words) >= 12:
        score += 15
    if len(words) >= 28:
        score += 10

    evidence_terms = [
        "java", "spring", "backend", "frontend", "react", "next", "astro", "docker", "aws",
        "api", "base", "datos", "deploy", "despliegue", "test", "pruebas", "scrum",
        "equipo", "liderazgo", "rendimiento", "seguridad", "concurrencia", "crm",
        "mercado", "yape", "banca", "seguros", "proyecto"
    ]
    hits = sum(1 for term in evidence_terms if term in text)
    score += min(hits * 4, 24)

    concept_hits = matched_concepts(text, expected_concepts)
    if expected_concepts:
        score += min(len(concept_hits) * 8, 24)

    question_text = (question or "").lower()
    behavioral_terms = ("equipo", "presion", "motiv", "feedback", "atras", "estres")
    if any(term in question_text for term in behavioral_terms) and len(words) >= 12:
        score += 8

    return round(max(0, min(score, 88)), 2)


def matched_concepts(answer: str, expected_concepts: List[str]) -> List[str]:
    text = (answer or "").lower()
    matches = []
    for concept in expected_concepts or []:
        normalized = str(concept).lower().strip()
        if normalized and normalized in text:
            matches.append(concept)
    return matches
