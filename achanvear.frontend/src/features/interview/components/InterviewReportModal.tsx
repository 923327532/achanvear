// features/interview/components/InterviewReportModal.tsx
"use client";

import { useInterviewReport } from "../hooks/useFreelancerInterviews";

interface Props {
  interviewId: string;
  onClose: () => void;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InterviewReportModal({ interviewId, onClose }: Props) {
  const { data: report, isLoading, isError } = useInterviewReport(interviewId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Reporte de Entrevista</h2>
              <p className="text-xs text-slate-500">ID: {interviewId.slice(0, 8)}...</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#1B3A6B] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="w-12 h-12 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm font-semibold text-slate-700 mb-1">Error al cargar reporte</p>
              <p className="text-xs text-slate-500">No se pudo obtener el reporte de la entrevista</p>
            </div>
          ) : !report ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-slate-500">No hay reporte disponible</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score */}
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Resultado</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    report.passed
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {report.passed ? "Aprobado" : "No aprobado"}
                  </span>
                </div>
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-[#1B3A6B]">{report.finalScore ?? "—"}/100</p>
                  <p className="text-xs text-slate-500 mt-1">Puntaje final</p>
                </div>
              </div>

              {/* Perfil del entrevistador */}
              {report.interviewerProfile && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Entrevistador</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-sm font-bold">
                      {report.interviewerProfile.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{report.interviewerProfile.name}</p>
                      <p className="text-xs text-slate-500">Voz: {report.interviewerProfile.voice}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Slot asignado */}
              {report.assignedSlot && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Sesion</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Slot</p>
                      <p className="font-semibold text-slate-800">#{report.assignedSlot.slotNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Inicio</p>
                      <p className="font-semibold text-slate-800">{formatDate(report.assignedSlot.startTime)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Fin</p>
                      <p className="font-semibold text-slate-800">{formatDate(report.assignedSlot.endTime)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Totales */}
              {report.totals && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Estadisticas</h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-lg font-bold text-slate-800">{report.totals.totalQuestions}</p>
                      <p className="text-xs text-slate-500">Preguntas</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-lg font-bold text-slate-800">{report.totals.totalAnswers}</p>
                      <p className="text-xs text-slate-500">Respuestas</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-lg font-bold text-slate-800">{report.totals.totalViolations}</p>
                      <p className="text-xs text-slate-500">Alertas</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Preguntas y respuestas */}
              {report.questions.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Preguntas y Respuestas</h3>
                  <div className="space-y-4">
                    {report.questions.map((q: { id: string; content: string; audioUrl: string | null }, idx: number) => {
                      const answer = report.answers.find((a: { id: string; questionId: string; content: string; score: number | null }) => a.questionId === q.id);
                      return (
                        <div key={q.id} className="border border-slate-100 rounded-xl p-4">
                          <div className="flex items-start gap-2 mb-2">
                            <span className="w-5 h-5 rounded-full bg-[#1B3A6B] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-sm text-slate-800">{q.content}</p>
                          </div>
                          {answer && (
                            <div className="ml-7 mt-2 p-3 bg-slate-50 rounded-lg">
                              <p className="text-xs text-slate-600 mb-1">Tu respuesta:</p>
                              <p className="text-sm text-slate-700">{answer.content}</p>
                              {answer.score !== null && (
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs font-semibold text-slate-500">Puntaje:</span>
                                  <span className={`text-xs font-bold ${
                                    answer.score >= 75 ? "text-emerald-600" : answer.score >= 50 ? "text-amber-600" : "text-red-600"
                                  }`}>
                                    {answer.score}/100
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Violaciones */}
              {report.violations.length > 0 && (
                <div className="bg-white rounded-2xl border border-red-200 p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Alertas de Seguridad</h3>
                  <div className="space-y-2">
                    {report.violations.map((v: { type: string; count: number; occurredAt: string }, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                          </svg>
                          <span className="text-xs font-medium text-red-700">
                            Cambio de pestana #{v.count}
                          </span>
                        </div>
                        <span className="text-[10px] text-red-500">{formatDate(v.occurredAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Motivo de aborto */}
              {report.abortReason && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-red-800 mb-1">Entrevista Abortada</h3>
                  <p className="text-xs text-red-600">Motivo: {report.abortReason.reason}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1B3A6B] text-white text-sm font-bold hover:bg-[#162f58] transition"
          >
            Cerrar Reporte
          </button>
        </div>
      </div>
    </div>
  );
}
