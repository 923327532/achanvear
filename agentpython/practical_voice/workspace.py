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
    "technical",
    "tecnico",
    "java",
    ".net",
    "crm",
    "ingeniero",
    "engineer",
    "desarrollador",
    "desarrollo",
)

LEGAL_KEYWORDS = ("legal", "abogado", "derecho", "compliance", "contrato")
ACCOUNTING_KEYWORDS = ("contabilidad", "contador", "finanzas", "tributario", "auditoria")
HEALTH_KEYWORDS = ("salud", "medicina", "medico", "doctor", "odontologia", "odontologo", "dental", "dentista")
MARKETING_KEYWORDS = ("marketing", "seo", "sem", "contenido", "redes", "social", "comunicacion", "marca", "growth", "digital")
SALES_KEYWORDS = ("ventas", "comercial", "business", "negocio", "account", "cliente", "crm")


def interviewer_profile(workspace_type: PracticalWorkspaceType, career: str, job_title: str) -> dict:
    text = f"{career} {job_title}".lower()
    if workspace_type == PracticalWorkspaceType.CODING:
        return {
            "id": "sofia_tech",
            "name": "Sofia",
            "role": "arquitecta de software",
            "voice": "es-PE-CamilaNeural",
            "gender": "female",
            "style": "tecnica, directa y colaborativa",
        }
    if any(word in text for word in LEGAL_KEYWORDS):
        return {
            "id": "valeria_legal",
            "name": "Valeria",
            "role": "especialista legal y compliance",
            "voice": "es-ES-ElviraNeural",
            "gender": "female",
            "style": "precisa, rigurosa y orientada a riesgos",
        }
    if any(word in text for word in ACCOUNTING_KEYWORDS):
        return {
            "id": "carlos_finanzas",
            "name": "Carlos",
            "role": "auditor financiero",
            "voice": "es-PE-AlexNeural",
            "gender": "male",
            "style": "ordenado, numerico y exigente con evidencias",
        }
    if any(word in text for word in HEALTH_KEYWORDS):
        return {
            "id": "martin_salud",
            "name": "Martin",
            "role": "evaluador clinico",
            "voice": "es-MX-JorgeNeural",
            "gender": "male",
            "style": "calmo, humano y cuidadoso con protocolos",
        }
    if any(word in text for word in MARKETING_KEYWORDS):
        return {
            "id": "lucia_marketing",
            "name": "Lucia",
            "role": "estratega de marketing digital",
            "voice": "es-CO-SalomeNeural",
            "gender": "female",
            "style": "dinamica, orientada a resultados y criterio de marca",
        }
    if any(word in text for word in SALES_KEYWORDS):
        return {
            "id": "diego_comercial",
            "name": "Diego",
            "role": "director comercial",
            "voice": "es-PE-AlexNeural",
            "gender": "male",
            "style": "practico, consultivo y orientado a conversion",
        }
    return {
        "id": "ana_general",
        "name": "Ana",
        "role": "entrevistadora senior",
        "voice": "es-CO-SalomeNeural",
        "gender": "female",
        "style": "conversacional, practica y orientada a criterio",
    }


def _tech_profile(career: str, job_title: str) -> str:
    text = f"{career} {job_title}".lower()
    if any(word in text for word in ("frontend", "front-end", "react", "next", "vue", "angular", "ui")):
        return "frontend"
    if any(word in text for word in ("backend", "back-end", "java", ".net", "spring", "api", "microservicio")):
        return "backend"
    if any(word in text for word in ("full stack", "fullstack", "crm")):
        return "fullstack"
    if any(word in text for word in ("data", "datos", "analytics", "analista", "bi")):
        return "data"
    if any(word in text for word in ("qa", "quality", "testing", "tester")):
        return "qa"
    if any(word in text for word in ("devops", "cloud", "aws", "azure", "kubernetes", "docker")):
        return "devops"
    return "backend"


