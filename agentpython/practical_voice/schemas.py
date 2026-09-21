from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class PracticalWorkspaceType(str, Enum):
    CODING = "coding"
    CASE_STUDY = "case_study"
    DOCUMENT_REVIEW = "document_review"
    SIMULATION = "simulation"


class PracticalSessionStartRequest(BaseModel):
    session_id: str
    career: str
    job_title: str = "Senior"
    workspace_type: PracticalWorkspaceType | None = None
    country: str = "Peru"


class PracticalSessionStartResponse(BaseModel):
    session_id: str
    workspace_type: PracticalWorkspaceType
    challenge: Dict[str, Any]
    websocket_url: str
    time_limit_minutes: int = 35


class PracticalViolationRequest(BaseModel):
    session_id: str
    type: str
    detail: str = ""
    severity: str = "medium"


class PracticalFinishRequest(BaseModel):
    session_id: str
    workspace_type: PracticalWorkspaceType
    transcript: List[Dict[str, str]] = Field(default_factory=list)
    workspace_state: Dict[str, Any] = Field(default_factory=dict)
    violations: int = 0


class PracticalFinishResponse(BaseModel):
    session_id: str
    score: int
    theory_score: float = 0.0
    final_score: float = 0.0
    communication_score: int = 0
    passed: bool
    summary: str
    communication_summary: str = ""
    strengths: List[str]
    risks: List[str]
    recommendation: str
    next_action: str
    raw_evaluation: Dict[str, Any]
