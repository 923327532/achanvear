// features/freelance/components/ProjectDetailModal.tsx
"use client";

import {
  X,
  Clock,
  MessageCircle,
  Star,
  DollarSign,
  CheckCircle2,
  ShieldCheck,
  Tag,
} from "lucide-react";
import type { Project } from "../types/freelance.types";

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
  onPropose: (project: Project) => void;
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Abierto",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-emerald-100 text-emerald-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-red-100 text-red-600",
};

// ─── Sub-componente: item con checkmark teal ────────────────────────────────
function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle2
        className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0EA5A0]"
        strokeWidth={2}
      />
      <span className="text-sm text-slate-600 leading-snug">{text}</span>
    </li>
  );
}

// ────────────────────────────────────────────────────────────────────────────

export function ProjectDetailModal({
  project,
  onClose,
  onPropose,
}: ProjectDetailModalProps) {
  // Datos del cliente (con fallbacks)
  const companyName     = project.companyName ?? null;
  const companyInitials = project.companyInitials ?? (companyName ? companyName.slice(0, 2).toUpperCase() : "CL");
  const companyRating   = project.companyRating ?? 0;
  const publishedJobs   = project.publishedJobsCount ?? 0;
  const hasRating       = companyRating > 0;
  const hasJobs         = publishedJobs > 0;
  const hasClientMeta   = hasRating || hasJobs;

  const skills       = project.skills ?? [];
  const requirements = (project as any).requirements as string[] | undefined ?? [];
  const deliverables = (project as any).deliverables as string[] | undefined ?? [];

  const proposalCount = project.proposalCount ?? project.proposals?.length ?? 0;

  const formatBudget = (min: number, max?: number) => {
    if (max && max > min)
      return `S/. ${min.toLocaleString()} - S/. ${max.toLocaleString()}`;
    return `S/. ${min.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="flex w-full max-w-xl flex-col rounded-2xl bg-white shadow-xl max-h-[90vh]">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900">
            Detalles del Proyecto
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Contenido scrollable ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* 1 · Título + badge de estado */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {project.title}
            </h3>
            <span
              className={`flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                STATUS_COLORS[project.status] ?? "bg-slate-100 text-slate-600"
              }`}
            >
              {STATUS_LABELS[project.status] ?? project.status}
            </span>
          </div>

          {/* 2 · Info del cliente */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
              {companyInitials}
            </div>
            <div>
              {companyName ? (
                <p className="text-sm font-semibold text-slate-800">{companyName}</p>
              ) : (
                <p className="text-sm font-medium text-slate-400 italic">Empresa verificada</p>
              )}
              {hasClientMeta && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  {hasRating && (
                    <>
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-slate-700">{companyRating}</span>
                    </>
                  )}
                  {hasRating && hasJobs && <span>•</span>}
                  {hasJobs && <span>{publishedJobs} proyectos publicados</span>}
                </div>
              )}
            </div>
          </div>

          {/* 3 · Chips: categoría + entrega + propuestas */}
          <div className="flex flex-wrap items-center gap-2">
            {project.category && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                <Tag className="h-3 w-3" />
                {project.category}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
              <Clock className="h-3 w-3" />
              Entrega en {project.estimatedDays} días
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
              <MessageCircle className="h-3 w-3" />
              {proposalCount} propuestas
            </span>
          </div>

          {/* 4 · Presupuesto */}
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-5 py-4">
            <div>
              <p className="text-xs font-medium text-emerald-700">
                Presupuesto del Proyecto
              </p>
              <p className="text-xl font-bold text-emerald-800 mt-0.5">
                {formatBudget(project.minBudget ?? project.budget, project.maxBudget ?? undefined)}
              </p>
            </div>
            <DollarSign
              className="h-8 w-8 text-emerald-400"
              strokeWidth={1.5}
            />
          </div>

          {/* 5 · Descripción */}
          {project.description && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">
                Descripción del Proyecto
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {project.description}
              </p>
            </div>
          )}

          {/* 6 · Requisitos */}
          {requirements.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-900">
                Requisitos
              </h4>
              <ul className="space-y-2">
                {requirements.map((req, i) => (
                  <CheckItem key={i} text={req} />
                ))}
              </ul>
            </div>
          )}

          {/* 7 · Habilidades requeridas */}
          {skills.length > 0 && (
            <div>
              <h4 className="mb-2.5 text-sm font-semibold text-slate-900">
                Habilidades Requeridas
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-md border border-[#0EA5A0]/30 bg-[#0EA5A0]/10 px-2.5 py-0.5 text-xs font-medium text-[#0EA5A0]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 8 · Entregables */}
          {deliverables.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-900">
                Entregables
              </h4>
              <ul className="space-y-2">
                {deliverables.map((item, i) => (
                  <CheckItem key={i} text={item} />
                ))}
              </ul>
            </div>
          )}

          {/* 9 · Hitos del proyecto (si el backend los devuelve) */}
          {project.milestones && project.milestones.length > 0 && (
            <div>
              <h4 className="mb-2.5 text-sm font-semibold text-slate-900">
                Hitos del Proyecto
              </h4>
              <div className="space-y-2">
                {project.milestones.map((milestone, i) => (
                  <div
                    key={milestone.id}
                    className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
                  >
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#1B3A6B] text-[10px] font-bold text-white mt-0.5">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800">
                        {milestone.title}
                      </p>
                      {milestone.description && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-xs font-bold text-[#0EA5A0]">
                      S/. {milestone.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10 · Banner Escrow Protegido */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500"
              strokeWidth={1.75}
            />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Sistema de Escrow Protegido
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
                El pago del cliente estará retenido en escrow hasta que completes
                y entregues el proyecto según lo acordado.
              </p>
            </div>
          </div>

        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="flex gap-3 border-t border-slate-100 px-6 py-4 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
          {project.status === "OPEN" && !project.hasApplied && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onPropose(project);
              }}
              className="flex-1 rounded-xl bg-[#1B3A6B] py-2.5 text-sm font-semibold text-white hover:bg-[#16305a] transition-colors"
            >
              Enviar Propuesta
            </button>
          )}
          {project.hasApplied && (
            <div className="flex-1 flex items-center justify-center rounded-xl bg-blue-50 border border-blue-200 py-2.5 text-sm font-semibold text-blue-700">
              <CheckCircle2 className="h-4 w-4 mr-2" strokeWidth={2} />
              Ya postulaste
            </div>
          )}
        </div>

      </div>
    </div>
  );
}