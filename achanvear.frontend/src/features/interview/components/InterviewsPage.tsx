// features/interview/components/InterviewsPage.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, User, Play, Video, Briefcase, Loader2, Eye, ChevronRight, CheckCircle2, BookOpen, Code2, ClipboardCheck } from "lucide-react";
import { InterviewRoom } from "./InterviewRoom";
import { PracticalVoiceInterviewRoom } from "./PracticalVoiceInterviewRoom";
import { InterviewReportModal } from "./InterviewReportModal";
import { ChooseSlotModal } from "./ChooseSlotModal";
import { useMyInterviews } from "../hooks/useFreelancerInterviews";
import { useAuthContext } from "@/providers/AuthProvider";
import { scheduleApi, type InterviewScheduleResponse } from "../api/scheduleApi";
import { jobApi } from "@/features/jobs/api/jobApi";
import type { MyJobApplicationResponse } from "@/features/jobs/api/jobApi";
import type { InterviewSummaryResponse, InterviewReportResponse } from "../types/interview.types";

const getInterviewTypeMeta = (type: string) => {
  const isTheory = type === "THEORY";
  return {
    label: isTheory ? "Teorica" : "Practica",
    fullLabel: isTheory ? "Entrevista teorica" : "Entrevista practica",
    Icon: isTheory ? BookOpen : Code2,
    badge: isTheory ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-violet-50 text-violet-700 border-violet-200",
    accent: isTheory ? "border-l-sky-500" : "border-l-violet-500",
    button: isTheory ? "bg-sky-700 hover:bg-sky-800" : "bg-violet-700 hover:bg-violet-800",
  };
};

const inferPracticalArea = (jobTitle?: string) => {
  const text = (jobTitle || "").toLowerCase();
  if (/(software|programador|developer|frontend|backend|full.?stack|java|react|node|sistemas|tecnolog|devops|qa|datos|data)/.test(text)) {
    return "software";
  }
  if (/(marketing|market|seo|sem|contenido|redes|social|comunicaci|brand|marca|growth|digital)/.test(text)) {
    return "marketing";
  }
  if (/(ventas|comercial|business|negocio|account|cliente|crm)/.test(text)) {
    return "sales";
  }
  if (/(contab|finanz|tribut|auditor|tesorer|presupuesto)/.test(text)) {
    return "contabilidad";
  }
  if (/(legal|abog|derecho|compliance|contrato|normativ)/.test(text)) {
    return "legal";
  }
  if (/(salud|medic|dental|odont|clinica|doctor|enfermer)/.test(text)) {
    return "salud";
  }
  return "general";
};

