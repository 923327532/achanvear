// features/freelance/components/ProjectCard.tsx
"use client";

import { CalendarDays, Clock, MessageCircle, Eye, Send, Star, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import type { Project, ProposalStatus } from "../types/freelance.types";

interface ProjectCardProps {
  project: Project;
  onViewDetail: (project: Project) => void;
  onPropose: (project: Project) => void;
  showProposalStatus?: boolean;
  // FIX (Mis Proyectos): muestra el estado del PROYECTO (En progreso, Completado…) en vez del estado de la propuesta.
  showProjectStatus?: boolean;
  // FIX (Propuestas Enviadas): si se entrega, la insignia "Aceptada" lleva a "Mis Proyectos".
  onGoToMyProjects?: () => void;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  PEN: "S/.",
  USD: "$",
};

const PROPOSAL_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  SUBMITTED: {
    label: "Enviada",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ACCEPTED: {
    label: "Aceptada",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Rechazada",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

const PROJECT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  OPEN: { label: "Abierto", className: "bg-amber-50 text-amber-700 border-amber-200" },
  IN_PROGRESS: { label: "En progreso", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  COMPLETED: { label: "Completado", className: "bg-slate-100 text-slate-600 border-slate-200" },
  PAUSED: { label: "Pausado", className: "bg-amber-50 text-amber-700 border-amber-200" },
  CANCELLED: { label: "Cancelado", className: "bg-red-50 text-red-700 border-red-200" },
};

function formatPublishedDate(dateStr?: string): string {
  if (!dateStr) return "Publicado recientemente";
  return `Publicado ${new Date(dateStr).toLocaleDateString("es-PE")}`;
}

export function ProjectCard({
  project,
  onViewDetail,
  onPropose,
  showProposalStatus,
  showProjectStatus,
  onGoToMyProjects,
}: ProjectCardProps) {
  const currencySymbol = CURRENCY_SYMBOLS[project.currency ?? "PEN"] ?? "S/.";
  const companyName = project.companyName ?? null;
  const companyInitials = project.companyInitials ?? "EM";
  const companyRating = project.companyRating ?? 0;
  const publishedJobs = project.publishedJobsCount ?? 0;
  const proposalCount = project.proposalCount ?? project.proposals?.length ?? 0;
  const projectStatus = PROJECT_STATUS_CONFIG[project.status] ?? {
    label: project.status,
    className: "bg-slate-50 text-slate-600 border-slate-200",
  };

  // Estado de la propuesta que muestra la insignia (la primera de la lista, como siempre).
  const firstProposalStatus: string | undefined = project.proposals?.[0]?.status;
  const proposalStatusConfig = firstProposalStatus ? PROPOSAL_STATUS_CONFIG[firstProposalStatus] : undefined;
  const proposalBadgeClass = `inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold border ${
    proposalStatusConfig?.className ?? "bg-slate-50 text-slate-600 border-slate-200"
  }`;
  const proposalBadgeContent = (
    <>
      {firstProposalStatus === "SUBMITTED" && <Send className="h-3.5 w-3.5" strokeWidth={2} />}
      {firstProposalStatus === "ACCEPTED" && <CheckCircle className="h-3.5 w-3.5" strokeWidth={2} />}
      {firstProposalStatus === "REJECTED" && <XCircle className="h-3.5 w-3.5" strokeWidth={2} />}
      {proposalStatusConfig?.label ?? firstProposalStatus}
    </>
  );

  // FIX (Propuestas Enviadas): una propuesta ya aceptada muestra solo la insignia "Aceptada" (sin "Ver detalles"):
  // el seguimiento del proyecto contratado está en la pestaña "Mis Proyectos".
  const isAcceptedProposal = !!showProposalStatus && !showProjectStatus && firstProposalStatus === "ACCEPTED";

  const formatBudget = () => {
    if (project.minBudget && project.maxBudget && project.maxBudget > project.minBudget) {
      return `${currencySymbol} ${Number(project.minBudget).toLocaleString("es-PE")} - ${currencySymbol} ${Number(project.maxBudget).toLocaleString("es-PE")}`;
    }
    return `${currencySymbol} ${Number(project.budget).toLocaleString("es-PE")}`;
  };

  const hasRating = companyRating > 0;
  const hasJobs = publishedJobs > 0;

  return (
    // RESPONSIVE: min-w-0 para que la tarjeta no desborde la columna de la grilla
    <div className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-sm w-full">

      {/* ── 1. Header: Title + Price ──
          RESPONSIVE: título y precio en una fila dejaban el título en ~60px a 284px. En celular el precio baja
          a su propia línea; desde sm vuelven a ir lado a lado. */}
      <div className="flex flex-col gap-1 mb-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h3 className="text-base font-bold text-[#0f172a] leading-tight flex-1 min-w-0 break-words">
          {project.title}
        </h3>
        <span className="shrink-0 text-sm font-bold text-emerald-600 whitespace-nowrap">
          {formatBudget()}
        </span>
      </div>

      {/* ── 2. Company Block ── */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a] text-xs font-bold text-white">
          {companyInitials}
        </div>
        <div className="min-w-0">
          {companyName ? (
            <p className="text-xs font-semibold text-slate-800 break-words">{companyName}</p>
          ) : (
            <p className="text-xs font-medium text-slate-400 italic">Empresa verificada</p>
          )}
          {(hasRating || hasJobs) && (
            <div className="flex flex-wrap items-center gap-1 mt-0.5">
              {hasRating && (
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold text-slate-600">{companyRating.toFixed(1)}</span>
                </div>
              )}
              {hasRating && hasJobs && <span className="text-xs text-slate-300">·</span>}
              {hasJobs && (
                <span className="text-xs text-slate-500">{publishedJobs} trabajos publicados</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Description ── */}
      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-3 break-words">
        {project.description}
      </p>

      {/* ── 4. Skills / Tags ── */}
      {project.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-full bg-[#0d9488]/10 px-2.5 py-0.5 text-xs font-semibold text-[#0d9488]"
            >
              {skill}
            </span>
          ))}
          {project.skills.length > 4 && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
              +{project.skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* ── 5. Metadata: Delivery + Proposals ── */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>Entrega en {project.estimatedDays} dias</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>{formatPublishedDate(project.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>{proposalCount} propuestas</span>
        </div>
      </div>

      {/* ── 6. Actions: View Details + Proposal Status / Propose ──
          RESPONSIVE: flex-wrap; a 284px "Ver detalles" + el estado no cabían en una fila y el estado se cortaba. */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        {!isAcceptedProposal && (
          <button
            type="button"
            onClick={() => onViewDetail(project)}
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
          >
            <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
            Ver detalles
          </button>
        )}
        {showProjectStatus ? (
          <div className="flex-1 flex justify-end">
            <span
              className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold border ${projectStatus.className}`}
            >
              {projectStatus.label}
            </span>
          </div>
        ) : showProposalStatus && project.proposals.length > 0 ? (
          <div className="flex-1 flex justify-end">
            {isAcceptedProposal && onGoToMyProjects ? (
              <button
                type="button"
                onClick={onGoToMyProjects}
                title="Ver en Mis Proyectos"
                aria-label="Aceptada: ver en Mis Proyectos"
                className={`${proposalBadgeClass} hover:bg-emerald-100 transition-colors`}
              >
                {proposalBadgeContent}
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            ) : (
              <span className={proposalBadgeClass}>{proposalBadgeContent}</span>
            )}
          </div>
        ) : project.hasApplied ? (
          <div className="flex-1 flex justify-end">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
              <CheckCircle className="h-3.5 w-3.5" strokeWidth={2} />
              Ya postulaste
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onPropose(project)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-xs font-bold text-white hover:opacity-90 transition-opacity shadow-sm"
          >
            <Send className="h-3.5 w-3.5" strokeWidth={2} />
            Postular
          </button>
        )}
      </div>

    </div>
  );
}