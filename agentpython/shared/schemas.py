from pydantic import BaseModel, Field
from typing import List

class Question(BaseModel):
    id: str
    text: str
    expected_concepts: List[str] = Field(max_length=5)

class AnswerEval(BaseModel):
    score: float = Field(ge=0, le=100)
    passed: bool
    concepts_hit: List[str]
    concepts_missed: List[str]

class Challenge(BaseModel):
    id: str
    type: str  # "coding", "legal", "design"
    description: str
    starter_code: str = ""

class ScreeningResult(BaseModel):
    top: List[str] = Field(max_items=16)
    rejected: List[str]
    scores: dict