const parseScheduleDateTime = (dateTime?: string) => {
  if (!dateTime) return null;
  const normalized = dateTime.includes("T") ? dateTime : dateTime.replace(" ", "T");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatScheduleDateTime = (dateTime?: string) => {
  if (!dateTime) return "Fecha por confirmar";
  const parsed = parseScheduleDateTime(dateTime);
  if (!parsed) return dateTime;
  return parsed.toLocaleString("es-PE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getReservedSlot = (schedule: InterviewScheduleResponse) =>
  schedule.proposedSlots.find(s => s.status === "RESERVED");

const isScheduleExpired = (schedule: InterviewScheduleResponse) => {
  const chosenSlot = getReservedSlot(schedule);
  const parsed = parseScheduleDateTime(chosenSlot?.dateTime);
  if (!parsed) return false;
  return parsed.getTime() < Date.now();
};

const formatLongScheduleDateTime = (dateTime?: string) => {
  if (!dateTime) return "Fecha por confirmar";
  const parsed = parseScheduleDateTime(dateTime);
  if (!parsed) return dateTime;
  return parsed.toLocaleString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function PendingScheduleCard({
  schedule,
  onChooseSlot,
  onChooseNow,
  isChoosingNow,
}: {
  schedule: InterviewScheduleResponse;
  onChooseSlot: (s: InterviewScheduleResponse) => void;
  onChooseNow: (s: InterviewScheduleResponse) => void;
  isChoosingNow: boolean;
}) {
  const [jobTitle, setJobTitle] = useState<string>("");
  const typeMeta = getInterviewTypeMeta(schedule.interviewType);
  const availableSlots = schedule.proposedSlots.filter(s => s.status === "AVAILABLE" || s.status === "PENDING");

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
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${typeMeta.accent} shadow-sm p-5 flex flex-col hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-base text-slate-950 truncate">{jobTitle || "Cargando..."}</h3>
          <span className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${typeMeta.badge}`}>
            <typeMeta.Icon className="w-3.5 h-3.5" /> {typeMeta.fullLabel}
          </span>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Por agendar
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5 flex-1">
        {availableSlots.slice(0, 3).map((slot) => (
          <div key={slot.index} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-semibold text-slate-500">Opcion {slot.index + 1}</p>
            <p className="mt-1 text-xs font-semibold text-slate-800 leading-tight">{formatScheduleDateTime(slot.dateTime)}</p>
          </div>
        ))}
        {availableSlots.length === 0 && (
          <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-sm text-slate-500">
            Sin horarios disponibles
          </div>
        )}
        </div>
      {schedule.interviewType === "TECHNICAL" ? (
        <button
          onClick={() => onChooseNow(schedule)}
          disabled={isChoosingNow}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-60 ${typeMeta.button}`}
        >
          {isChoosingNow ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Dar ahora
        </button>
      ) : (
        <button
          onClick={() => onChooseSlot(schedule)}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${typeMeta.button}`}
        >
          <Calendar className="w-4 h-4" /> Elegir Horario
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD: Horario ya elegido (confirmacion siempre visible)
// ═══════════════════════════════════════════════════════════════════════════════

function ConfirmedScheduleCard({ schedule, expired = false }: { schedule: InterviewScheduleResponse; expired?: boolean }) {
  const [jobTitle, setJobTitle] = useState<string>("");
  const typeMeta = getInterviewTypeMeta(schedule.interviewType);

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
  const chosenSlot = getReservedSlot(schedule);

  return (
    <div className={`bg-white rounded-xl border border-l-4 shadow-sm p-5 flex flex-col ${
      expired ? "border-slate-200 border-l-slate-400 opacity-90" : `border-slate-200 ${typeMeta.accent}`
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-slate-900 truncate">{jobTitle || "Cargando..."}</h3>
          <span className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${typeMeta.badge}`}>
            <typeMeta.Icon className="w-3.5 h-3.5" /> {typeMeta.fullLabel}
          </span>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${
          expired ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
        }`}>
          {expired ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
          {expired ? "Vencida" : "Confirmado"}
        </span>
      </div>

      <div className={`rounded-xl border px-4 py-3 mb-4 ${
        expired ? "bg-slate-50 border-slate-200" : "bg-emerald-50/60 border-emerald-100"
      }`}>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className={`w-4 h-4 flex-shrink-0 ${expired ? "text-slate-400" : "text-emerald-600"}`} />
          <span className={`font-semibold capitalize ${expired ? "text-slate-700" : "text-emerald-900"}`}>
            {formatScheduleDateTime(chosenSlot?.dateTime)}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4 flex-1">
        <div className="flex items-center gap-2.5 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>
            {expired
              ? "Este horario ya paso. La entrevista queda vencida y no aparece como pendiente."
              : "Tu horario quedo reservado. No se puede cambiar."}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        {expired
          ? "Si necesitas otra oportunidad, espera que la empresa reprograme o solicita una nueva postulacion."
          : "El boton para iniciar aparece en \"Entrevistas Programadas\"."}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD: Entrevista Programada (con ID visible)
// ═══════════════════════════════════════════════════════════════════════════════

function ScheduledCard({ interview, onStart }: { interview: InterviewSummaryResponse; onStart: (interview: InterviewSummaryResponse) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(interview.interviewId);
    setCopied(true);
    setMenuOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const typeMeta = getInterviewTypeMeta(interview.interviewType);

  const isAborted = interview.status === "ABORTED";

  return (
    <div className={`bg-white rounded-xl border border-l-4 shadow-sm p-5 flex flex-col relative transition-colors ${
      isAborted ? "border-red-200 border-l-red-500 bg-red-50/30" : `border-slate-200 ${typeMeta.accent} hover:shadow-md`
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-slate-900 truncate">{interview.position}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{interview.company}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isAborted ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}>
            {isAborted ? "No disponible" : "Programada"}
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
          <span className={`font-medium ${isAborted ? "text-red-600" : "text-slate-800"}`}>
            {interview.date}
            {interview.time && <> · {interview.time}</>}
          </span>
          {isAborted && (
            <span className="text-[10px] font-medium text-red-500 ml-auto">Cancelada</span>
          )}
        </div>
      )}

      <div className="space-y-2.5 mb-6 flex-1">
        <div className="flex items-center gap-2.5 text-sm text-gray-600">
          <User className="w-4 h-4 text-gray-400 flex-shrink-0" /><span>Agente: {interview.agent}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-gray-600">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${typeMeta.badge}`}>
            <typeMeta.Icon className="w-3.5 h-3.5" /> {typeMeta.fullLabel}
          </span>
        </div>
      </div>
      <button onClick={() => onStart(interview)}
        disabled={isAborted}
        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          isAborted
            ? "border-2 border-red-300 text-red-400 bg-red-50 cursor-not-allowed"
            : "border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
        }`}>
        <Play className="w-4 h-4" /> {isAborted ? "No disponible" : "Iniciar Entrevista"}
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

function ApplicationFeedbackCard({ application }: { application: MyJobApplicationResponse }) {
  const isManualApplication = application.selectionMode === "MANUAL";
  const appliedAtTime = new Date(application.appliedAt).getTime();
  const evaluationTookTooLong = Number.isFinite(appliedAtTime) && Date.now() - appliedAtTime > 60_000;
  const didNotQualify = application.screeningResult === false || application.status === "REJECTED";
  const isWaitingForAi = !isManualApplication && application.screeningResult == null && application.status === "SUBMITTED" && !evaluationTookTooLong;
  const isCompanyReview = isManualApplication || (application.screeningResult == null && application.status === "IN_REVIEW");
  const isEvaluationDelayed = !isManualApplication && application.screeningResult == null && application.status === "SUBMITTED" && evaluationTookTooLong;
  const isShortlisted = application.screeningResult === true || application.status === "SHORTLISTED";
  const statusLabel = didNotQualify
    ? "No clasificaste a entrevista teorica"
    : isWaitingForAi
      ? "Evaluando tu perfil con IA"
      : isCompanyReview
        ? "Postulacion en revision"
        : isEvaluationDelayed
          ? "Evaluacion IA demorada"
        : isShortlisted
          ? "Perfil recomendado por IA"
          : "Postulacion en revision";
  const scoreLabel = isWaitingForAi
    ? "Evaluando"
    : application.screeningScore == null
      ? "Pendiente"
      : `${Math.round(application.screeningScore)}/100`;
  const reason = application.screeningSummary?.trim()
    || (isWaitingForAi
      ? "La IA esta revisando tu CV, biografia y carta de presentacion. Esto normalmente termina en menos de un minuto."
      : isCompanyReview
        ? "Tu postulacion quedo en revision manual. La empresa revisara tu CV, biografia y carta, y puede contactarte directamente."
        : isEvaluationDelayed
          ? "La evaluacion IA esta tardando mas de lo esperado. Refresca la pagina; si sigue igual, la empresa podra revisar tu postulacion manualmente."
        : didNotQualify
          ? "La empresa o la IA aun no registro un motivo detallado para esta postulacion."
          : isShortlisted
            ? "Tu perfil supero el screening. Si el cronograma aun no aparece, espera unos minutos o refresca la pagina."
          : "Tu postulacion sigue en evaluacion.");
  const appliedDate = new Date(application.appliedAt).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={`rounded-xl border p-4 ${
      didNotQualify ? "border-red-100 bg-red-50/40" : "border-amber-100 bg-amber-50/30"
    }`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{application.jobTitle}</p>
          <p className="text-xs text-slate-500 mt-0.5">{application.companyName} · {appliedDate}</p>
        </div>
        <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
          didNotQualify ? "bg-red-100 text-red-700" : "bg-amber-50 text-amber-700"
        }`}>
          {scoreLabel}
        </span>
      </div>
      <div className="mt-3">
        <p className={`text-xs font-semibold ${didNotQualify ? "text-red-700" : "text-slate-700"}`}>
          {statusLabel}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{reason}</p>
      </div>
    </div>
  );
}

export function InterviewsPage() {
  const [showModal, setShowModal] = useState(false);
  const [preselectedId, setPreselectedId] = useState<string | undefined>();
  const [selectedInterviewContext, setSelectedInterviewContext] = useState<InterviewSummaryResponse | null>(null);
  const { user } = useAuthContext();
  const candidateId = user?.id ?? "";

  const { data: interviews = [], isLoading, refetch } = useMyInterviews(candidateId || null);
  const { data: applications = [] } = useQuery({
    queryKey: ["my-job-applications", candidateId],
    queryFn: () => jobApi.getMyApplications({ page: 0, size: 50 }),
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 2,
  });

  // Schedules pendientes (sin horario elegido aun)
  const [schedules, setSchedules] = useState<InterviewScheduleResponse[]>([]);
  const [confirmedSchedules, setConfirmedSchedules] = useState<InterviewScheduleResponse[]>([]);
  const [expiredSchedules, setExpiredSchedules] = useState<InterviewScheduleResponse[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<InterviewScheduleResponse | null>(null);
  const [choosingNowScheduleId, setChoosingNowScheduleId] = useState<string | null>(null);
  const fetchSchedules = useCallback(async () => {
    if (!candidateId) return;
    setSchedulesLoading(true);
    try {
      const data = await scheduleApi.getMySchedules(candidateId);
      const activeSchedules = data.filter(s => !interviews.some(i => {
        const matchingApplication = applications.find(application => application.jobPostId === s.jobId);
        return (i.status === "COMPLETED" || i.status === "ABORTED") &&
          i.interviewType === s.interviewType &&
          matchingApplication &&
          i.position === matchingApplication.jobTitle;
      }));
      // Pendientes: aun no eligio horario
      setSchedules(activeSchedules.filter(s => s.status === "PENDING_SELECTION" || s.status === "PENDING"));
      const chosenSchedules = activeSchedules.filter(s => s.status === "RESERVED" || s.status === "CHOSEN");
      setConfirmedSchedules(chosenSchedules.filter(s => !isScheduleExpired(s)));
      setExpiredSchedules(chosenSchedules.filter(isScheduleExpired));
    } catch {
      // Silenciar error
    } finally {
      setSchedulesLoading(false);
    }
  }, [candidateId, interviews, applications]);

  useEffect(() => {
    if (candidateId) {
      fetchSchedules();
    }
  }, [candidateId, fetchSchedules]);

  const scheduled = interviews.filter(i => i.status === "SCHEDULED");
  const evaluations = interviews.filter(i => i.status === "COMPLETED" || i.status === "ABORTED");
  const applicationFeedbackItems = applications.filter((application) =>
    application.screeningResult == null ||
    application.screeningResult === false ||
    application.status === "SUBMITTED" ||
    application.status === "IN_REVIEW" ||
    application.status === "SHORTLISTED" ||
    application.status === "REJECTED"
  );

  const handleStartInterview = (interview: InterviewSummaryResponse) => {
    setPreselectedId(interview.interviewId);
    setSelectedInterviewContext(interview);
    setShowModal(true);
  };

  const handleScheduleChosen = () => {
    setSelectedSchedule(null);
    fetchSchedules(); // Refrescar schedules
    refetch(); // Refrescar entrevistas
  };

  const handleChooseNow = async (schedule: InterviewScheduleResponse) => {
    setChoosingNowScheduleId(schedule.scheduleId);
    try {
      await scheduleApi.chooseNow(schedule.scheduleId);
      await fetchSchedules();
      await refetch();
    } finally {
      setChoosingNowScheduleId(null);
    }
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {schedules.map((s) => (
                <PendingScheduleCard
                  key={s.scheduleId}
                  schedule={s}
                  onChooseSlot={setSelectedSchedule}
                  onChooseNow={handleChooseNow}
                  isChoosingNow={choosingNowScheduleId === s.scheduleId}
                />
              ))}
            </div>
          </section>
        )}

        {/* Sección: Horarios confirmados (siempre visibles) */}
        {confirmedSchedules.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-5">Horarios Confirmados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {confirmedSchedules.map((s) => (
                <ConfirmedScheduleCard key={s.scheduleId} schedule={s} />
              ))}
            </div>
          </section>
        )}

        {expiredSchedules.length > 0 && (
          <section>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Horarios vencidos</h2>
                <p className="text-sm text-slate-500 mt-1">Estos horarios ya pasaron y no se muestran como entrevistas pendientes.</p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                <Clock className="w-3.5 h-3.5" /> {expiredSchedules.length} vencidos
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {expiredSchedules.map((s) => (
                <ConfirmedScheduleCard key={s.scheduleId} schedule={s} expired />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {scheduled.map((interview) => (
                <ScheduledCard key={interview.interviewId} interview={interview} onStart={handleStartInterview} />
              ))}
            </div>
          )}
        </section>

        {/* Sección: Historial de Evaluaciones */}
        <section>
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Historial de Evaluaciones</h2>
              <p className="text-sm text-slate-500 mt-1">Las entrevistas finalizadas se guardan aqui y ya no aparecen como pendientes.</p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
              <ClipboardCheck className="w-3.5 h-3.5" /> {evaluations.length} registros
            </span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {evaluations.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3"><Video className="w-6 h-6 text-gray-400" /></div>
                <p className="text-sm text-gray-400">Aún no has realizado ninguna evaluación</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Empresa</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Posición</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Tipo</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Fecha</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Puntaje</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Estado</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {evaluations.map((ev) => (
                      <tr key={ev.interviewId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-slate-800">{ev.company}</td>
                        <td className="px-5 py-4 text-sm text-gray-600 min-w-[220px]">{ev.position}</td>
                        <td className="px-5 py-4">
                          {(() => {
                            const typeMeta = getInterviewTypeMeta(ev.interviewType);
                            return (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${typeMeta.badge}`}>
                                <typeMeta.Icon className="w-3.5 h-3.5" /> {typeMeta.label}
                              </span>
                            );
                          })()}
                        </td>
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
          {applicationFeedbackItems.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-4">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900">Historial de postulaciones</h3>
                <p className="text-xs text-slate-500 mt-1">Revisa si tu perfil sigue en evaluacion o por que no avanzaste a entrevista teorica.</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {applicationFeedbackItems.map((application) => (
                  <ApplicationFeedbackCard key={application.id} application={application} />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <AccessInterviewModal
        open={showModal}
        preselectedId={preselectedId}
        interviewContext={selectedInterviewContext}
        candidateName={user?.fullName}
        onClose={() => { setShowModal(false); setSelectedInterviewContext(null); }}
        onStatusChange={() => { refetch(); }}
      />

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
  interviewContext,
  candidateName,
  onClose,
  onStatusChange,
}: {
  open: boolean;
  preselectedId?: string;
  interviewContext?: InterviewSummaryResponse | null;
  candidateName?: string;
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

  useEffect(() => {
    if (!open) return;
    setInterviewId(preselectedId || "");
    if (interviewContext) {
      const type = interviewContext.interviewType === "THEORY" ? "THEORY" : "TECHNICAL";
      setInterviewType(type);
      setPracticalJobTitle(interviewContext.position || "Entrevista practica");
      setPracticalCareer(inferPracticalArea(interviewContext.position));
    }
  }, [open, preselectedId, interviewContext]);

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
    setPracticalCareer("software");
    setPracticalJobTitle("Technical Interview");
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Acceder a Entrevista</h2>
            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="space-y-4">
            {interviewContext && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Contexto detectado</p>
                <h3 className="mt-1 text-sm font-bold text-slate-950">{interviewContext.position}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {interviewContext.company} · El agente usara este puesto para preparar preguntas y casos especificos.
                </p>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">ID de la entrevista</label>
              <input type="text" value={interviewId} onChange={(e) => setInterviewId(e.target.value)}
                placeholder="Ingresa el ID de tu entrevista..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tipo de entrevista</label>
              <select value={interviewType} onChange={(e) => setInterviewType(e.target.value as "THEORY" | "TECHNICAL" | "")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]">
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]"
                  >
                    <option value="software">Tecnologia / Software</option>
                    <option value="marketing">Marketing / Comunicacion</option>
                    <option value="sales">Ventas / Comercial</option>
                    <option value="contabilidad">Contabilidad / Finanzas</option>
                    <option value="legal">Legal / Compliance</option>
                    <option value="salud">Salud / Clinica</option>
                    <option value="general">Otra area</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Puesto / perfil</label>
                  <input
                    value={practicalJobTitle}
                    onChange={(e) => setPracticalJobTitle(e.target.value)}
                    placeholder="Ej. Especialista en Marketing Digital"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]"
                  />
                </div>
                <p className="sm:col-span-2 text-xs leading-relaxed text-slate-500">
                  Estos datos orientan al agente: no es lo mismo marketing digital, ventas B2B, Java backend o contabilidad tributaria.
                </p>
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
          candidateName={candidateName}
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
