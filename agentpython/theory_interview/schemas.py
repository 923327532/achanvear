from pydantic import BaseModel
from typing import List, Optional
from interviewer_profiles.profiles import InterviewerProfile
from datetime import datetime

class Question(BaseModel):
    id: str
    text: str
    expected_concepts: List[str]

class Answer(BaseModel):
    question_id: str
    text: str
    audio_url: Optional[str] = None  # S3

class TheoryRequest(BaseModel):
    candidate_id: str
    career: str  # "python", "abogado", "diseño"
    job_title: str
    previous_score: Optional[float] = None  # Para seleccionar perfil

class TheoryResponse(BaseModel):
    profile: InterviewerProfile
    questions: List[Question]
    answers: List[Answer]
    scores: List[float]  # 0-100 por pregunta
    final_score: float
    passed: bool  # >=75
    session_id: str
