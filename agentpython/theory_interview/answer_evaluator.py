from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from shared.llm_client.llm_client import llm
from typing import List

from shared.schemas import AnswerEval


async def evaluate_answer(
    question: str,
    answer: str,
    expected_concepts: List[str]
):
    """
    Evalúa una respuesta técnica basada en conceptos esperados
    """

    parser = PydanticOutputParser(pydantic_object=AnswerEval)

    prompt = ChatPromptTemplate.from_template("""
    Eres un evaluador técnico senior.

    Evalúa la siguiente respuesta:

    PREGUNTA:
    {question}

    RESPUESTA:
    {answer}

    CONCEPTOS ESPERADOS:
    {concepts}

    Instrucciones:
    - Evalúa del 0 al 100
    - Considera precisión técnica, claridad y cobertura de conceptos
    - Devuelve JSON válido

    {format_instructions}
    """)

    chain = prompt | llm | parser

    try:
        # ✅ ASYNC: usamos ainvoke en lugar de invoke
        evaluation = await chain.ainvoke({
            "question": question,
            "answer": answer,
            "concepts": ", ".join(expected_concepts),
            "format_instructions": parser.get_format_instructions()
        })

        # Validación Pydantic
        validated_eval = AnswerEval(**evaluation)

        return {
            "score": validated_eval.score,
            "details": validated_eval.model_dump(),
            "passed": validated_eval.score >= 75
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            "score": 0.0,
            "details": {"error": str(e)},
            "passed": False
        }