def infer_workspace_type(career: str, job_title: str) -> PracticalWorkspaceType:
    text = f"{career} {job_title}".lower()
    if any(word in text for word in TECH_KEYWORDS):
        return PracticalWorkspaceType.CODING
    if any(word in text for word in LEGAL_KEYWORDS):
        return PracticalWorkspaceType.DOCUMENT_REVIEW
    if any(word in text for word in ACCOUNTING_KEYWORDS):
        return PracticalWorkspaceType.CASE_STUDY
    if any(word in text for word in HEALTH_KEYWORDS):
        return PracticalWorkspaceType.CASE_STUDY
    if any(word in text for word in MARKETING_KEYWORDS):
        return PracticalWorkspaceType.SIMULATION
    if any(word in text for word in SALES_KEYWORDS):
        return PracticalWorkspaceType.SIMULATION
    return PracticalWorkspaceType.SIMULATION


def build_workspace_challenge(
    workspace_type: PracticalWorkspaceType,
    career: str,
    job_title: str,
) -> dict:
    if workspace_type == PracticalWorkspaceType.CODING:
        profile = _tech_profile(career, job_title)
        challenges = {
            "frontend": {
                "title": "Frontend: componente evaluable",
                "workspace_tool": "code_project",
                "interviewer_profile": interviewer_profile(workspace_type, career, job_title),
                "function_name": "renderCandidateCard",
                "language": "typescript",
                "prompt": (
                    "Construye `renderCandidateCard(candidate)` para devolver HTML accesible de una tarjeta "
                    "de candidato. Debe mostrar nombre, rol, score, estado y resaltar perfiles aprobados."
                ),
                "starter_code": (
                    "type Candidate = { name: string; role: string; score: number; passed: boolean };\n\n"
                    "export function renderCandidateCard(candidate: Candidate) {\n"
                    "  // Devuelve un string HTML listo para previsualizar\n"
                    "}\n"
                ),
                "test_cases": [
                    {"input": {"name": "Ana Torres", "role": "Frontend React", "score": 86, "passed": True}},
                    {"input": {"name": "Luis Ramos", "role": "Frontend Vue", "score": 62, "passed": False}},
                ],
                "preview": "html",
                "expected_output": ["HTML valido", "Estado visible", "Score visible", "Criterio accesible"],
            },
            "backend": {
                "title": "Backend senior: servicio de seleccion",
                "workspace_tool": "code_project",
                "interviewer_profile": interviewer_profile(workspace_type, career, job_title),
                "language": "typescript",
                "entry_file": "main.js",
                "prompt": (
                    "Disena un pequeno servicio backend para seleccionar candidatos. Separa responsabilidades "
                    "entre entrada, servicio y reglas de dominio. Debe filtrar fraude alto, calcular score "
                    "ponderado y ordenar candidatos de mayor a menor."
                ),
                "starter_code": "",
                "files": [
                    {
                        "path": "main.js",
                        "language": "javascript",
                        "content": (
                            "const { CandidateSelectionService } = require('./selectionService');\n\n"
                            "const candidates = [\n"
                            "  { id: 'ana', screening: 90, theory: 82, technical: 88, fraudFlags: 0 },\n"
                            "  { id: 'luis', screening: 95, theory: 70, technical: 92, fraudFlags: 3 },\n"
                            "  { id: 'maria', screening: 78, theory: 86, technical: 80, fraudFlags: 0 },\n"
                            "];\n\n"
                            "const service = new CandidateSelectionService();\n"
                            "console.log(JSON.stringify(service.rank(candidates), null, 2));\n"
                        ),
                    },
                    {
                        "path": "selectionService.js",
                        "language": "javascript",
                        "content": (
                            "class CandidateSelectionService {\n"
                            "  rank(candidates) {\n"
                            "    // TODO: filtra fraude >= 3, calcula score ponderado y ordena desc.\n"
                            "    return candidates;\n"
                            "  }\n"
                            "}\n\n"
                            "module.exports = { CandidateSelectionService };\n"
                        ),
                    },
                    {
                        "path": "README.md",
                        "language": "markdown",
                        "content": (
                            "Explica aqui tus decisiones de arquitectura, supuestos, manejo de errores "
                            "y como lo extenderias a una API real.\n"
                        ),
                    },
                    {
                        "path": "schema.sql",
                        "language": "sql",
                        "content": (
                            "CREATE TABLE candidates (\n"
                            "  id text PRIMARY KEY,\n"
                            "  screening int NOT NULL,\n"
                            "  theory int NOT NULL,\n"
                            "  technical int NOT NULL,\n"
                            "  fraud_flags int NOT NULL DEFAULT 0,\n"
                            "  created_at timestamptz NOT NULL DEFAULT now()\n"
                            ");\n\n"
                            "INSERT INTO candidates (id, screening, theory, technical, fraud_flags) VALUES\n"
                            "  ('ana', 90, 82, 88, 0),\n"
                            "  ('luis', 95, 70, 92, 3),\n"
                            "  ('maria', 78, 86, 80, 0);\n\n"
                            "-- TODO: crea indices, vistas, funciones o consultas para ranking.\n"
                            "SELECT id,\n"
                            "       round(screening * 0.25 + theory * 0.30 + technical * 0.45, 2) AS score\n"
                            "FROM candidates\n"
                            "WHERE fraud_flags < 3\n"
                            "ORDER BY score DESC;\n"
                        ),
                    },
                    {
                        "path": "candidates.mongo",
                        "language": "javascript",
                        "content": (
                            "db.candidates.insertMany([\n"
                            "  { id: 'ana', screening: 90, theory: 82, technical: 88, fraudFlags: 0 },\n"
                            "  { id: 'luis', screening: 95, theory: 70, technical: 92, fraudFlags: 3 },\n"
                            "  { id: 'maria', screening: 78, theory: 86, technical: 80, fraudFlags: 0 }\n"
                            "]);\n\n"
                            "db.candidates.createIndex({ fraudFlags: 1, technical: -1 });\n\n"
                            "printjson(db.candidates.find({ fraudFlags: { $lt: 3 } }).sort({ technical: -1 }).toArray());\n"
                        ),
                    },
                ],
                "expected_output": ["Separacion de responsabilidades", "Reglas de dominio", "SQL o Mongo ejecutable", "Indices/triggers si aplica"],
            },
            "fullstack": {
                "title": "Full stack: datos para panel CRM",
                "workspace_tool": "code_project",
                "interviewer_profile": interviewer_profile(workspace_type, career, job_title),
                "function_name": "buildPipelineSummary",
                "language": "typescript",
                "prompt": (
                    "Implementa `buildPipelineSummary(applications)` para agrupar postulantes por estado, "
                    "calcular promedio de score y devolver la siguiente accion recomendada."
                ),
                "starter_code": (
                    "type Application = { id: string; status: string; score: number };\n\n"
                    "export function buildPipelineSummary(applications: Application[]) {\n"
                    "  // Devuelve resumen por estado y accion recomendada\n"
                    "}\n"
                ),
                "test_cases": [[
                    {"id": "a1", "status": "new", "score": 72},
                    {"id": "a2", "status": "interview", "score": 88},
                    {"id": "a3", "status": "interview", "score": 91},
                ]],
                "expected_output": ["Agrupar por estado", "Promedio", "Accion recomendada"],
            },
            "data": {
                "title": "Datos: limpieza y ranking",
                "workspace_tool": "code_project",
                "interviewer_profile": interviewer_profile(workspace_type, career, job_title),
                "function_name": "cleanAndRank",
                "language": "typescript",
                "prompt": "Implementa `cleanAndRank(rows)` para normalizar scores faltantes, descartar outliers y ordenar resultados.",
                "starter_code": "export function cleanAndRank(rows: Array<{ id: string; score?: number | null }>) {\n  // Escribe tu solucion aqui\n}\n",
                "test_cases": [[{"id": "a", "score": 80}, {"id": "b", "score": None}, {"id": "c", "score": 140}]],
                "expected_output": ["Manejar nulos", "Descartar outliers", "Ordenar"],
            },
            "qa": {
                "title": "QA: matriz de casos",
                "workspace_tool": "test_plan",
                "interviewer_profile": interviewer_profile(workspace_type, career, job_title),
                "function_name": "createTestPlan",
                "language": "typescript",
                "prompt": "Implementa `createTestPlan(feature)` para generar casos positivos, negativos y borde de una funcionalidad.",
                "starter_code": "export function createTestPlan(feature: string) {\n  // Devuelve una lista de casos de prueba\n}\n",
                "test_cases": ["login con 2FA"],
                "expected_output": ["Caso positivo", "Caso negativo", "Caso borde", "Prioridad"],
            },
            "devops": {
                "title": "DevOps: plan de despliegue seguro",
                "workspace_tool": "runbook",
                "interviewer_profile": interviewer_profile(workspace_type, career, job_title),
                "function_name": "deploymentChecklist",
                "language": "typescript",
                "prompt": "Implementa `deploymentChecklist(service)` con pasos de build, healthcheck, rollback y monitoreo.",
                "starter_code": "export function deploymentChecklist(service: string) {\n  // Devuelve pasos ordenados para despliegue seguro\n}\n",
                "test_cases": ["api-interviews"],
                "expected_output": ["Build", "Healthcheck", "Rollback", "Monitoreo"],
            },
        }
        return challenges[profile]

    if workspace_type == PracticalWorkspaceType.DOCUMENT_REVIEW:
        return {
            "title": "Revision practica de documento",
            "workspace_tool": "document",
            "interviewer_profile": interviewer_profile(workspace_type, career, job_title),
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
        if any(word in f"{career} {job_title}".lower() for word in HEALTH_KEYWORDS):
            return {
                "title": "Caso practico de atencion clinica",
                "workspace_tool": "case_notes",
                "interviewer_profile": interviewer_profile(workspace_type, career, job_title),
                "prompt": (
                    "Evalua un caso de paciente, prioriza riesgos, explica preguntas de anamnesis, "
                    "criterios de derivacion y plan de atencion inicial dentro de tu rol profesional."
                ),
                "document": (
                    "Paciente refiere dolor persistente, antecedente de medicacion reciente y ansiedad "
                    "por el procedimiento. Debes explicar manejo seguro, consentimiento y senales de alarma."
                ),
                "expected_output": ["Anamnesis", "Riesgos", "Plan", "Derivacion si aplica"],
            }
        return {
            "title": "Caso practico financiero",
            "workspace_tool": "spreadsheet_notes",
            "interviewer_profile": interviewer_profile(workspace_type, career, job_title),
            "prompt": (
                "Evalua un cierre mensual con diferencias entre ventas, IGV y conciliacion "
                "bancaria. Explica hallazgos y acciones correctivas."
            ),
            "document": "Ventas declaradas: S/ 120,000. Depositos: S/ 98,000. IGV registrado: S/ 15,500.",
        }

    text = f"{career} {job_title}".lower()
    if any(word in text for word in MARKETING_KEYWORDS):
        return {
            "title": f"Caso practico de marketing para {job_title}",
            "workspace_tool": "campaign_brief",
            "interviewer_profile": interviewer_profile(workspace_type, career, job_title),
            "prompt": (
                "Plantea una estrategia de marketing para un negocio con presupuesto limitado. "
                "Define audiencia, canales, mensajes, KPIs, calendario de 30 dias y como optimizarias "
                "si los primeros resultados no alcanzan el objetivo."
            ),
            "document": (
                f"Puesto: {job_title}. La empresa necesita captar leads calificados en 30 dias, "
                "mejorar presencia digital y justificar cada accion con metricas."
            ),
            "expected_output": ["Audiencia", "Canales", "KPIs", "Calendario", "Optimizacion"],
        }

    if any(word in text for word in SALES_KEYWORDS):
        return {
            "title": f"Caso practico comercial para {job_title}",
            "workspace_tool": "sales_playbook",
            "interviewer_profile": interviewer_profile(workspace_type, career, job_title),
            "prompt": (
                "Disena un flujo comercial para convertir prospectos en clientes. Incluye discovery, "
                "calificacion, manejo de objeciones, seguimiento, forecast y criterios para cerrar o descartar."
            ),
            "document": (
                f"Puesto: {job_title}. Recibes 20 leads semanales con baja tasa de respuesta y necesitas "
                "priorizar oportunidades reales sin deteriorar la experiencia del cliente."
            ),
            "expected_output": ["Discovery", "Calificacion", "Objeciones", "Seguimiento", "Forecast"],
        }

    return {
        "title": f"Simulacion practica para {job_title}",
        "workspace_tool": "notes",
        "interviewer_profile": interviewer_profile(workspace_type, career, job_title),
        "prompt": (
            "Resuelve el caso de trabajo en voz alta. El agente te hara preguntas, pedira "
            "justificaciones y evaluara tu criterio profesional."
        ),
        "document": f"Area: {career}. Puesto: {job_title}.",
    }
