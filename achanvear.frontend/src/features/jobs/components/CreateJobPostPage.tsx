// features/jobs/components/CreateJobPostPage.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Eye,
  Users,
  Sparkles,
  Bot,
  Zap,
  ChevronRight,
  Crown,
  Lock,
  X,
  CreditCard,
} from "lucide-react";
import { useCreateJobPost } from "../hooks/useCreateJobPost";
import { useCurrentPlan } from "@/features/settings/hooks/useCompanySettings";
import AiJobAssistant from "./AiJobAssistant";
import type {
  JobType,
  SelectionMode,
  ClosingMode,
  JobAiSuggestion,
} from "../types/job.types";

type JobTypeOption = {
  label: string;
  value: JobType;
};

const JOB_TYPES: JobTypeOption[] = [
  { label: "FULL TIME", value: "FULL_TIME" },
  { label: "PART TIME", value: "PART_TIME" },
  { label: "FREELANCE", value: "FREELANCE" },
];

type SelectionCard = {
  id: SelectionMode;
  title: string;
  description: string;
  badge?: { text: string; variant: "yellow" | "default" };
  secondaryBadge?: string;
  icon: React.ReactNode;
};

const SELECTION_CARDS: SelectionCard[] = [
  {
    id: "MANUAL",
    title: "Seleccion Manual",
    description:
      "Tu equipo revisa todas las postulaciones y decide a quien entrevistar. Control total del proceso.",
    secondaryBadge: "Recomendado para empresas con RRHH propio",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "SEMI_AUTOMATED",
    title: "Seleccion Semiautomatizada",
    description:
      "La IA filtra y clasifica a los mejores candidatos segun el perfil requerido. Tu decides a quien entrevistar.",
    badge: { text: "POPULAR", variant: "yellow" },
    secondaryBadge: "Recomendado para MYPEs",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: "FULLY_AUTOMATED",
    title: "Seleccion Totalmente Automatizada",
    description:
      "La IA filtra candidatos y conduce las entrevistas iniciales. Recibes un reporte final con los mejores perfiles.",
    icon: <Bot className="w-5 h-5" />,
  },
];

type NotificationTiming = "IMMEDIATE" | "AFTER_2_HOURS" | "AFTER_CLOSING";

const NOTIFICATION_OPTIONS: { id: NotificationTiming; label: string; help: string }[] = [
  {
    id: "IMMEDIATE",
    label: "Al instante",
    help: "El candidato recibe la notificacion apenas se evalua su perfil",
  },
  {
    id: "AFTER_2_HOURS",
    label: "En 2 horas",
    help: "Las notificaciones se agrupan y envian cada 2 horas",
  },
  {
    id: "AFTER_CLOSING",
    label: "Al cierre de postulaciones",
    help: "Todos los candidatos reciben su resultado cuando se cierren las postulaciones",
  },
];

const CLOSING_OPTIONS: { id: ClosingMode; label: string; help: string; icon: React.ReactNode }[] = [
  {
    id: "CONTINUOUS",
    label: "Siempre abierto",
    help: "Las postulaciones estaran abiertas hasta que la empresa decida cerrarlas manualmente",
    icon: <span className="text-sm font-bold">∞</span>,
  },
  {
    id: "MAX_APPLICANTS",
    label: "Por maximo de postulantes",
    help: "Las postulaciones se cierran automaticamente al alcanzar el numero maximo de postulantes",
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: "FIXED_DATE",
    label: "Por fecha limite",
    help: "Las postulaciones se cierran en una fecha especifica que tu elijas",
    icon: <span className="text-sm font-bold">📅</span>,
  },
];

// RESPONSIVE: padding de las tarjetas de sección. 24px por lado en celular
// dejaba muy poco ancho útil (a 284px quedaban ~190px para el contenido).
const CARD = "bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm";

// ─── Límites que exige el backend (POST /jobs → CreateJobRequest) ─────────────
// Pendiente front #30: el formulario solo validaba "no vacío", así que con un título
// de 3 letras el botón Publicar se habilitaba y el backend respondía 400. Estos son
// los rangos del esquema de Swagger.
const LIMITS = {
  title: { min: 5, max: 150 },
  description: { min: 20, max: 5000 },
  location: { min: 2, max: 120 },
  requirements: { max: 5000 },
} as const;

