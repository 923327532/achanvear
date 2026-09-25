// features/interview/components/InterviewsPage.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, User, Play, Video, Briefcase, Loader2, Eye, ChevronRight, CheckCircle2 } from "lucide-react";
import { InterviewRoom } from "./InterviewRoom";
import { PracticalVoiceInterviewRoom } from "./PracticalVoiceInterviewRoom";
import { InterviewReportModal } from "./InterviewReportModal";
import { ChooseSlotModal } from "./ChooseSlotModal";
import { useMyInterviews } from "../hooks/useFreelancerInterviews";
import { useAuthContext } from "@/providers/AuthProvider";
import { scheduleApi, type InterviewScheduleResponse } from "../api/scheduleApi";
import { jobApi } from "@/features/jobs/api/jobApi";
import type { InterviewSummaryResponse, InterviewReportResponse } from "../types/interview.types";

function PendingScheduleCard({ schedule, onChooseSlot }: { schedule: InterviewScheduleResponse; onChooseSlot: (s: InterviewScheduleResponse) => void }) {
  const [jobTitle, setJobTitle] = useState<string>("");
  const typeLabel = schedule.interviewType === "THEORY" ? "Teorica" : "Tecnica";

  useEffect(() => {
    if (schedule.jobId) {
      jobApi.getById(schedule.jobId).then(job => {
        setJobTitle(job.title || schedule.jobId);
      }).catch(() => {
        setJobTitle(schedule.jobId);
      });
    }
  }, [schedule.jobId]);

  return (
    <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-lg text-slate-900">{jobTitle || "Cargando..."}</h3>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Pendiente
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4">Entrevista {typeLabel}</p>
      <div className="space-y-2 mb-6 flex-1">
        <div className="flex items-center gap-2.5 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>
            {schedule.proposedSlots
              .filter(s => s.status === "AVAILABLE" || s.status === "PENDING")
              .length + " horarios disponibles"}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>Elige tu horario preferido</span>
        </div>
      </div>
      <button
        onClick={() => onChooseSlot(schedule)}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors"
      >
        <Calendar className="w-4 h-4" /> Elegir Horario
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD: Horario ya elegido (confirmacion siempre visible)
// ═══════════════════════════════════════════════════════════════════════════════

function ConfirmedScheduleCard({ schedule }: { schedule: InterviewScheduleResponse }) {
  const [jobTitle, setJobTitle] = useState<string>("");
  const typeLabel = schedule.interviewType === "THEORY" ? "Teorica" : "Tecnica";

  useEffect(() => {
    if (schedule.jobId) {
      jobApi.getById(schedule.jobId).then(job => {
        setJobTitle(job.title || schedule.jobId);
      }).catch(() => {
        setJobTitle(schedule.jobId);
      });
    }
  }, [schedule.jobId]);

  // El slot elegido queda como RESERVED dentro de proposedSlots
  const chosenSlot = schedule.proposedSlots.find(s => s.status === "RESERVED");

  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return "Fecha por confirmar";
    try {
      // El backend envia "yyyy-MM-dd HH:mm"
      const [datePart, timePart] = dateTime.split(" ");
      if (!datePart) return dateTime;
      const d = new Date(`${datePart}T${timePart ?? "00:00"}`);
      const dateStr = d.toLocaleDateString("es-PE", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });
      return timePart ? `${dateStr} · ${timePart}` : dateStr;
    } catch {
      return dateTime;
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-[#0EA5A0] shadow-sm p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-slate-900 truncate">{jobTitle || "Cargando..."}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Entrevista {typeLabel}</p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
          <CheckCircle2 className="w-3 h-3" /> Confirmado
        </span>
      </div>

      <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 px-4 py-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold text-emerald-900 capitalize">
            {formatDateTime(chosenSlot?.dateTime)}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4 flex-1">
        <div className="flex items-center gap-2.5 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>Tu horario quedo reservado. No se puede cambiar.</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        El boton para iniciar aparece en "Entrevistas Programadas" 5 minutos antes.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD: Entrevista Programada (con ID visible)
// ═══════════════════════════════════════════════════════════════════════════════

function ScheduledCard({ interview, onStart }: { interview: InterviewSummaryResponse; onStart: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(interview.interviewId);
    setCopied(true);
    setMenuOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const typeLabel = interview.interviewType === "THEORY" ? "Teorica" : "Tecnica";

  // Determinar si la entrevista esta vencida
  const isExpired = (() => {
    if (!interview.date) return false;
    try {
      const dateTimeStr = interview.date + (interview.time ? "T" + interview.time : "");
      const interviewDate = new Date(dateTimeStr);
      return interviewDate < new Date();
    } catch {
      return false;
    }
  })();

  return (
    <div className={`bg-white rounded-xl border-2 shadow-sm p-6 flex flex-col relative transition-colors ${
      isExpired ? "border-red-300 bg-red-50/30" : "border-emerald-300 bg-emerald-50/10"
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-slate-900 truncate">{interview.position}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{interview.company}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isExpired ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}>
            {isExpired ? "Vencida" : "Programada"}
          </span>
          {/* 3 dots menu */}
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border border-slate-200 py-1 min-w-[200px]">
                  <button onClick={handleCopyId} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    {copied ? (
                      <><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" /></svg> ID copiado</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg> Copiar ID</>
                    )}
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <div className="px-4 py-2">
                    <p className="text-[10px] font-mono text-slate-400 break-all select-all">{interview.interviewId}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fecha y hora */}
      {interview.date && (
        <div className="flex items-center gap-2 text-sm mb-3">
          <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className={`font-medium ${isExpired ? "text-red-600" : "text-slate-800"}`}>
            {interview.date}
            {interview.time && <> · {interview.time}</>}
          </span>
          {isExpired && (
            <span className="text-[10px] font-medium text-red-500 ml-auto">Vencido</span>
          )}
        </div>
      )}

      <div className="space-y-2.5 mb-6 flex-1">
        <div className="flex items-center gap-2.5 text-sm text-gray-600">
          <User className="w-4 h-4 text-gray-400 flex-shrink-0" /><span>Agente: {interview.agent}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-gray-600">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            {typeLabel}
          </span>
        </div>
      </div>
      <button onClick={() => onStart(interview.interviewId)}
        disabled={isExpired}
        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          isExpired
            ? "border-2 border-red-300 text-red-400 bg-red-50 cursor-not-allowed"
            : "border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
        }`}>
        <Play className="w-4 h-4" /> {isExpired ? "No disponible" : "Iniciar Entrevista"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════════

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: {
  icon: React.ElementType; title: string; description: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4"><Icon className="w-7 h-7 text-gray-400" /></div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-sm font-semibold hover:bg-[#162f58] transition-colors">
          <Briefcase className="w-4 h-4" /> {actionLabel}
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function InterviewsPage() {
  const [showModal, setShowModal] = useState(false);
  const [preselectedId, setPreselectedId] = useState<string | undefined>();
  const { user } = useAuthContext();
  const candidateId = user?.id ?? "";

  const { data: interviews = [], isLoading, refetch } = useMyInterviews(candidateId || null);

  // Schedules pendientes (sin horario elegido aun)
  const [schedules, setSchedules] = useState<InterviewScheduleResponse[]>([]);
  const [confirmedSchedules, setConfirmedSchedules] = useState<InterviewScheduleResponse[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<InterviewScheduleResponse | null>(null);

  const fetchSchedules = useCallback(async () => {
    if (!candidateId) return;
    setSchedulesLoading(true);
    try {
      const data = await scheduleApi.getMySchedules(candidateId);
      // Pendientes: aun no eligio horario
      setSchedules(data.filter(s => s.status === "PENDING_SELECTION" || s.status === "PENDING"));
      // Confirmados: ya eligio horario (no deben desaparecer de la pantalla)
      setConfirmedSchedules(data.filter(s => s.status === "RESERVED" || s.status === "CHOSEN"));
    } catch {
      // Silenciar error
    } finally {
      setSchedulesLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    if (candidateId) {
      fetchSchedules();
    }
  }, [candidateId, fetchSchedules]);

  const scheduled = interviews.filter(i => i.status === "SCHEDULED");
  const evaluations = interviews.filter(i => i.status === "COMPLETED" || i.status === "ABORTED");

  const handleStartInterview = (interviewId: string) => {
    setPreselectedId(interviewId);
    setShowModal(true);
  };

  const handleScheduleChosen = () => {
    setSelectedSchedule(null);
    fetchSchedules(); // Refrescar schedules
    refetch(); // Refrescar entrevistas
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1B3A6B] animate-spin" />
      </div>
    );
  }

  const hasPendingSchedules = schedules.length > 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Centro de Evaluación IA</h1>
            <p className="text-sm text-gray-500 mt-1">Valida tus habilidades con nuestros agentes de inteligencia artificial</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={() => window.location.href = "/freelancer/jobs"}
              className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <Play className="w-4 h-4" /> Ver Oportunidades
              <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold">3</span>
            </button>
          </div>
        </div>

        {/* Sección: Elegir horario (schedules pendientes) */}
        {hasPendingSchedules && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-5">Pendientes de Agendar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {schedules.map((s) => (
                <PendingScheduleCard key={s.scheduleId} schedule={s} onChooseSlot={setSelectedSchedule} />
              ))}
            </div>
          </section>
        )}

        {/* Sección: Horarios confirmados (siempre visibles) */}
        {confirmedSchedules.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-5">Horarios Confirmados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {confirmedSchedules.map((s) => (
                <ConfirmedScheduleCard key={s.scheduleId} schedule={s} />
              ))}
            </div>
          </section>
        )}

        {/* Sección: Entrevistas Programadas */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-5">Entrevistas Programadas</h2>
          {scheduled.length === 0 ? (
            <EmptyState icon={Calendar} title="No tienes entrevistas programadas"
              description={hasPendingSchedules ? "Elige un horario arriba para activar tu entrevista." : "Las empresas te agendarán entrevistas cuando inicies un proceso de selección."}
              actionLabel="Buscar empleo" onAction={() => window.location.href = "/freelancer/jobs"} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scheduled.map((interview) => (
                <ScheduledCard key={interview.interviewId} interview={interview} onStart={handleStartInterview} />
              ))}
            </div>
          )}
        </section>

        {/* Sección: Historial de Evaluaciones */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-5">Historial de Evaluaciones</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {evaluations.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3"><Video className="w-6 h-6 text-gray-400" /></div>
                <p className="text-sm text-gray-400">Aún no has realizado ninguna evaluación</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Empresa</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Posición</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Fecha</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Puntaje</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Estado</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {evaluations.map((ev) => (
                      <tr key={ev.interviewId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-slate-800">{ev.company}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{ev.position}</td>
                        <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{ev.date}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ev.passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            {ev.score ?? "—"}/{ev.maxScore}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ev.passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            {ev.passed ? "Aprobado" : "Desaprobado"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-500 italic">
                            {ev.abortReason || (ev.passed ? "Completada" : "No especificado")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      <AccessInterviewModal open={showModal} preselectedId={preselectedId} onClose={() => setShowModal(false)} onStatusChange={() => { refetch(); }} />

      {/* Modal elegir horario */}
      {selectedSchedule && (
        <ChooseSlotModal
          schedule={selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
          onComplete={handleScheduleChosen}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL: Acceder a entrevista
// ═══════════════════════════════════════════════════════════════════════════════

function AccessInterviewModal({
  open,
  preselectedId,
  onClose,
  onStatusChange,
}: {
  open: boolean;
  preselectedId?: string;
  onClose: () => void;
  onStatusChange?: () => void;
}) {
  const [interviewId, setInterviewId] = useState(preselectedId || "");
  const [interviewType, setInterviewType] = useState<"THEORY" | "TECHNICAL" | "">("");
  const [practicalCareer, setPracticalCareer] = useState("software");
  const [practicalJobTitle, setPracticalJobTitle] = useState("Technical Interview");
  const [showRoom, setShowRoom] = useState(false);
  const [showPracticalRoom, setShowPracticalRoom] = useState(false);
  const [showReport, setShowReport] = useState(false);

  if (!open) return null;

  const handleAccess = () => {
    if (!interviewId.trim() || !interviewType) return;
    if (interviewType === "TECHNICAL") {
      setShowPracticalRoom(true);
      return;
    }
    setShowRoom(true);
  };

  const handleRoomComplete = () => {
    setShowRoom(false);
    setShowReport(true);
    onStatusChange?.();
  };

  const handleClose = () => {
    setInterviewId(preselectedId || "");
    setInterviewType("");
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Acceder a Entrevista</h2>
            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">ID de la entrevista</label>
              <input type="text" value={interviewId} onChange={(e) => setInterviewId(e.target.value)}
                placeholder="Ingresa el ID de tu entrevista..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tipo de entrevista</label>
              <select value={interviewType} onChange={(e) => setInterviewType(e.target.value as "THEORY" | "TECHNICAL" | "")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]">
                <option value="">Selecciona un tipo</option>
                <option value="THEORY">Entrevista Teórica</option>
                <option value="TECHNICAL">Entrevista Técnica</option>
              </select>
            </div>
            {interviewType === "TECHNICAL" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Area practica</label>
                  <select
                    value={practicalCareer}
                    onChange={(e) => setPracticalCareer(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]"
                  >
                    <option value="software">Tecnologia / Software</option>
                    <option value="contabilidad">Contabilidad / Finanzas</option>
                    <option value="legal">Legal / Compliance</option>
                    <option value="general">Otra area</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Perfil</label>
                  <input
                    value={practicalJobTitle}
                    onChange={(e) => setPracticalJobTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]"
                  />
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={handleClose} className="flex-1 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={handleAccess} disabled={!interviewId.trim() || !interviewType}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-sm font-bold hover:bg-[#162f58] transition disabled:opacity-50">
                <Play className="w-4 h-4" /> Iniciar Entrevista
              </button>
            </div>
          </div>
        </div>
      </div>

      {showRoom && interviewType && (
        <InterviewRoom
          interviewId={interviewId}
          interviewType={interviewType}
          onClose={() => { setShowRoom(false); onStatusChange?.(); onClose(); }}
          onComplete={handleRoomComplete}
        />
      )}

      {showPracticalRoom && (
        <PracticalVoiceInterviewRoom
          sessionId={interviewId}
          career={practicalCareer}
          jobTitle={practicalJobTitle || "Technical Interview"}
          onClose={() => { setShowPracticalRoom(false); onStatusChange?.(); onClose(); }}
          onComplete={() => {
            setShowPracticalRoom(false);
            setShowReport(true);
            onStatusChange?.();
          }}
        />
      )}

      {showReport && interviewId && (
        <InterviewReportModal interviewId={interviewId} onClose={() => setShowReport(false)} />
      )}
    </>
  );
}
