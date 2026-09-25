from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class CandidateProfile(BaseModel):
    user_id: str
    name: str
    skills: List[str]
    experience_years: float
    career: str  # "python", "java", "abogado", etc.
    biography: Optional[str] = ""
    cv_url: Optional[str] = ""
    cv_data: Optional[str] = ""
    cover_letter: Optional[str] = ""
    phone: Optional[str] = None
    email: Optional[str] = None


class JobRequirements(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    experience_min: float
    career: str


class CandidateResult(BaseModel):
    user_id: Optional[str] = None
    name: Optional[str] = None
    score: float = 0.0
    match_percentage: float = 0.0
    reason: str = ""
    recommended: bool = False
    phone: Optional[str] = None
    email: Optional[str] = None


class ScreeningResult(BaseModel):
    selected_candidates: List[CandidateResult] = []
    rejected_candidates: List[CandidateResult] = []
    generated_at: datetime = datetime.now()
