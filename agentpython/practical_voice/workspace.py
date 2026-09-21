from practical_voice.schemas import PracticalWorkspaceType


TECH_KEYWORDS = (
    "software",
    "programador",
    "developer",
    "frontend",
    "backend",
    "full stack",
    "data",
    "devops",
    "qa",
    "sistemas",
    "tecnologia",
    "technology",
)

LEGAL_KEYWORDS = ("legal", "abogado", "derecho", "compliance", "contrato")
ACCOUNTING_KEYWORDS = ("contabilidad", "contador", "finanzas", "tributario", "auditoria")


def infer_workspace_type(career: str, job_title: str) -> PracticalWorkspaceType:
    text = f"{career} {job_title}".lower()
    if any(word in text for word in TECH_KEYWORDS):
        return PracticalWorkspaceType.CODING
    if any(word in text for word in LEGAL_KEYWORDS):
        return PracticalWorkspaceType.DOCUMENT_REVIEW
    if any(word in text for word in ACCOUNTING_KEYWORDS):
        return PracticalWorkspaceType.CASE_STUDY
    return PracticalWorkspaceType.SIMULATION


def build_workspace_challenge(
    workspace_type: PracticalWorkspaceType,
    career: str,
    job_title: str,
) -> dict:
    if workspace_type == PracticalWorkspaceType.CODING:
        return {
            "title": "Implementacion practica guiada",
            "language": "typescript",
            "prompt": (
                "Construye una funcion `rankCandidates` que reciba candidatos con puntajes "
                "de screening, teoria y tecnica, descarte perfiles con fraude y retorne el "
                "ranking final ordenado por score ponderado."
            ),
            "starter_code": (
                "type Candidate = {\n"
                "  id: string;\n"
                "  screening: number;\n"
                "  theory: number;\n"
                "  technical: number;\n"
                "  fraudFlags: number;\n"
                "};\n\n"
                "export function rankCandidates(candidates: Candidate[]) {\n"
                "  // Escribe tu solucion aqui\n"
                "}\n"
            ),
            "expected_output": [
                "Filtrar candidatos con fraude alto",
                "Calcular score ponderado",
                "Ordenar de mayor a menor",
                "Explicar decisiones mientras codifica",
            ],
        }

    if workspace_type == PracticalWorkspaceType.DOCUMENT_REVIEW:
        return {
            "title": "Revision practica de documento",
            "prompt": (
                "Analiza una clausula contractual con riesgos de confidencialidad, penalidad "
                "y plazo. Identifica riesgos, preguntas de aclaracion y una recomendacion."
            ),
            "document": (
                "El proveedor tendra acceso irrestricto a informacion interna. La penalidad "
                "por incumplimiento sera definida posteriormente por la empresa contratante."
            ),
        }

    if workspace_type == PracticalWorkspaceType.CASE_STUDY:
        return {
            "title": "Caso practico financiero",
            "prompt": (
                "Evalua un cierre mensual con diferencias entre ventas, IGV y conciliacion "
                "bancaria. Explica hallazgos y acciones correctivas."
            ),
            "document": "Ventas declaradas: S/ 120,000. Depositos: S/ 98,000. IGV registrado: S/ 15,500.",
        }

    return {
        "title": f"Simulacion practica para {job_title}",
        "prompt": (
            "Resuelve el caso de trabajo en voz alta. El agente te hara preguntas, pedira "
            "justificaciones y evaluara tu criterio profesional."
        ),
        "document": f"Area: {career}. Puesto: {job_title}.",
    }