// <validate>
type JobFormValues = {
  title: string;
  description: string;
  remote: boolean;
  location: string;
  requirements: string;
  selectionMode: SelectionMode | null;
  maxCandidatesForScreening: string;
  candidatesForTheoryInterview: string;
  salaryMin: string;
  salaryMax: string;
};

// Se valida sobre el texto con trim(), que es lo que realmente se envía al backend.
function validateJobForm(v: JobFormValues): string[] {
  const errs: string[] = [];

  const title = v.title.trim();
  if (!title) errs.push("El titulo del puesto es requerido");
  else if (title.length < LIMITS.title.min)
    errs.push(`El titulo debe tener al menos ${LIMITS.title.min} caracteres (tiene ${title.length})`);
  else if (title.length > LIMITS.title.max)
    errs.push(`El titulo no puede superar ${LIMITS.title.max} caracteres`);

  const description = v.description.trim();
  if (!description) errs.push("La descripcion es requerida");
  else if (description.length < LIMITS.description.min)
    errs.push(`La descripcion debe tener al menos ${LIMITS.description.min} caracteres (tiene ${description.length})`);
  else if (description.length > LIMITS.description.max)
    errs.push(`La descripcion no puede superar ${LIMITS.description.max} caracteres`);

  if (!v.remote) {
    const location = v.location.trim();
    if (!location) errs.push("La ubicacion es requerida");
    else if (location.length < LIMITS.location.min)
      errs.push(`La ubicacion debe tener al menos ${LIMITS.location.min} caracteres`);
    else if (location.length > LIMITS.location.max)
      errs.push(`La ubicacion no puede superar ${LIMITS.location.max} caracteres`);
  }

  if (v.requirements.trim().length > LIMITS.requirements.max)
    errs.push(`Los requisitos no pueden superar ${LIMITS.requirements.max} caracteres`);

  if (!v.selectionMode) errs.push("Debes seleccionar un modo de seleccion");
  if (
    v.selectionMode === "FULLY_AUTOMATED" &&
    (!v.maxCandidatesForScreening || Number(v.maxCandidatesForScreening) < 1)
  ) {
    errs.push("El maximo de candidatos para screening debe ser al menos 1");
  }
  if (
    v.selectionMode === "FULLY_AUTOMATED" &&
    (!v.candidatesForTheoryInterview || Number(v.candidatesForTheoryInterview) < 1)
  ) {
    errs.push("Los candidatos para entrevista teorica deben ser al menos 1");
  }

  // El backend exige salaryMin y salaryMax >= 0
  if ((v.salaryMin && Number(v.salaryMin) < 0) || (v.salaryMax && Number(v.salaryMax) < 0)) {
    errs.push("El salario no puede ser negativo");
  }
  if (v.salaryMin && v.salaryMax && Number(v.salaryMin) > Number(v.salaryMax)) {
    errs.push("El salario minimo no puede ser mayor al maximo");
  }
  return errs;
}
// </validate>

// Contador de caracteres bajo cada campo con límite (mismo patrón que la carta de presentación al postular)
function CharCounter({ length, min, max }: { length: number; min?: number; max: number }) {
  const tooShort = min != null && length > 0 && length < min;
  return (
    <p className={`mt-1.5 text-xs ${tooShort ? "text-red-500" : "text-slate-400"}`}>
      {min != null && length < min
        ? `Minimo ${min} caracteres (${length}/${min})`
        : `${length}/${max} caracteres`}
    </p>
  );
}

