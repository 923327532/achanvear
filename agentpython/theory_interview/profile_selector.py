from interviewer_profiles.profiles import InterviewerProfile, get_profile
from typing import Optional

def select_profile(previous_score: Optional[float] = None, response_style: str = "average") -> InterviewerProfile:
    """
    Etapa 3: Selecciona perfil según desempeño previo
    """
    if previous_score and previous_score > 85:
        return InterviewerProfile.SOFIA_VARGAS  # Senior → estratégica
    elif previous_score and previous_score > 75:
        if response_style == "concise":
            return InterviewerProfile.CARLOS_MENDOZA
        elif response_style == "narrative":
            return InterviewerProfile.ANA_QUISPE
        else:
            return InterviewerProfile.DIEGO_TORRES
    else:
        return InterviewerProfile.CARLOS_MENDOZA  # Default formal
