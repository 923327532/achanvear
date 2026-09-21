"""
Achanvear AI Agent Service v1.0 - LLM dinamico desde .env
"""
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
from shared.llm_client.llm_client import llm, settings
from screening.router import router as screening_router
from theory_interview.router import router as theory_router
from technical_interview.router import router as technical_router
from practical_voice.router import router as practical_voice_router
from report_generator.router import router as report_router
from shared.n8n_client import notify_whatsapp
from shared.session_orchestrator import get_session, list_sessions, create_session
import uvicorn


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n" + "=" * 40)
    print("ACHANVEAR AI AGENT INICIADO")
    print(f"   PROVEEDOR LLM: {settings.llm_provider}")
    print(f"   ENTORNO: {settings.env}")
    print(f"   PUERTO: 8001")
    print("=" * 40 + "\n")
    yield
    print("Agente detenido")


app = FastAPI(
    title="Achanvear AI Agent v1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TestRequest(BaseModel):
    prompt: str = "Explica aggregate root DDD en 50 palabras"


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "llm_provider": settings.llm_provider,
        "env": settings.env,
    }


@app.post("/test-llm")
async def test_llm(request: TestRequest):
    try:
        response = llm.invoke(request.prompt)
        return {
            "success": True,
            "provider": settings.llm_provider,
            "output": response.content,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {"message": "Achanvear AI Agent Online", "docs": "/docs"}


@app.post("/notify/whatsapp/{session_id}")
async def notify_whatsapp_endpoint(session_id: str, phone: str, stage: str):
    await notify_whatsapp(phone, f"Aprobaste {stage}. Proxima llamada.")
    return {"sent": True}


# ─── Endpoints de Sesión para Java ─────────────────────────────────


class CreateSessionRequest(BaseModel):
    candidate_id: str
    job_id: str
    career: str = ""
    job_title: str = "Senior"
    phone: str | None = None
    email: str | None = None


@app.post("/session/create")
async def create_session_endpoint(req: CreateSessionRequest):
    """Java crea una sesion en el orquestador Python antes de iniciar una entrevista."""
    session = await create_session(
        candidate_id=req.candidate_id,
        job_id=req.job_id,
        career=req.career,
        job_title=req.job_title,
        phone=req.phone,
        email=req.email,
    )
    return {
        "session_id": session.session_id,
        "candidate_id": session.candidate_id,
        "job_id": session.job_id,
        "career": session.career,
        "stage": session.stage.value,
        "status": "created",
    }


@app.get("/session/{session_id}")
async def get_session_endpoint(session_id: str):
    """Java consulta el estado de una sesión de entrevista."""
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return session.to_dict()


@app.get("/sessions")
async def list_all_sessions():
    """Java lista todas las sesiones activas."""
    sessions = await list_sessions()
    return {
        "total": len(sessions),
        "sessions": [s.to_dict() for s in sessions],
    }


# ─── Routers ───────────────────────────────────────────────────────

app.include_router(screening_router)
app.include_router(theory_router)
app.include_router(technical_router)
app.include_router(practical_voice_router)
app.include_router(report_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
