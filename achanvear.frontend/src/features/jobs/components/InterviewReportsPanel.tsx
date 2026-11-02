"use client";
import {
  useCandidateInterviewReports,
  type CandidateReportContext,
} from "../hooks/useCandidateInterviewReports";

export function InterviewReportsPanel(context: CandidateReportContext) {
  const { query, download, downloading, downloadError } = useCandidateInterviewReports(context);
  const reports = query.data ?? [];

  return <section className="rounded-2xl border border-teal-200 bg-white p-5 space-y-4">
    <div><h3 className="font-bold text-slate-900">Informes de entrevistas</h3>
      <p className="mt-1 text-xs text-slate-500">Evaluaciones guardadas, evidencia y gráficos. PDF con presentación APA 7.</p></div>
    {query.isPending ? <p className="text-sm">Consultando informes…</p> : query.isError ?
      <p role="alert" className="text-sm text-red-700">No se pudieron consultar los informes. <button onClick={() => query.refetch()} className="underline">Reintentar</button></p> :
      !reports.length ? <p className="text-sm text-slate-500">Los informes aparecerán cuando finalicen las entrevistas.</p> : <>
        {reports.map(report => <div key={report.interviewId} className="rounded-xl border border-slate-200 p-3 space-y-2">
          <div className="flex justify-between gap-3"><h4 className="font-semibold text-sm">Entrevista {report.interviewType === "THEORY" ? "teórica" : "práctica"}</h4><span className="text-sm font-semibold text-teal-800">{report.finalScore ?? "Sin dato"}/100</span></div>
          <p className="text-sm text-slate-600">{typeof report.assessment?.summary === "string" ? report.assessment.summary : "Consulta la evidencia guardada en el informe."}</p>
          <button disabled={downloading} onClick={() => download([report])} className="text-sm font-semibold text-teal-800 underline disabled:opacity-50">Descargar PDF {report.interviewType === "THEORY" ? "teórico" : "práctico"}</button>
        </div>)}
        <button disabled={downloading} onClick={() => download(reports)} className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{downloading ? "Preparando PDF…" : "Descargar informe completo PDF"}</button>
      </>}
    {downloadError && <p role="alert" className="text-sm text-red-700">{downloadError}</p>}
  </section>;
}
