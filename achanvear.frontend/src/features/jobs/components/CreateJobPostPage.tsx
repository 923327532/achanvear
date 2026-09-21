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
} from "lucide-react";
import { useCreateJobPost } from "../hooks/useCreateJobPost";
import AiJobAssistant from "./AiJobAssistant";
import type { JobType, SelectionMode, JobAiSuggestion } from "../types/job.types";

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

export default function CreateJobPostPage() {
  const router = useRouter();
  const { mutate: createJob, isPending } = useCreateJobPost();

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

  // ─── Automation config (only for FULLY_AUTOMATED) ────────────────────────
  const [maxCandidatesForScreening, setMaxCandidatesForScreening] = useState("50");
  const [candidatesForTheoryInterview, setCandidatesForTheoryInterview] = useState("10");
  const [minimumScore, setMinimumScore] = useState(75);

  // ─── Closing mode ────────────────────────────────────────────────────────
  const [closingMode, setClosingMode] = useState<"MAX_APPLICANTS" | "FIXED_DATE" | "CONTINUOUS">("CONTINUOUS");
  const [maxApplicants, setMaxApplicants] = useState("50");
  const [closingDate, setClosingDate] = useState("");

  // ─── Notification timing ─────────────────────────────────────────────────
  const [notificationTiming, setNotificationTiming] = useState<"IMMEDIATE" | "AFTER_2_HOURS" | "AFTER_CLOSING">("IMMEDIATE");

  // ─── Validation ──────────────────────────────────────────────────────────
  const errors = useMemo(() => {
    const errs: string[] = [];
    if (!title.trim()) errs.push("El titulo del puesto es requerido");
    if (!description.trim()) errs.push("La descripcion es requerida");
    if (!remote && !location.trim()) errs.push("La ubicacion es requerida");
    if (!selectionMode) errs.push("Debes seleccionar un modo de seleccion");
    if (
      selectionMode === "FULLY_AUTOMATED" &&
      (!maxCandidatesForScreening || Number(maxCandidatesForScreening) < 1)
    ) {
      errs.push("El maximo de candidatos para screening debe ser al menos 1");
    }
    if (
      selectionMode === "FULLY_AUTOMATED" &&
      (!candidatesForTheoryInterview || Number(candidatesForTheoryInterview) < 1)
    ) {
      errs.push("Los candidatos para entrevista teorica deben ser al menos 1");
    }
    if (salaryMin && salaryMax && Number(salaryMin) > Number(salaryMax)) {
      errs.push("El salario minimo no puede ser mayor al maximo");
    }
    return errs;
  }, [title, description, remote, location, selectionMode, maxCandidatesForScreening, candidatesForTheoryInterview, salaryMin, salaryMax]);

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

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = (status: "PUBLISHED" | "DRAFT") => {
    if (status === "PUBLISHED" && errors.length > 0) return;

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
        onError: () => {
          // Error is handled by react-query
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Back button */}
        <button
          onClick={() => router.push("/company")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
          <span className="text-sm font-medium">Volver al inicio</span>
        </button>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#0a1628] mb-8">
          Publicar nueva oferta laboral
        </h1>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── Left column - Form ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Title */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <label className="block text-sm font-semibold text-[#0a1628] mb-2">
                Titulo del puesto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Desarrollador Full Stack Senior"
                className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-white text-[#0a1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base"
              />
            </div>

            {/* 2. Job Type */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <label className="block text-sm font-semibold text-[#0a1628] mb-3">
                Tipo de empleo <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
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

            {/* 3. Location */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <label className="block text-sm font-semibold text-[#0a1628] mb-2">
                Ubicacion <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Lima, Peru"
                  disabled={remote}
                  className={`flex-1 h-12 px-4 rounded-lg border bg-white text-[#0a1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base ${
                    remote
                      ? "border-slate-200 bg-slate-50 text-slate-400"
                      : "border-slate-300"
                  }`}
                />
                <label className="flex items-center gap-2 h-12 px-4 rounded-lg border border-slate-300 bg-white cursor-pointer select-none shrink-0">
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
            </div>

            {/* 4. Salary Range */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <label className="block text-sm font-semibold text-[#0a1628] mb-2">
                Rango salarial (S/.)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="Minimo"
                  disabled={hideSalary}
                  className={`flex-1 h-12 px-4 rounded-lg border bg-white text-[#0a1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base ${
                    hideSalary
                      ? "border-slate-200 bg-slate-50 text-slate-400"
                      : "border-slate-300"
                  }`}
                />
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="Maximo"
                  disabled={hideSalary}
                  className={`flex-1 h-12 px-4 rounded-lg border bg-white text-[#0a1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base ${
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
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <label className="block text-sm font-semibold text-[#0a1628] mb-2">
                Descripcion del puesto <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe las responsabilidades del puesto, el equipo con el que trabajara y el contexto de la posicion..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-[#0a1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base resize-none"
              />
            </div>

            {/* 6. Requirements */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <label className="block text-sm font-semibold text-[#0a1628] mb-2">
                Requisitos
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Lista los requisitos tecnicos, experiencia necesaria, formacion academica, etc..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-[#0a1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base resize-none"
              />
            </div>

            {/* ─── 7. Configura el proceso de seleccion ──────────────────── */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
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
                        onClick={() => setSelectionMode(card.id)}
                        className={`w-full text-left rounded-xl border-2 p-5 transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/60 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-[#0a1628] text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {card.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-semibold text-base ${
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
                            </div>
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                              {card.description}
                            </p>
                            {card.secondaryBadge && (
                              <span className="inline-block mt-2 text-[11px] text-slate-400 font-medium">
                                {card.secondaryBadge}
                              </span>
                            )}
                          </div>

                          {/* Radio indicator */}
                          <div
                            className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                              isSelected
                                ? "border-blue-600"
                                : "border-slate-300"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* ─── Extra controls for FULLY_AUTOMATED ──────────── */}
                      {isFullyAuto && (
                        <div className="mt-3 ml-14 pl-4 border-l-2 border-blue-200 space-y-4 py-2">
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
                              className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-[#0a1628] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                              className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-[#0a1628] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                              <button
                                type="button"
                                onClick={() => setNotificationTiming("IMMEDIATE")}
                                className={`w-full text-left rounded-lg border-2 p-3 transition-all ${
                                  notificationTiming === "IMMEDIATE"
                                    ? "border-blue-600 bg-blue-50/60"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                    notificationTiming === "IMMEDIATE" ? "border-blue-600" : "border-slate-300"
                                  }`}>
                                    {notificationTiming === "IMMEDIATE" && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                  </div>
                                  <div>
                                    <span className={`text-xs font-semibold ${notificationTiming === "IMMEDIATE" ? "text-[#0a1628]" : "text-slate-700"}`}>
                                      Al instante
                                    </span>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      El candidato recibe la notificacion apenas se evalua su perfil
                                    </p>
                                  </div>
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => setNotificationTiming("AFTER_2_HOURS")}
                                className={`w-full text-left rounded-lg border-2 p-3 transition-all ${
                                  notificationTiming === "AFTER_2_HOURS"
                                    ? "border-blue-600 bg-blue-50/60"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                    notificationTiming === "AFTER_2_HOURS" ? "border-blue-600" : "border-slate-300"
                                  }`}>
                                    {notificationTiming === "AFTER_2_HOURS" && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                  </div>
                                  <div>
                                    <span className={`text-xs font-semibold ${notificationTiming === "AFTER_2_HOURS" ? "text-[#0a1628]" : "text-slate-700"}`}>
                                      En 2 horas
                                    </span>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      Las notificaciones se agrupan y envian cada 2 horas
                                    </p>
                                  </div>
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => setNotificationTiming("AFTER_CLOSING")}
                                className={`w-full text-left rounded-lg border-2 p-3 transition-all ${
                                  notificationTiming === "AFTER_CLOSING"
                                    ? "border-blue-600 bg-blue-50/60"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                    notificationTiming === "AFTER_CLOSING" ? "border-blue-600" : "border-slate-300"
                                  }`}>
                                    {notificationTiming === "AFTER_CLOSING" && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                  </div>
                                  <div>
                                    <span className={`text-xs font-semibold ${notificationTiming === "AFTER_CLOSING" ? "text-[#0a1628]" : "text-slate-700"}`}>
                                      Al cierre de postulaciones
                                    </span>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      Todos los candidatos reciben su resultado cuando se cierren las postulaciones
                                    </p>
                                  </div>
                                </div>
                              </button>
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
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#0a1628] mb-1">
                Cierre de vacantes
              </h2>
              <p className="text-sm text-slate-500 mb-5">
                Configura cuando se cerraran las postulaciones para este empleo
              </p>

              <div className="space-y-3">
                {/* CONTINUOUS */}
                <button
                  type="button"
                  onClick={() => setClosingMode("CONTINUOUS")}
                  className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                    closingMode === "CONTINUOUS"
                      ? "border-blue-600 bg-blue-50/60 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      closingMode === "CONTINUOUS" ? "bg-[#0a1628] text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      <span className="text-sm font-bold">∞</span>
                    </div>
                    <div className="flex-1">
                      <span className={`font-semibold text-sm ${closingMode === "CONTINUOUS" ? "text-[#0a1628]" : "text-slate-800"}`}>
                        Siempre abierto
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Las postulaciones estaran abiertas hasta que la empresa decida cerrarlas manualmente
                      </p>
                    </div>
                    <div className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${
                      closingMode === "CONTINUOUS" ? "border-blue-600" : "border-slate-300"
                    }`}>
                      {closingMode === "CONTINUOUS" && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                  </div>
                </button>

                {/* MAX_APPLICANTS */}
                <button
                  type="button"
                  onClick={() => setClosingMode("MAX_APPLICANTS")}
                  className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                    closingMode === "MAX_APPLICANTS"
                      ? "border-blue-600 bg-blue-50/60 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      closingMode === "MAX_APPLICANTS" ? "bg-[#0a1628] text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className={`font-semibold text-sm ${closingMode === "MAX_APPLICANTS" ? "text-[#0a1628]" : "text-slate-800"}`}>
                        Por maximo de postulantes
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Las postulaciones se cierran automaticamente al alcanzar el numero maximo de postulantes
                      </p>
                    </div>
                    <div className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${
                      closingMode === "MAX_APPLICANTS" ? "border-blue-600" : "border-slate-300"
                    }`}>
                      {closingMode === "MAX_APPLICANTS" && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                  </div>
                </button>

                {/* FIXED_DATE */}
                <button
                  type="button"
                  onClick={() => setClosingMode("FIXED_DATE")}
                  className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                    closingMode === "FIXED_DATE"
                      ? "border-blue-600 bg-blue-50/60 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      closingMode === "FIXED_DATE" ? "bg-[#0a1628] text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      <span className="text-sm font-bold">📅</span>
                    </div>
                    <div className="flex-1">
                      <span className={`font-semibold text-sm ${closingMode === "FIXED_DATE" ? "text-[#0a1628]" : "text-slate-800"}`}>
                        Por fecha limite
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Las postulaciones se cierran en una fecha especifica que tu elijas
                      </p>
                    </div>
                    <div className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${
                      closingMode === "FIXED_DATE" ? "border-blue-600" : "border-slate-300"
                    }`}>
                      {closingMode === "FIXED_DATE" && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                  </div>
                </button>

                {/* Extra controls */}
                {closingMode === "MAX_APPLICANTS" && (
                  <div className="ml-11 pl-4 border-l-2 border-blue-200 pt-2 pb-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Numero maximo de postulantes
                    </label>
                    <input
                      type="number"
                      value={maxApplicants}
                      onChange={(e) => setMaxApplicants(e.target.value)}
                      min={1}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-[#0a1628] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {closingMode === "FIXED_DATE" && (
                  <div className="ml-11 pl-4 border-l-2 border-blue-200 pt-2 pb-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Fecha de cierre
                    </label>
                    <input
                      type="datetime-local"
                      value={closingDate}
                      onChange={(e) => setClosingDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-[#0a1628] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => router.push("/company")}
                className="h-12 px-6 rounded-xl text-slate-500 font-medium hover:text-slate-700 transition"
              >
                Cancelar
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSubmit("DRAFT")}
                  disabled={isPending}
                  className="h-12 px-8 rounded-xl border-2 border-blue-600 bg-white text-blue-700 font-semibold hover:bg-blue-50 transition disabled:opacity-50"
                >
                  Guardar borrador
                </button>
                <button
                  onClick={() => handleSubmit("PUBLISHED")}
                  disabled={isPending || errors.length > 0}
                  className="h-12 px-8 rounded-xl bg-[#0a1628] text-white font-semibold hover:bg-[#1a2a42] transition disabled:opacity-50 flex items-center gap-2"
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
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Vista previa
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#0a1628] leading-tight">
                    {preview.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{preview.location}</span>
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

      {/* AI Assistant flotante */}
      <AiJobAssistant onApplySuggestion={handleAiSuggestion} />
    </div>
  );
}
