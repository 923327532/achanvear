from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class ChallengeType(str, Enum): # Añadimos 'str' para mejor compatibilidad
    CODING = "coding"
    LEGAL_CASE = "legal_case"
    DESIGN_BRIEF = "design_brief"
    DATA_ANALYSIS = "data_analysis"
    ANALYTICAL_CASE = "ANALYTICAL_CASE" # El que causó el error 500
    ARCHITECTURE_DESIGN = "architecture_design" # Por si pide diseño de sistemas

class TechnicalRequest(BaseModel):
    candidate_id: str
    career: str
    job_title: Optional[str] = "Senior" # Añadimos esto para que no falte
    country: Optional[str] = "Peru"
    theory_score: float
    session_id: str

class Challenge(BaseModel):
    id: str
    type: ChallengeType
    title: str
    description: str
    instructions: str
    time_limit: int
    expected_output: List[str]

# Cambiamos CodeSolution por algo más genérico: TechnicalSolution
class TechnicalSolution(BaseModel):
    text_content: str # Aquí entra el código, el análisis legal o el texto del chef
    language: Optional[str] = "text"
    files_urls: Optional[List[str]] = []

class TechnicalResponse(BaseModel):
    challenge: Challenge
    solution: Optional[TechnicalSolution] = None
    evaluation: Optional[dict] = None
    screen_recording_s3: Optional[str] = None
    violations: int = 0
    final_score: float = 0.0
    passed: bool = False