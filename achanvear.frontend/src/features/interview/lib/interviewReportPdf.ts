import { createApaReportWriter } from "./apaReportWriter";
import { text, list, score } from "./reportValues";
import type { InterviewReportResponse } from "../types/interview.types";

export interface ReportDocument {
  candidateName: string;
  jobTitle?: string;
  reports: InterviewReportResponse[];
}

/** Vector PDF: selectable text, explicit missing values, APA 7 page and figure conventions. */
export async function createInterviewReportPdf(input: ReportDocument) {
  if(!input.reports.length) throw new Error("Todavía no hay entrevistas finalizadas para descargar.");
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "letter" });
  const { paragraph, heading, bullets, chart, newPage, startCover, finishCover, finish } = createApaReportWriter(pdf);

  startCover();
  paragraph("Informe de evaluación de entrevistas", true);
  paragraph(input.candidateName, true);
  paragraph(input.jobTitle || text(input.reports[0]?.assessment?.job_title) || "Proceso de selección laboral");
  paragraph("Achanvear · Evaluación asistida por inteligencia artificial");
  paragraph(`Fecha de emisión: ${new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}`);
  paragraph("Documento confidencial para la empresa responsable del proceso.");
  paragraph("Estructura de presentación basada en APA 7: márgenes de 2,54 cm, cuerpo Times de 12 puntos, interlineado doble, páginas numeradas y figuras identificadas.", false, 10);
  finishCover();
  heading("Resumen de resultados");
  paragraph("Este documento presenta por separado la entrevista teórica y la práctica. Los puntajes proceden de las evaluaciones guardadas; las conclusiones de IA deben contrastarse con la evidencia y revisarse por una persona antes de decidir la contratación.");
  const label = (report: InterviewReportResponse) => report.interviewType === "THEORY" ? "Teórica" : "Práctica";
  chart("Puntajes de las entrevistas finalizadas", input.reports.map(r => ({ label: label(r), value: score(r.finalScore) })));
  paragraph("No se calcula un ranking ni un promedio combinado: comparar candidatos o ponderar etapas requiere una política de selección explícita.");

  for(const report of input.reports) {
    newPage();
    const a = report.assessment || {};
    heading(`Entrevista ${label(report).toLowerCase()}`);
    paragraph(`Identificador: ${report.interviewId}`, false, 10);
    paragraph(`Estado: ${report.status === "COMPLETED" ? "Finalizada" : report.status}. Puntaje: ${score(report.finalScore) === null ? "No registrado" : `${report.finalScore}/100`}. Resultado: ${report.passed === true ? "Alcanza el umbral de 75" : report.passed === false ? "No alcanza el umbral de 75" : "No determinado"}.`);
    paragraph(`Entrevistador: ${report.interviewerProfile?.name || "No registrado"}.`);
    heading("Método y alcance");
    paragraph(text(a.methodology) || (report.interviewType === "THEORY" ? "Evaluación de las respuestas registradas, escala 0–100. Umbral de aprobación de la etapa: 75." : "Evaluación del caso y del trabajo entregado, escala 0–100. Umbral de aprobación de la etapa: 75."));
    heading("Síntesis de la evaluación");
    paragraph(text(a.summary) || "La síntesis narrativa no está registrada para esta entrevista. Se presentan los puntajes y las evidencias disponibles, sin reconstruir conclusiones de IA.");
    if(a.generation_status === "manual_review") paragraph("La generación narrativa requiere revisión manual; los resultados numéricos y las evidencias se conservan.");
    heading("Fortalezas observadas"); bullets(list(a.strengths));
    heading("Brechas y aspectos por revisar"); bullets(list(a.risks));
    heading("Recomendación"); paragraph(text(a.recommendation) || "Revisar las evidencias antes de tomar una decisión.");
    if(report.interviewType !== "THEORY") {
      chart("Desempeño práctico y comunicación observada", [
        { label: "Práctica", value: score(report.finalScore) },
        { label: "Comunicación", value: score(a.communication_score) },
      ]);
      paragraph(text(a.communication_summary) || "No hay una valoración narrativa de comunicación registrada.");
      paragraph("La comunicación observada no constituye una evaluación psicológica ni un diagnóstico.", false, 10);
    }
    const evidence = Array.isArray(a.evidence) ? a.evidence as Array<Record<string, unknown>> : [];
    if(evidence.length) {
      chart("Desempeño por respuesta teórica", evidence.map((e, i) => ({ label: `Respuesta ${i + 1}`, value: score(e.score) })));
      heading("Evidencias de preguntas y respuestas");
      evidence.forEach((e, i) => { paragraph(`Pregunta ${i + 1}. ${text(e.question)}`, true); paragraph(text(e.answer)); paragraph(`Puntaje: ${score(e.score) ?? "No registrado"}/100`, false, 10); });
    } else if(report.questions.length) {
      heading("Preguntas y respuestas guardadas");
      report.questions.forEach((q, i) => { paragraph(`Pregunta ${i + 1}. ${q.content}`, true); const answer = report.answers.find(v => v.questionId === q.id); paragraph(answer?.content || "Sin respuesta registrada."); });
    }
    if(a.challenge && typeof a.challenge === "object") {
      const c = a.challenge as Record<string, unknown>;
      heading("Caso práctico asignado"); paragraph(text(c.title) || text(c.description) || "Caso registrado en el expediente.");
      if(text(c.title) && text(c.description)) paragraph(text(c.description));
    }
    if(a.workspace_state && typeof a.workspace_state === "object") {
      const w = a.workspace_state as Record<string, unknown>;
      heading("Anexo: trabajo entregado");
      for(const key of ["code", "notes", "codeOutput"]) if(text(w[key])) { paragraph(key === "code" ? "Código" : key === "notes" ? "Notas" : "Salida de ejecución", true); paragraph(text(w[key]), false, 10); }
      if(Array.isArray(w.files)) for(const f of w.files as Array<Record<string, unknown>>) { paragraph(text(f.path) || "Archivo", true); paragraph(text(f.content), false, 10); }
    }
    if(Array.isArray(a.transcript) && a.transcript.length) {
      heading("Anexo: conversación registrada");
      for(const turn of a.transcript as Array<Record<string, unknown>>) paragraph(`${turn.role === "agent" ? "IA" : "Candidato"}: ${text(turn.content)}`, false, 10);
    }
    heading("Integridad y limitaciones");
    paragraph(`Incidencias registradas: ${report.totals?.totalViolations ?? "Sin dato"}. Una incidencia requiere revisión y no prueba por sí sola una conducta indebida.`);
    for(const v of report.violations) paragraph(`${v.type}: ${v.count}. Fecha: ${v.occurredAt}`, false, 10);
    paragraph("La IA puede cometer errores. Este informe describe el desempeño observado en esta sesión; no garantiza el desempeño laboral futuro. No se han incorporado referencias bibliográficas ni antecedentes que no formen parte de la evidencia.");
  }
  finish();
  return pdf;
}

export async function downloadInterviewReportPdf(input: ReportDocument) {
  const pdf = await createInterviewReportPdf(input);
  const name = input.candidateName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").slice(0, 65);
  pdf.save(`informe-entrevistas-${name || "candidato"}.pdf`);
}
