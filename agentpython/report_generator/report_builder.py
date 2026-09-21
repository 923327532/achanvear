import json
from datetime import datetime
from langchain_core.prompts import ChatPromptTemplate
from shared.llm_client.llm_client import llm
from report_generator.schemas import ReportRequest, ExecutiveSummary, CandidateSummary
from typing import List

REPORT_PROMPT = """
Eres gerente RRHH senior Achanvear. Genera REPORTE EJECUTIVO espanol para {company_name}:

PUESTO: {job_title}
CANDIDATOS ({total}): {candidates_summary}

TAREAS:
1. TOP 1 recomendado + POR QUE (score + fortalezas unicas)
2. Calidad grupo: "excelente/buena/media/pobre"
3. Patrones comunes fortalezas/debilidades
4. Skills compartidos entre top 3
5. Areas debiles recurrentes
6. Proximos pasos accionables

Estilo: Directo, ejecutivo, lenguaje natural Peru. Max 400 palabras.

Importante: Responde UNICAMENTE con el objeto JSON:
{{
  "quality_group": "...",
  "common_strengths": ["...", "..."],
  "common_weaknesses": ["...", "..."],
  "patterns_detected": "...",
  "next_steps": ["...", "..."]
}}
"""


async def build_executive_report(request: ReportRequest) -> ExecutiveSummary:
    total = len(request.candidates)

    candidates_sorted = sorted(request.candidates, key=lambda x: x.final_score, reverse=True)
    top_1 = candidates_sorted[0]

    candidates_summary = "\n".join([
        f"- {c.name}: {c.final_score:.1f} (Teoria: {c.theory_score}, Tech: {c.technical_score})"
        for c in request.candidates
    ])

    try:
        chain = ChatPromptTemplate.from_template(REPORT_PROMPT) | llm

        # ✅ ASYNC: usamos ainvoke en lugar de invoke
        response = await chain.ainvoke({
            "company_name": request.company_name,
            "job_title": request.job_title,
            "total": total,
            "candidates_summary": candidates_summary
        })

        clean_json = response.content.replace("```json", "").replace("```", "").strip()
        ai_data = json.loads(clean_json)

        return ExecutiveSummary(
            top_recommended=top_1,
            quality_group=ai_data.get("quality_group", "buena"),
            common_strengths=ai_data.get("common_strengths", []),
            common_weaknesses=ai_data.get("common_weaknesses", []),
            patterns_detected=ai_data.get("patterns_detected", ""),
            next_steps=ai_data.get("next_steps", [])
        )

    except Exception as e:
        print(f"ADVERTENCIA: Usando logica de respaldo (Error: {e})")

        return ExecutiveSummary(
            top_recommended=top_1,
            quality_group="excelente" if top_1.final_score > 85 else "buena",
            common_strengths=["Dominio tecnico solido"],
            common_weaknesses=["Analisis IA temporalmente no disponible"],
            patterns_detected=f"{top_1.name} lidera claramente el grupo.",
            next_steps=["Contactar #1 en 24h", "Revisar videos S3"]
        )
