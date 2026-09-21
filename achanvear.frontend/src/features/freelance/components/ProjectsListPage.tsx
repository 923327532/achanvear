// features/freelance/components/ProjectsListPage.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { freelanceApi } from "../api/freelanceApi";
import { profileApi } from "@/features/profile/api/profileApi";
import type { Project, Proposal } from "../types/freelance.types";
import {
  Plus,
  Search,
  FolderKanban,
  Users,
  Clock,
  DollarSign,
  CheckCircle2,
  Loader2,
  Eye,
  XCircle,
  MessageCircle,
  Rocket,
  FileText,
  Star,
  Check,
  X,
  Edit,
  PauseCircle,
  Play,
  Trash2,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBudget(amount: number) {
  return `S/. ${amount.toLocaleString("es-PE")}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "OPEN":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fef3c7] text-[#d97706] border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
          Recibiendo Propuestas
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#d1fae5] text-[#065f46] border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#065f46]" />
          En Progreso
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e2e8f0] text-[#475569] border border-slate-200">
          <CheckCircle2 className="w-3 h-3" />
          Completado
        </span>
      );
    case "PAUSED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
          <PauseCircle className="w-3 h-3" />
          Pausado
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
          <XCircle className="w-3 h-3" />
          Cancelado
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
          {status}
        </span>
      );
  }
}

// ─── Metric Card ───────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  valueColor,
  iconColor,
  bgColor = "bg-white",
  borderColor = "border-slate-200",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  valueColor: string;
  iconColor: string;
  bgColor?: string;
  borderColor?: string;
}) {
  return (
    <div className={`${bgColor} rounded-2xl ${borderColor} shadow-sm p-5 hover:shadow-md transition-shadow relative`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
        </div>
        <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={1.5} />
      </div>
    </div>
  );
}

// ─── Proposal Card (dentro del modal) ──────────────────────────────────────────

function ProposalCard({
  proposal,
  onSelect,
  isSelecting,
}: {
  proposal: Proposal;
  onSelect: () => void;
  isSelecting: boolean;
}) {
  const freelancerQuery = useQuery({
    queryKey: ["freelancer-profile", proposal.freelancerUserId],
    queryFn: () => profileApi.getProfileById(proposal.freelancerUserId),
    retry: false,
    enabled: !!proposal.freelancerUserId,
  });

  const freelancer = freelancerQuery.data;
  const freelancerName = freelancer?.headline || "Freelancer";
  const initials = getInitials(freelancerName);
  const skills = freelancer?.skills || [];
  const rating = freelancer?.reputationScore?.averageStars || 0;
  const totalProjects = freelancer?.reputationScore?.totalRatings || 0;

  const handleViewPortfolio = () => {
    if ((proposal as any).portfolioUrl) {
      window.open((proposal as any).portfolioUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("El freelancer no ha proporcionado un enlace a su portafolio.");
    }
  };

  const handleGoToChat = () => {
    window.location.href = `/company/chat?userId=${proposal.freelancerUserId}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{freelancerName}</span>
              <Check className="w-4 h-4 text-sky-500" />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-slate-700">{rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-slate-400">· {totalProjects} proyectos</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-emerald-600">
            {formatBudget(proposal.proposedBudget)}
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1 justify-end mt-0.5">
            <Clock className="w-3 h-3" />
            {proposal.estimatedDays} días
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Cover Letter
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">{proposal.coverLetter}</p>
      </div>

      {skills.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill.name}
                className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={handleGoToChat}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
        >
          <MessageCircle className="w-4 h-4" />
          Enviar Mensaje
        </button>
        <button
          onClick={handleViewPortfolio}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
        >
          <Eye className="w-4 h-4" />
          Ver Portafolio
        </button>
        <button
          onClick={onSelect}
          disabled={isSelecting}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1e3a8a] text-white text-sm font-semibold hover:bg-[#1e3a8a]/90 transition disabled:opacity-50"
        >
          {isSelecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Seleccionar Freelancer
        </button>
      </div>
    </div>
  );
}

// ─── Proposals Modal ───────────────────────────────────────────────────────────

function ProposalsModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  const acceptMutation = useMutation({
    mutationFn: (proposalId: string) =>
      freelanceApi.acceptProposal(project.id, proposalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-projects"] });
      onClose();
    },
  });

  const handleSelectFreelancer = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    acceptMutation.mutate(proposalId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col mx-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-[#0a1628]">Propuestas Recibidas</h2>
            <p className="text-sm text-slate-500 mt-0.5">{project.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {project.proposals.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">Aún no hay propuestas para este proyecto</p>
            </div>
          ) : (
            project.proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onSelect={() => handleSelectFreelancer(proposal.id)}
                isSelecting={acceptMutation.isPending && selectedProposalId === proposal.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Project Card ───────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onViewProposals,
}: {
  project: Project;
  onViewProposals: (project: Project) => void;
}) {
  const queryClient = useQueryClient();
  const currencySymbol = "S/.";

  const pauseMutation = useMutation({
    mutationFn: () => freelanceApi.pause(project.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["company-projects"] }),
  });

  const resumeMutation = useMutation({
    mutationFn: () => freelanceApi.resume(project.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["company-projects"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!window.confirm("Estas seguro de eliminar este proyecto? Se marcara como cancelado.")) {
        throw new Error("cancelado");
      }
      return freelanceApi.remove(project.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["company-projects"] }),
  });
  const companyName = project.companyName ?? null;
  const companyInitials = project.companyInitials ?? "EM";
  const companyRating = project.companyRating ?? 0;
  const publishedJobs = project.publishedJobsCount ?? 0;
  const proposalCount = project.proposalCount ?? project.proposals?.length ?? 0;

  const formatProjectBudget = () => {
    if (project.minBudget && project.maxBudget && project.maxBudget > project.minBudget) {
      return `${currencySymbol} ${Number(project.minBudget).toLocaleString("es-PE")} - ${currencySymbol} ${Number(project.maxBudget).toLocaleString("es-PE")}`;
    }
    return `${currencySymbol} ${Number(project.budget).toLocaleString("es-PE")}`;
  };

  const hasRating = companyRating > 0;
  const hasJobs = publishedJobs > 0;

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-sm w-full">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <h3 className="text-base font-bold text-[#0f172a]">{project.title}</h3>
          <StatusBadge status={project.status} />
        </div>
        <span className="shrink-0 text-sm font-bold text-emerald-600 whitespace-nowrap">
          {formatProjectBudget()}
        </span>
      </div>

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

      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-3">
        {project.description}
      </p>

      {project.skills && project.skills.length > 0 && (
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

      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
        <a
          href={`/company/projects/${project.id}`}
          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <Eye className="h-3 w-3" strokeWidth={1.5} />
          Ver
        </a>
        <a
          href={`/company/projects/${project.id}/edit`}
          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
        >
          <Edit className="h-3 w-3" strokeWidth={1.5} />
          Editar
        </a>
        {project.status === "PAUSED" ? (
          <button
            type="button"
            onClick={() => resumeMutation.mutate()}
            disabled={resumeMutation.isPending}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition-colors disabled:opacity-50"
          >
            <Play className="h-3 w-3" strokeWidth={1.5} />
            Reanudar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => pauseMutation.mutate()}
            disabled={pauseMutation.isPending}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-amber-600 border border-amber-200 hover:bg-amber-50 transition-colors disabled:opacity-50"
          >
            <PauseCircle className="h-3 w-3" strokeWidth={1.5} />
            Pausar
          </button>
        )}
        <button
          type="button"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
          Eliminar
        </button>
        {project.status === "OPEN" && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onViewProposals(project);
            }}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-[#0d9488] border border-[#0d9488]/30 hover:bg-[#0d9488]/5 transition-colors ml-auto"
          >
            <Users className="h-3 w-3" strokeWidth={1.5} />
            Propuestas ({proposalCount})
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <FolderKanban className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">Aún no tienes proyectos</h3>
      <p className="text-sm text-slate-500 mb-6">
        Publica tu primer proyecto freelance para recibir propuestas de profesionales
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 bg-[#1e3a8a] text-white font-semibold px-6 py-3 rounded-2xl hover:bg-[#1e3a8a]/90 transition-all shadow-sm"
      >
        <Plus className="w-5 h-5" />
        Publicar Proyecto
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export function ProjectsListPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(0);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(0);
  }, []);

  // Obtener proyectos (paginados)
  const projectsQuery = useQuery({
    queryKey: ["company-projects", searchQuery, statusFilter, currentPage],
    queryFn: () =>
      freelanceApi.getMyProjects({
        size: 10,
        page: currentPage,
        search: searchQuery || undefined,
        status: statusFilter || undefined,
      }),
    retry: false,
  });

  const projectsData = projectsQuery.data;
  const allProjects = projectsData?.items ?? [];
  const totalPages = projectsData?.totalPages ?? 0;

  const stats = useMemo(() => {
    const active = allProjects.filter(
      (p) => p.status === "OPEN" || p.status === "IN_PROGRESS"
    ).length;
    const newProposals = allProjects.reduce(
      (sum, p) => sum + (p.status === "OPEN" ? p.proposals?.length ?? 0 : 0),
      0
    );
    const completed = allProjects.filter((p) => p.status === "COMPLETED").length;
    const totalInvestment = allProjects
      .filter((p) => p.status === "COMPLETED" || p.status === "IN_PROGRESS")
      .reduce((sum, p) => sum + p.budget, 0);
    return { active, newProposals, completed, totalInvestment };
  }, [allProjects]);

  if (projectsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0a1628]">Proyectos Freelance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona tus proyectos y revisa propuestas de freelancers
          </p>
        </div>
        <Link
          href="/company/projects/create"
          className="inline-flex items-center gap-2 bg-[#1e3a8a] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#1e3a8a]/90 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Publicar Proyecto
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <MetricCard
          icon={Rocket}
          label="Proyectos Activos"
          value={stats.active}
          valueColor="text-slate-900"
          iconColor="text-slate-500"
          bgColor="bg-[#f1f5f9]"
        />
        <MetricCard
          icon={FileText}
          label="Propuestas Nuevas"
          value={stats.newProposals}
          valueColor="text-[#2563eb]"
          iconColor="text-[#2563eb]"
          bgColor="bg-[#eff6ff]"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Completados"
          value={stats.completed}
          valueColor="text-[#16a34a]"
          iconColor="text-[#16a34a]"
          bgColor="bg-[#f0fdf4]"
        />
        <MetricCard
          icon={DollarSign}
          label="Inversión Total"
          value={formatBudget(stats.totalInvestment)}
          valueColor="text-[#d97706]"
          iconColor="text-[#d97706]"
          bgColor="bg-[#fffbeb]"
          borderColor="border border-[#fde68a]"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar proyectos..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
        >
          <option value="">Todos los estados</option>
          <option value="OPEN">Recibiendo Propuestas</option>
          <option value="IN_PROGRESS">En Progreso</option>
          <option value="COMPLETED">Completados</option>
          <option value="CANCELLED">Cancelados</option>
        </select>
      </div>

      {allProjects.length === 0 ? (
        <EmptyState
          onCreate={() => (window.location.href = "/company/projects/create")}
        />
      ) : (
        <>
          <div className="space-y-4">
            {allProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewProposals={setSelectedProject}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition ${
                    currentPage === i
                      ? "bg-[#1e3a8a] text-white shadow-sm"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {selectedProject && (
        <ProposalsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}