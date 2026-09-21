// features/jobs/components/JobDetailModal.tsx
"use client";

import { X, MapPin, Clock, CheckCircle2, DollarSign } from "lucide-react";
import { useJobDetail } from "../hooks/useJobDetail";
import { useAppliedJobIds } from "../hooks/useAppliedJobIds";
import type { Job } from "../types/job.types";

interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
  onApply: (job: Job) => void;
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

export function JobDetailModal({ job, onClose, onApply }: JobDetailModalProps) {
  const { job: jobDetail } = useJobDetail(job.id);
  const { appliedJobIds } = useAppliedJobIds();
  const detail = jobDetail ?? job;
  const hasApplied = appliedJobIds.includes(detail.id);

  const companyName = detail.company?.tradeName || detail.company?.businessName || "Empresa";
  const typeLabel = JOB_TYPE_LABELS[detail.type] ?? detail.type;
  const typeColor = JOB_TYPE_COLORS[detail.type] ?? "bg-slate-600 text-white";

  const formatSalary = (min: number, max: number, currency: string) => {
    const symbol = currency === "PEN" ? "S/." : "$";
    return `${symbol} ${min.toLocaleString()} - ${symbol} ${max.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="flex w-full max-w-xl flex-col rounded-2xl bg-white shadow-xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900">Detalles del Empleo</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Job header */}
          <div className="flex items-start gap-3">
            {detail.company?.logoUrl ? (
              <img src={detail.company.logoUrl} alt={companyName}
                className="h-12 w-12 flex-shrink-0 rounded-xl object-cover border border-slate-100" />
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                {companyName.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-slate-900">{detail.title}</h3>
              <p className="text-sm text-slate-500">{companyName}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${typeColor}`}>
                  {typeLabel}
                </span>
                {detail.level && (
                  <span className="inline-flex items-center rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
                    {detail.level === "JUNIOR" ? "Junior" : detail.level === "MID" ? "Mid" : "Senior"}
                  </span>
                )}
                {detail.modality && (
                  <span className="inline-flex items-center rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
                    {detail.modality === "REMOTE" ? "Remoto" : detail.modality === "HYBRID" ? "Híbrido" : "Presencial"}
                  </span>
                )}
                {detail.location && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {detail.location}
                  </span>
                )}
                {detail.createdAt && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(detail.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Rango salarial */}
          {(detail.salaryMin > 0 || detail.salaryMax > 0) && (
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-5 py-4">
              <div>
                <p className="text-xs font-medium text-emerald-700">Rango Salarial</p>
                <p className="text-xl font-bold text-emerald-800 mt-0.5">
                  {formatSalary(detail.salaryMin, detail.salaryMax, detail.currency)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-400" strokeWidth={1.5} />
            </div>
          )}

          {/* Descripción */}
          {detail.description && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">Descripción del Puesto</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{detail.description}</p>
            </div>
          )}

          {/* Requisitos — solo si el backend los devuelve */}
          {detail.requirements && detail.requirements.trim() && (
            <div>
              <h4 className="mb-2.5 text-sm font-semibold text-slate-900">Requisitos</h4>
              <ul className="space-y-2">
                {detail.requirements
                  .split(/\n|•|-/)
                  .map((r) => r.trim())
                  .filter((r) => r.length > 0)
                  .map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#0EA5A0] mt-0.5" strokeWidth={2} />
                      {req}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Skills — solo si el backend los devuelve */}
          {detail.skills && detail.skills.length > 0 && (
            <div>
              <h4 className="mb-2.5 text-sm font-semibold text-slate-900">Habilidades Requeridas</h4>
              <div className="flex flex-wrap gap-2">
                {detail.skills.map((skill) => (
                  <span key={skill}
                    className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vacantes — solo si hay más de 1 */}
          {detail.vacancies && detail.vacancies > 1 && (
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-[#0EA5A0]" strokeWidth={2} />
              <p className="text-sm text-slate-700">
                <span className="font-semibold">{detail.vacancies}</span> vacantes disponibles
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-100 px-6 py-4 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Cerrar
          </button>
          {hasApplied ? (
            <span className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 py-2.5 text-sm font-semibold text-emerald-600">
              <CheckCircle2 className="w-4 h-4" /> Ya postulaste
            </span>
          ) : (
            <button type="button" onClick={() => onApply(detail)}
              className="flex-1 rounded-xl bg-[#1B3A6B] py-2.5 text-sm font-semibold text-white hover:bg-[#162f58] transition-colors">
              Postular a este empleo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Hoy";
  if (diffDays === 1) return "Hace 1 día";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return `Hace ${Math.floor(diffDays / 7)} semanas`;
}