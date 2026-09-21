from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from shared.llm_client import llm  # Tu llm
from pydantic import BaseModel

def structured_chain(output_model, prompt_template: str):
    parser = PydanticOutputParser(pydantic_object=output_model)
    prompt = ChatPromptTemplate.from_template(
        prompt_template + "\n\n{format_instructions}"
    )
    return prompt | llm | parser