export default function CreateJobPostPage() {
  const router = useRouter();
  const { mutate: createJob, isPending } = useCreateJobPost();
  const { currentPlan } = useCurrentPlan();
  const isFreePlan = !currentPlan || currentPlan.planType?.toUpperCase() === "FREE";

  // ─── Form state ──────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [type, setType] = useState<JobType>("FULL_TIME");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [hideSalary, setHideSalary] = useState(false);
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [selectionMode, setSelectionMode] = useState<SelectionMode | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);

  // ─── Automation config (only for FULLY_AUTOMATED) ────────────────────────
  const [maxCandidatesForScreening, setMaxCandidatesForScreening] = useState("50");
  const [candidatesForTheoryInterview, setCandidatesForTheoryInterview] = useState("10");
  const [minimumScore, setMinimumScore] = useState(75);

  // ─── Closing mode ────────────────────────────────────────────────────────
  const [closingMode, setClosingMode] = useState<ClosingMode>("CONTINUOUS");
  const [maxApplicants, setMaxApplicants] = useState("50");
  const [closingDate, setClosingDate] = useState("");

  // ─── Notification timing ─────────────────────────────────────────────────
  const [notificationTiming, setNotificationTiming] = useState<NotificationTiming>("IMMEDIATE");

  // ─── Validation ──────────────────────────────────────────────────────────
  const errors = useMemo(
    () =>
      validateJobForm({
        title,
        description,
        remote,
        location,
        requirements,
        selectionMode,
        maxCandidatesForScreening,
        candidatesForTheoryInterview,
        salaryMin,
        salaryMax,
      }),
    [title, description, remote, location, requirements, selectionMode, maxCandidatesForScreening, candidatesForTheoryInterview, salaryMin, salaryMax]
  );

  // ─── Preview ─────────────────────────────────────────────────────────────
  const displayLocation = remote ? "Trabajo Remoto" : location || "No especificada";

  const preview = useMemo(
    () => ({
      title: title || "Titulo del puesto",
      location: displayLocation,
      type,
      selectionMode,
    }),
    [title, displayLocation, type, selectionMode]
  );

  const selectionModeLabel = useMemo(() => {
    switch (selectionMode) {
      case "MANUAL":
        return "Manual";
      case "SEMI_AUTOMATED":
        return "Semiautomatizada";
      case "FULLY_AUTOMATED":
        return "Totalmente Automatizada";
      default:
        return null;
    }
  }, [selectionMode]);

  // ─── AI Suggestion handler ──────────────────────────────────────────────
  const handleAiSuggestion = (suggestion: JobAiSuggestion) => {
    if (suggestion.title) setTitle(suggestion.title);
    if (suggestion.description) setDescription(suggestion.description);
    if (suggestion.requirements) setRequirements(suggestion.requirements);
    if (suggestion.type) {
      const validTypes: Record<string, JobType> = {
        FULL_TIME: "FULL_TIME",
        PART_TIME: "PART_TIME",
        FREELANCE: "FREELANCE",
      };
      const mapped = validTypes[suggestion.type.toUpperCase()];
      if (mapped) setType(mapped);
    }
    if (suggestion.location) {
      const loc = suggestion.location.toLowerCase();
      if (loc.includes("remoto") || loc.includes("remote")) {
        setRemote(true);
        setLocation("");
      } else {
        setRemote(false);
        setLocation(suggestion.location);
      }
    }
    if (suggestion.salaryMin != null) setSalaryMin(String(suggestion.salaryMin));
    if (suggestion.salaryMax != null) setSalaryMax(String(suggestion.salaryMax));
  };

  const handleSelectionModeClick = (mode: SelectionMode) => {
    setSubmitError(null);
    setDraftNotice(null);
    if (isFreePlan && mode !== "MANUAL") {
      setShowUpgradeModal(true);
      return;
    }
    setSelectionMode(mode);
  };

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = (status: "PUBLISHED" | "DRAFT") => {
    if (status === "PUBLISHED" && errors.length > 0) return;
    setSubmitError(null);
    setDraftNotice(null);

    if (status === "DRAFT") {
      setDraftNotice("Borrador guardado en esta pantalla. Para publicarlo necesitas publicaciones disponibles o actualizar tu plan.");
      return;
    }

    createJob(
      {
        title: title.trim(),
        description: description.trim(),
        location: remote ? "Remoto" : location.trim() || "No especificada",
        type,
        salaryMin: hideSalary ? 0 : Number(salaryMin) || 0,
        salaryMax: hideSalary ? 0 : Number(salaryMax) || 0,
        currency: "PEN",
        vacancies: 1,
        requirements: requirements.trim() || undefined,
        selectionMode: selectionMode || "MANUAL",
        hideSalary: hideSalary || undefined,
        maxCandidatesForScreening:
          selectionMode === "FULLY_AUTOMATED"
            ? Number(maxCandidatesForScreening)
            : undefined,
        candidatesForTheoryInterview:
          selectionMode === "FULLY_AUTOMATED"
            ? Number(candidatesForTheoryInterview)
            : undefined,
        minimumScore:
          selectionMode === "FULLY_AUTOMATED" ? minimumScore : undefined,
        // Cierre de vacantes
        closingMode,
        maxApplicants:
          closingMode === "MAX_APPLICANTS" ? Number(maxApplicants) : undefined,
        closingDate:
          closingMode === "FIXED_DATE" && closingDate
            ? new Date(closingDate).toISOString()
            : undefined,
        // Cuando notificar al candidato
        notificationTiming:
          selectionMode === "FULLY_AUTOMATED" ? notificationTiming : undefined,
      },
      {
        onSuccess: () => {
          router.push("/company");
        },
        onError: (error) => {
          const message = error instanceof Error
            ? error.message
            : "No puedes publicar otro empleo. Actualiza a un plan superior o compra un paquete de publicaciones.";
          setSubmitError(message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* RESPONSIVE: pb-24 en celular deja espacio para que el botón flotante
          del asistente IA (esquina inferior derecha) no tape los botones
          finales ni el último bloque de texto. */}
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-24 sm:px-6 sm:pt-8 sm:pb-8">
        {/* Back button */}
        <button
          onClick={() => router.push("/company")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
          <span className="text-sm font-medium">Volver al inicio</span>
        </button>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0a1628] mb-8">
          Publicar nueva oferta laboral
        </h1>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ─── Left column - Form ─────────────────────────────────────── */}
          <div className="min-w-0 lg:col-span-2 space-y-6 sm:space-y-8">
            {/* 1. Title */}
            <div className={CARD}>
              <label className="block text-sm font-semibold text-[#0a1628] mb-2">
                Titulo del puesto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={LIMITS.title.max}
                placeholder="Ej: Desarrollador Full Stack Senior"
                className="w-full min-w-0 h-12 px-4 rounded-lg border border-slate-300 bg-white text-[#0a1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base"
              />
              <CharCounter length={title.trim().length} min={LIMITS.title.min} max={LIMITS.title.max} />
            </div>

            {/* 2. Job Type
                RESPONSIVE: 3 botones en una fila se salían de la tarjeta en
                celular (FREELANCE quedaba fuera). Apilados hasta sm. */}
            <div className={CARD}>
              <label className="block text-sm font-semibold text-[#0a1628] mb-3">
                Tipo de empleo <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {JOB_TYPES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setType(option.value)}
                    className={`h-11 rounded-lg border text-sm font-semibold transition-all ${
                      type === option.value
                        ? "border-blue-600 bg-blue-50 text-[#0a1628]"
                        : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Location
                RESPONSIVE: input + checkbox "Trabajo remoto" en una sola fila
                empujaban el checkbox fuera de la tarjeta. Apilados hasta sm. */}
            <div className={CARD}>
              <label className="block text-sm font-semibold text-[#0a1628] mb-2">
                Ubicacion <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={LIMITS.location.max}
                  placeholder="Ej: Lima, Peru"
                  disabled={remote}
                  className={`w-full min-w-0 sm:flex-1 h-12 px-4 rounded-lg border bg-white text-[#0a1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base ${
                    remote
                      ? "border-slate-200 bg-slate-50 text-slate-400"
                      : "border-slate-300"
                  }`}
                />
                <label className="flex w-full items-center gap-2 h-12 px-4 rounded-lg border border-slate-300 bg-white cursor-pointer select-none shrink-0 sm:w-auto">
                  <input
                    type="checkbox"
                    checked={remote}
                    onChange={(e) => {
                      setRemote(e.target.checked);
                      if (e.target.checked) setLocation("");
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Trabajo remoto
                  </span>
                </label>
              </div>
              {!remote && (
                <CharCounter length={location.trim().length} min={LIMITS.location.min} max={LIMITS.location.max} />
              )}
            </div>

            {/* 4. Salary Range
                RESPONSIVE: los dos inputs en fila no encogían (un input tiene
                un ancho mínimo propio) y el segundo se cortaba. Se apilan
                hasta sm y llevan min-w-0. */}
            <div className={CARD}>
              <label className="block text-sm font-semibold text-[#0a1628] mb-2">
                Rango salarial (S/.)
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  min={0}
                  placeholder="Minimo"
                  disabled={hideSalary}
                  className={`w-full min-w-0 sm:flex-1 h-12 px-4 rounded-lg border bg-white text-[#0a1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base ${
                    hideSalary
                      ? "border-slate-200 bg-slate-50 text-slate-400"
                      : "border-slate-300"
                  }`}
                />
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  min={0}
                  placeholder="Maximo"
                  disabled={hideSalary}
                  className={`w-full min-w-0 sm:flex-1 h-12 px-4 rounded-lg border bg-white text-[#0a1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base ${
                    hideSalary
                      ? "border-slate-200 bg-slate-50 text-slate-400"
                      : "border-slate-300"
                  }`}
                />
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideSalary}
                  onChange={(e) => setHideSalary(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">
                  No especificar salario publicamente
                </span>
              </label>
            </div>

            {/* 5. Description */}
            <div className={CARD}>
              <label className="block text-sm font-semibold text-[#0a1628] mb-2">
                Descripcion del puesto <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={LIMITS.description.max}
                placeholder="Describe las responsabilidades del puesto, el equipo con el que trabajara y el contexto de la posicion..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-[#0a1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base resize-none"
              />
              <CharCounter length={description.trim().length} min={LIMITS.description.min} max={LIMITS.description.max} />
            </div>

            {/* 6. Requirements */}
            <div className={CARD}>
              <label className="block text-sm font-semibold text-[#0a1628] mb-2">
                Requisitos
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                maxLength={LIMITS.requirements.max}
                placeholder="Lista los requisitos tecnicos, experiencia necesaria, formacion academica, etc..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-[#0a1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base resize-none"
              />
              <CharCounter length={requirements.trim().length} max={LIMITS.requirements.max} />
            </div>

            {/* ─── 7. Configura el proceso de seleccion ──────────────────── */}
            <div className={CARD}>
              <h2 className="text-lg font-bold text-[#0a1628] mb-1">
                Configura el proceso de seleccion
              </h2>
              <p className="text-sm text-slate-500 mb-5">
                Elige como deseas gestionar las postulaciones
              </p>

              <div className="space-y-3">
                {SELECTION_CARDS.map((card) => {
                  const isSelected = selectionMode === card.id;
                  const isFullyAuto =
                    card.id === "FULLY_AUTOMATED" && isSelected;

                  return (
                    <div key={card.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectionModeClick(card.id)}
                        className={`w-full text-left rounded-xl border-2 p-3 sm:p-5 transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/60 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        {/* RESPONSIVE: en celular el texto quedaba en una
                            columna de ~60px (una palabra por línea) porque el
                            ícono, el radio y los paddings comían todo el
                            ancho. Con grid, la descripción ocupa el ancho
                            completo en celular y queda alineada bajo el título
                            desde sm. */}
                        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 sm:gap-x-4">
                          {/* Icon */}
                          <div
                            className={`sm:row-span-2 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-[#0a1628] text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {card.icon}
                          </div>

                          {/* Title + badges */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`min-w-0 break-words font-semibold text-sm sm:text-base ${
                                  isSelected ? "text-[#0a1628]" : "text-slate-800"
                                }`}
                              >
                                {card.title}
                              </span>
                              {card.badge && (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    card.badge.variant === "yellow"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {card.badge.text}
                                </span>
                              )}
                              {isFreePlan && card.id !== "MANUAL" && (
                                <span className="inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white">
                                  <Lock className="w-3 h-3" />
                                  Plan superior
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Radio indicator */}
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                              isSelected
                                ? "border-blue-600"
                                : "border-slate-300"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                            )}
                          </div>

                          {/* Description */}
                          <div className="col-span-3 min-w-0 sm:col-span-2 sm:col-start-2">
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {card.description}
                            </p>
                            {card.secondaryBadge && (
                              <span className="inline-block mt-2 text-[11px] text-slate-400 font-medium">
                                {card.secondaryBadge}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* ─── Extra controls for FULLY_AUTOMATED ──────────── */}
                      {isFullyAuto && (
                        <div className="mt-3 ml-2 pl-3 sm:ml-14 sm:pl-4 border-l-2 border-blue-200 space-y-4 py-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                            <Zap className="w-4 h-4" />
                            <span>Maximo ahorro de tiempo</span>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">
                              Maximo de candidatos para screening
                            </label>
                            <input
                              type="number"
                              value={maxCandidatesForScreening}
                              onChange={(e) =>
                                setMaxCandidatesForScreening(e.target.value)
                              }
                              min={1}
                              className="w-full min-w-0 h-10 px-3 rounded-lg border border-slate-300 bg-white text-[#0a1628] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">
                              Candidatos que pasan a entrevista teorica
                            </label>
                            <input
                              type="number"
                              value={candidatesForTheoryInterview}
                              onChange={(e) =>
                                setCandidatesForTheoryInterview(e.target.value)
                              }
                              min={1}
                              className="w-full min-w-0 h-10 px-3 rounded-lg border border-slate-300 bg-white text-[#0a1628] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">
                              Puntaje minimo para aprobar:{" "}
                              <span className="font-bold text-blue-700">
                                {minimumScore}%
                              </span>
                            </label>
                            <input
                              type="range"
                              value={minimumScore}
                              onChange={(e) =>
                                setMinimumScore(Number(e.target.value))
                              }
                              min={0}
                              max={100}
                              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-slate-200"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                              <span>0%</span>
                              <span>50%</span>
                              <span>100%</span>
                            </div>
                          </div>

                          {/* ─── Notification timing ──────────────────────── */}
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2">
                              ¿Cuando notificar al candidato?
                            </label>
                            <div className="space-y-2">
                              {NOTIFICATION_OPTIONS.map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setNotificationTiming(opt.id)}
                                  className={`w-full text-left rounded-lg border-2 p-3 transition-all ${
                                    notificationTiming === opt.id
                                      ? "border-blue-600 bg-blue-50/60"
                                      : "border-slate-200 bg-white hover:border-slate-300"
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <div
                                      className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                        notificationTiming === opt.id
                                          ? "border-blue-600"
                                          : "border-slate-300"
                                      }`}
                                    >
                                      {notificationTiming === opt.id && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <span
                                        className={`text-xs font-semibold ${
                                          notificationTiming === opt.id
                                            ? "text-[#0a1628]"
                                            : "text-slate-700"
                                        }`}
                                      >
                                        {opt.label}
                                      </span>
                                      <p className="text-[11px] text-slate-500 mt-0.5">
                                        {opt.help}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── 8. Cierre de vacantes ─────────────────────────────────── */}
            <div className={CARD}>
              <h2 className="text-lg font-bold text-[#0a1628] mb-1">
                Cierre de vacantes
              </h2>
              <p className="text-sm text-slate-500 mb-5">
                Configura cuando se cerraran las postulaciones para este empleo
              </p>

              <div className="space-y-3">
                {CLOSING_OPTIONS.map((opt) => {
                  const selected = closingMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setClosingMode(opt.id)}
                      className={`w-full text-left rounded-xl border-2 p-3 sm:p-4 transition-all ${
                        selected
                          ? "border-blue-600 bg-blue-50/60 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2">
                        <div
                          className={`sm:row-span-2 w-8 h-8 rounded-lg flex items-center justify-center ${
                            selected
                              ? "bg-[#0a1628] text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {opt.icon}
                        </div>
                        <span
                          className={`min-w-0 break-words font-semibold text-sm ${
                            selected ? "text-[#0a1628]" : "text-slate-800"
                          }`}
                        >
                          {opt.label}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            selected ? "border-blue-600" : "border-slate-300"
                          }`}
                        >
                          {selected && (
                            <div className="w-2 h-2 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <p className="col-span-3 min-w-0 text-xs text-slate-500 sm:col-span-2 sm:col-start-2">
                          {opt.help}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {/* Extra controls */}
                {closingMode === "MAX_APPLICANTS" && (
                  <div className="ml-2 pl-3 sm:ml-11 sm:pl-4 border-l-2 border-blue-200 pt-2 pb-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Numero maximo de postulantes
                    </label>
                    <input
                      type="number"
                      value={maxApplicants}
                      onChange={(e) => setMaxApplicants(e.target.value)}
                      min={1}
                      className="w-full min-w-0 h-10 px-3 rounded-lg border border-slate-300 bg-white text-[#0a1628] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {closingMode === "FIXED_DATE" && (
                  <div className="ml-2 pl-3 sm:ml-11 sm:pl-4 border-l-2 border-blue-200 pt-2 pb-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Fecha de cierre
                    </label>
                    <input
                      type="datetime-local"
                      value={closingDate}
                      onChange={(e) => setClosingDate(e.target.value)}
                      className="w-full min-w-0 h-10 px-3 rounded-lg border border-slate-300 bg-white text-[#0a1628] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ─── Validation errors ─────────────────────────────────────── */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700 mb-1">
                  Corrige los siguientes errores:
                </p>
                <ul className="list-disc list-inside text-sm text-red-600 space-y-0.5">
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ─── Action buttons ────────────────────────────────────────── */}
            {submitError && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  {submitError}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-800">
                  Puedes guardar el borrador y volver cuando tengas un plan activo
                  o publicaciones disponibles.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => router.push("/company/settings")}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1B3A6B] px-4 text-sm font-semibold text-white transition hover:bg-[#162f58]"
                  >
                    <Crown className="h-4 w-4" />
                    Actualizar ahora
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/company/settings")}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                  >
                    <CreditCard className="h-4 w-4" />
                    Comprar paquete
                  </button>
                </div>
              </div>
            )}

            {draftNotice && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">
                  {draftNotice}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => router.push("/company")}
                className="h-11 w-full rounded-xl px-4 text-slate-500 font-medium transition hover:text-slate-700 sm:h-12 sm:w-auto sm:px-6"
              >
                Cancelar
              </button>
              <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-2">
                <button
                  onClick={() => handleSubmit("DRAFT")}
                  disabled={isPending}
                  className="h-11 w-full rounded-xl border-2 border-blue-600 bg-white px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50 sm:h-12 sm:px-6"
                >
                  Guardar borrador
                </button>
                <button
                  onClick={() => handleSubmit("PUBLISHED")}
                  disabled={isPending || errors.length > 0}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0a1628] px-4 text-sm font-semibold text-white transition hover:bg-[#1a2a42] disabled:opacity-50 sm:h-12 sm:px-6"
                >
                  {isPending ? (
                    "Publicando..."
                  ) : (
                    <>
                      Publicar empleo
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ─── Right column - Preview ──────────────────────────────────── */}
          <div className="min-w-0 lg:col-span-1">
            <div className="lg:sticky lg:top-8 space-y-4">
              <div className={CARD}>
                <div className="flex items-center gap-2 mb-5">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Vista previa
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="break-words text-xl font-bold text-[#0a1628] leading-tight">
                    {preview.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="min-w-0 break-words">{preview.location}</span>
                  </div>

                  <span className="inline-block px-3 py-1 rounded-md bg-[#0a1628] text-white text-xs font-semibold">
                    {preview.type === "FULL_TIME"
                      ? "FULL TIME"
                      : preview.type === "PART_TIME"
                      ? "PART TIME"
                      : "FREELANCE"}
                  </span>

                  <hr className="border-slate-100" />

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Proceso de seleccion:
                    </p>
                    {selectionModeLabel ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {selectionMode === "MANUAL" && (
                          <Users className="w-3 h-3" />
                        )}
                        {selectionMode === "SEMI_AUTOMATED" && (
                          <Sparkles className="w-3 h-3" />
                        )}
                        {selectionMode === "FULLY_AUTOMATED" && (
                          <Bot className="w-3 h-3" />
                        )}
                        {selectionModeLabel}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        No configurado
                      </span>
                    )}
                  </div>

                  {selectionMode === "FULLY_AUTOMATED" && (
                    <>
                      <hr className="border-slate-100" />
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Configuracion de IA:
                        </p>
                        <div className="text-xs text-slate-600 space-y-1">
                          <p>
                            Screening:{" "}
                            <span className="font-medium">
                              {maxCandidatesForScreening || "-"} candidatos
                            </span>
                          </p>
                          <p>
                            Entrevista teorica:{" "}
                            <span className="font-medium">
                              {candidatesForTheoryInterview || "-"} candidatos
                            </span>
                          </p>
                          <p>
                            Puntaje minimo:{" "}
                            <span className="font-medium">{minimumScore}%</span>
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0a1628] text-white">
                  <Crown className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-[#0a1628]">
                    Actualiza tu plan
                  </h2>
                  <p className="text-sm text-slate-500">
                    La IA de seleccion no esta incluida en Free
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-4 sm:p-6">
              <p className="text-sm leading-6 text-slate-600">
                En el plan gratuito las postulaciones llegan a la empresa y el proceso queda en modo manual. Para activar filtros con IA, entrevistas automaticas y reportes inteligentes, elige un plan superior.
              </p>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                Free: 2 empleos por 30 dias, solicitudes manuales y sin automatizacion IA.
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectionMode("MANUAL");
                    setShowUpgradeModal(false);
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Usar manual
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/company/settings")}
                  className="w-full rounded-xl bg-[#0a1628] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#12233d]"
                >
                  Ver planes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant flotante */}
      <AiJobAssistant onApplySuggestion={handleAiSuggestion} />
    </div>
  );
}