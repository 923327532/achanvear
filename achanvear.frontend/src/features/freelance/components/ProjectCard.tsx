// features/freelance/components/ProjectCard.tsx
"use client";

import { Clock, MessageCircle, Eye, Send, Star, CheckCircle, Clock as ClockIcon, XCircle } from "lucide-react";
import type { Project, ProposalStatus } from "../types/freelance.types";

interface ProjectCardProps {
  project: Project;
  onViewDetail: (project: Project) => void;
  onPropose: (project: Project) => void;
  showProposalStatus?: boolean;
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

export function ProjectCard({ project, onViewDetail, onPropose, showProposalStatus }: ProjectCardProps) {
  const currencySymbol = CURRENCY_SYMBOLS[project.currency ?? "PEN"] ?? "S/.";
  const companyName = project.companyName ?? null;
  const companyInitials = project.companyInitials ?? "EM";
  const companyRating = project.companyRating ?? 0;
  const publishedJobs = project.publishedJobsCount ?? 0;
  const proposalCount = project.proposalCount ?? project.proposals?.length ?? 0;

  const formatBudget = () => {
    if (project.minBudget && project.maxBudget && project.maxBudget > project.minBudget) {
      return `${currencySymbol} ${Number(project.minBudget).toLocaleString("es-PE")} - ${currencySymbol} ${Number(project.maxBudget).toLocaleString("es-PE")}`;
    }
    return `${currencySymbol} ${Number(project.budget).toLocaleString("es-PE")}`;
  };

  const hasRating = companyRating > 0;
  const hasJobs = publishedJobs > 0;

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-sm w-full">

      {/* ── 1. Header: Title + Price ── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-bold text-[#0f172a] leading-tight flex-1 min-w-0">
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
            <p className="text-xs font-semibold text-slate-800">{companyName}</p>
          ) : (
            <p className="text-xs font-medium text-slate-400 italic">Empresa verificada</p>
          )}
          {(hasRating || hasJobs) && (
            <div className="flex items-center gap-1 mt-0.5">
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
      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-3">
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>Entrega en {project.estimatedDays} dias</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>{proposalCount} propuestas</span>
        </div>
      </div>

      {/* ── 6. Actions: View Details + Proposal Status / Propose ── */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onViewDetail(project)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
        >
          <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
          Ver detalles
        </button>
        {showProposalStatus && project.proposals.length > 0 ? (
          <div className="flex-1 flex justify-end">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                PROPOSAL_STATUS_CONFIG[project.proposals[0].status]?.className ?? "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              {project.proposals[0].status === "SUBMITTED" && <Send className="h-3.5 w-3.5" strokeWidth={2} />}
              {project.proposals[0].status === "ACCEPTED"  && <CheckCircle className="h-3.5 w-3.5" strokeWidth={2} />}
              {project.proposals[0].status === "REJECTED"  && <XCircle className="h-3.5 w-3.5" strokeWidth={2} />}
              {PROPOSAL_STATUS_CONFIG[project.proposals[0].status]?.label ?? project.proposals[0].status}
            </span>
          </div>
        ) : project.hasApplied ? (
          <div className="flex-1 flex justify-end">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
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
