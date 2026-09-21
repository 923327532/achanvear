from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
from enum import Enum

class CandidateSummary(BaseModel):
    candidate_id: str
    name: str
    screening_score: float
    theory_score: float
    technical_score: float
    final_score: float
    profile_used: str  # "Carlos Mendoza"
    s3_video: str
    violations: int

class ReportRequest(BaseModel):
    job_title: str
    candidates: List[CandidateSummary]
    company_name: str

class ExecutiveSummary(BaseModel):
    top_recommended: CandidateSummary
    quality_group: str  # "excelente", "buena", "media"
    common_strengths: List[str]
    common_weaknesses: List[str]
    patterns_detected: str
    next_steps: List[str]

class FinalReport(BaseModel):
    job_title: str
    generated_at: datetime
    candidates: List[CandidateSummary]
    executive_summary: ExecutiveSummary
    pdf_url: str  # Generado después
