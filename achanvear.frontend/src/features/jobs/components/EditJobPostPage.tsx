// features/jobs/components/EditJobPostPage.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Eye,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useJobDetail } from "../hooks/useJobDetail";
import { useUpdateJobPost } from "../hooks/useUpdateJobPost";
import type { JobType } from "../types/job.types";

// FIX: se quitó por completo la sección "Configura el proceso de selección"
// (y con ella selectionMode, maxCandidatesForScreening,
// candidatesForTheoryInterview, minimumScore). Confirmado en Swagger que
// PUT /jobs/{id} solo acepta title, description, location, type, salaryMin,
// salaryMax, currency y vacancies — el backend ignora silenciosamente
// cualquier otro campo. Mostrar un control de edición que nunca se guarda es
// peor que no mostrarlo: el modo de selección solo se define al CREAR el
// empleo (CreateJobPostPage.tsx), no se puede cambiar después por ahora.

type JobTypeOption = {
  label: string;
  value: JobType;
};

const JOB_TYPES: JobTypeOption[] = [
  { label: "FULL TIME", value: "FULL_TIME" },
  { label: "PART TIME", value: "PART_TIME" },
  { label: "FREELANCE", value: "FREELANCE" },
];

export default function EditJobPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { job, isLoading: loadingJob, isError } = useJobDetail(id);
  const { mutate: updateJob, isPending } = useUpdateJobPost();

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

  // ─── Cargar datos del job cuando esté disponible ─────────────────────────
  useEffect(() => {
    if (job) {
      setTitle(job.title);
      setType(job.type);
      setLocation(job.location === "Remoto" ? "" : job.location);
      setRemote(job.location === "Remoto");
      setSalaryMin(job.salaryMin > 0 ? String(job.salaryMin) : "");
      setSalaryMax(job.salaryMax > 0 ? String(job.salaryMax) : "");
      setHideSalary(job.salaryMin === 0 && job.salaryMax === 0);
      setDescription(job.description);
      setRequirements(job.requirements ?? "");
    }
  }, [job]);

  // ─── Validation ──────────────────────────────────────────────────────────
  const errors = useMemo(() => {
    const errs: string[] = [];
    if (!title.trim()) errs.push("El titulo del puesto es requerido");
    if (!description.trim()) errs.push("La descripcion es requerida");
    if (!remote && !location.trim()) errs.push("La ubicacion es requerida");
    if (salaryMin && salaryMax && Number(salaryMin) > Number(salaryMax)) {
      errs.push("El salario minimo no puede ser mayor al maximo");
    }
    return errs;
  }, [title, description, remote, location, salaryMin, salaryMax]);

  // ─── Preview ─────────────────────────────────────────────────────────────
  const displayLocation = remote ? "Trabajo Remoto" : location || "No especificada";

  const preview = useMemo(
    () => ({
      title: title || "Titulo del puesto",
      location: displayLocation,
      type,
    }),
    [title, displayLocation, type]
  );

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (errors.length > 0) return;

    updateJob(
      {
        id,
        payload: {
          title: title.trim(),
          description: description.trim(),
          location: remote ? "Remoto" : location.trim() || "No especificada",
          type,
          salaryMin: hideSalary ? 0 : Number(salaryMin) || 0,
          salaryMax: hideSalary ? 0 : Number(salaryMax) || 0,
          currency: "PEN",
          vacancies: 1,
        },
      },
      {
        onSuccess: () => {
          router.push("/company");
        },
      }
    );
  };

  // ─── Loading state ───────────────────────────────────────────────────────
  if (loadingJob) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Cargando publicacion...</p>
        </div>
      </div>
    );
  }

  // ─── Error state ─────────────────────────────────────────────────────────
  if (isError || !job) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] grid place-items-center">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-4">
            No se pudo cargar la publicacion. Verifica que exista o intenta nuevamente.
          </p>
          <button
            onClick={() => router.push("/company")}
            className="text-sm text-blue-600 hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-[#0a1628] mb-2">
          Editar oferta laboral
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          El modo de selección y la configuración de IA se definen solo al crear el empleo y no pueden modificarse después.
        </p>

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
                  onClick={handleSubmit}
                  disabled={isPending || errors.length > 0}
                  className="h-12 px-8 rounded-xl bg-[#0a1628] text-white font-semibold hover:bg-[#1a2a42] transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Guardar cambios
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ─── Right column - Preview ──────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}