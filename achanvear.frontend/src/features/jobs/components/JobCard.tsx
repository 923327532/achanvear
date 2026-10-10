// features/jobs/components/JobCard.tsx
"use client";

import { useState } from "react";
import { MapPin, Clock, Building2, CheckCircle2 } from "lucide-react";
import type { Job } from "../types/job.types";
import { useAppliedJobIds } from "../hooks/useAppliedJobIds";
import { toProfileImageUrl } from "@/lib/mediaUrls";

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
  onViewDetail: (job: Job) => void;
}


const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "FULL TIME",
  PART_TIME: "PART TIME",
  FREELANCE: "FREELANCE",
  INTERNSHIP: "PRÁCTICAS",
};

const JOB_TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "bg-[#1B3A6B] text-white",
  PART_TIME: "bg-[#0EA5A0] text-white",
  FREELANCE: "bg-amber-500 text-white",
  INTERNSHIP: "bg-purple-600 text-white",
};

export function JobCard({ job, onApply, onViewDetail }: JobCardProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const { appliedJobIds } = useAppliedJobIds();
  const hasApplied = appliedJobIds.includes(job.id);

  const companyName = job.company?.tradeName || job.company?.businessName || "Empresa";
  const companyInitial = companyName.charAt(0).toUpperCase();
  const companyLogoUrl = toProfileImageUrl(job.company?.logoUrl);
  const typeLabel = JOB_TYPE_LABELS[job.type] ?? job.type;
  const typeColor = JOB_TYPE_COLORS[job.type] ?? "bg-slate-600 text-white";

  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min && !max) return null;
    const symbol = currency === "PEN" ? "S/." : "$";
    return `${symbol} ${min.toLocaleString()} - ${symbol} ${max.toLocaleString()}`;
  };

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);


  return (
    // RESPONSIVE: p-4 en celular, p-5 desde sm; min-w-0 para que la tarjeta no desborde la columna de la grilla
    <div className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm sm:p-5">
      {/* Header — empresa */}
      <div className="mb-3 flex items-start gap-3">
        {companyLogoUrl && !logoFailed ? (
          <img
            src={companyLogoUrl}
            alt={companyName}
            onError={() => setLogoFailed(true)}
            className="h-10 w-10 flex-shrink-0 rounded-lg object-cover border border-slate-100"
          />
        ) : (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
            {companyInitial}
          </div>
        )}
        <div className="min-w-0">
          {/* RESPONSIVE: el título puede ocupar hasta 2 líneas en vez de cortarse con "…" */}
          <h3 className="line-clamp-2 break-words text-sm font-semibold text-slate-900">{job.title}</h3>
          {/* RESPONSIVE: flex-wrap; la ubicación baja a otra línea en vez de cortar empresa y ubicación a la vez
              ("ALPESA GLOBAL P… • Re…" en la captura a 284px) */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500">
            <span className="break-words">{companyName}</span>
            {job.location && (
              <>
                <span>•</span>
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="break-words">{job.location}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Badges — tipo + nivel + modalidad */}
      <div className="mb-2.5 flex flex-wrap gap-1.5">
        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${typeColor}`}>
          {typeLabel}
        </span>
        {job.level && (
          <span className="inline-flex items-center rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
            {job.level === "JUNIOR" ? "Junior" : job.level === "MID" ? "Mid" : "Senior"}
          </span>
        )}
        {job.modality && (
          <span className="inline-flex items-center rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
            {job.modality === "REMOTE" ? "Remoto" : job.modality === "HYBRID" ? "Híbrido" : "Presencial"}
          </span>
        )}
      </div>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="inline-flex items-center rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="inline-flex items-center rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-500">
              +{job.skills.length - 3} más
            </span>
          )}
        </div>
      )}

      {/* Footer — salario + acciones */}
      {/* RESPONSIVE: flex-wrap + gap; en celular las acciones bajan a una segunda fila alineada a la derecha
          (antes "Ver detalles" se partía en 2 líneas y "Postular" quedaba apretado contra el salario) */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-2">
        <div className="min-w-0">
          {salary && (
            <p className="text-sm font-bold text-[#0EA5A0] break-words">{salary}</p>
          )}
          {job.createdAt && (
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>{formatTimeAgo(job.createdAt)}</span>
            </div>
          )}
        </div>
        <div className="ml-auto flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onViewDetail(job)}
            className="whitespace-nowrap text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Ver detalles
          </button>
          {hasApplied ? (
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Ya postulaste
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onApply(job)}
              className="whitespace-nowrap rounded-lg bg-[#1B3A6B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#162f58] transition-colors"
            >
              Postular
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

// FIX: "Hoy" aparecía para empleos creados el día de calendario anterior.
// La versión vieja medía horas transcurridas (diffMs / 24h) en vez de
// comparar fechas de calendario: un empleo creado ayer a las 11pm y visto
// hoy a la 1am solo tiene ~2 horas de diferencia real, así que
// Math.floor(2/24) = 0 → mostraba "Hoy" aunque ya era un día distinto en
// el calendario. Ahora se comparan las fechas normalizadas a medianoche,
// que es como un humano espera que funcione "Hoy"/"Ayer".
function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.round((nowDay.getTime() - dateDay.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Hoy";
  if (diffDays === 1) return "Hace 1 día";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return `Hace ${Math.floor(diffDays / 30)} meses`;
}