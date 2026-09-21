// features/jobs/components/JobsManagementPage.tsx
"use client";

import { useState, useMemo } from "react";
import { useProtectedRoute } from "@/shared/hooks/useProtectedRoute";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../api/jobApi";
import type { Job } from "../types/job.types";
import { HiringStatsCards } from "./HiringStatsCards";
import {
  Plus,
  Search,
  MapPin,
  Clock,
  Eye,
  Pencil,
  Play,
  Pause,
  XCircle,
  Copy,
  Loader2,
  Briefcase,
  Sparkles,
  CalendarDays,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  switch (status) {
    case "PUBLISHED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Activa
        </span>
      );
    case "SUSPENDED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Pausada
        </span>
      );
    case "CLOSED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Finalizada
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
          {status}
        </span>
      );
  }
}

function getSelectionModeBadge(mode?: string) {
  switch (mode) {
    case "IA":
    case "AI":
    case "AUTOMATED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          <Sparkles className="w-3 h-3" />
          Automatización Achanvear (IA)
        </span>
      );
    case "SEMI":
    case "SEMI_AUTOMATED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          Semiautomatizado
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
          Manual
        </span>
      );
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeDate(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem.`;
  return formatDate(dateStr);
}

function getJobTypeIcon(type?: string) {
  switch (type) {
    case "FULL_TIME": return "Empleo Fijo";
    case "PART_TIME": return "Medio Tiempo";
    case "FREELANCE": return "Freelance";
    case "CONTRACT": return "Contrato";
    case "INTERNSHIP": return "Prácticas";
    default: return type || "Empleo";
  }
}

// ─── Job Card ──────────────────────────────────────────────────────────────────

function JobCard({
  job,
  actionLoading,
  onViewApplicants,
  onChangeStatus,
  onDelete,
  onDuplicate,
}: {
  job: Job;
  actionLoading: string | null;
  onViewApplicants: (jobId: string) => void;
  onChangeStatus: (jobId: string, newStatus: string) => void;
  onDelete: (jobId: string) => void;
  onDuplicate: (jobId: string) => void;
}) {
  const isLoadingAction = actionLoading === job.id;
  const totalApps = job.applications?.length ?? 0;
  const filteredByAI = job.applications?.filter((a) => a.status === "REVIEWING").length ?? 0;
  const finalists = job.applications?.filter((a) => a.status === "ACCEPTED").length ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div className="p-6">
        {/* Fila superior: Info + Acciones */}
        <div className="flex items-start justify-between gap-4">
          {/* Lado izquierdo - Información */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
              {getStatusBadge(job.status || "")}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" strokeWidth={1.5} />
                {getJobTypeIcon(job.type)}
              </span>
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {job.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" strokeWidth={1.5} />
                {formatRelativeDate(job.createdAt)}
              </span>
            </div>

            {/* Badge IA */}
            <div className="mt-3">
              {getSelectionModeBadge(job.type)}
            </div>
          </div>

          {/* Lado derecho - Acciones */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={() => onViewApplicants(job.id)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1e3a8a] bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all"
            >
              <Eye className="w-4 h-4" strokeWidth={1.5} />
              Ver Postulantes
            </button>

            <div className="flex items-center gap-1">
              <a
                href={`/company/jobs/${job.id}/edit`}
                className="p-1.5 text-slate-400 hover:text-[#1e3a8a] hover:bg-slate-100 rounded-lg transition"
                title="Editar"
              >
                <Pencil className="w-4 h-4" strokeWidth={1.5} />
              </a>

              {job.status === "SUSPENDED" && (
                <button
                  onClick={() => onChangeStatus(job.id, "PUBLISHED")}
                  disabled={isLoadingAction}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                  title="Reactivar"
                >
                  {isLoadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              )}

              {job.status === "PUBLISHED" && (
                <button
                  onClick={() => onChangeStatus(job.id, "SUSPENDED")}
                  disabled={isLoadingAction}
                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                  title="Pausar"
                >
                  {isLoadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              )}

              {job.status !== "CLOSED" && (
                <button
                  onClick={() => onChangeStatus(job.id, "CLOSED")}
                  disabled={isLoadingAction}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Cerrar Vacante"
                >
                  {isLoadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              )}

              <button
                onClick={() => onDuplicate(job.id)}
                disabled={isLoadingAction}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                title="Duplicar"
              >
                <Copy className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <button
                onClick={() => onDelete(job.id)}
                disabled={isLoadingAction}
                className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                title="Eliminar"
              >
                {isLoadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrashIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-slate-100 my-4" />

        {/* Métricas */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Total Postulantes</p>
            <p className="text-lg font-bold text-slate-900">{totalApps}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Filtrados por IA</p>
            <p className="text-lg font-bold text-purple-700">{filteredByAI}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Finalistas</p>
            <p className="text-lg font-bold text-emerald-700">{finalists}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Publicado</p>
            <p className="text-lg font-bold text-slate-700">{formatRelativeDate(job.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <Briefcase className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">Aún no tienes publicaciones</h3>
      <p className="text-sm text-slate-500 mb-6">Crea tu primer empleo para empezar a recibir postulaciones</p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-900 to-teal-600 text-white font-semibold px-6 py-3 rounded-2xl hover:from-blue-800 hover:to-teal-500 transition-all shadow-sm"
      >
        <Plus className="w-5 h-5" />
        Crear Nueva Publicación
      </button>
    </div>
  );
}

// ─── Página Principal ──────────────────────────────────────────────────────────
// Ya no arma sidebar/navbar manualmente — app/(dashboard)/company/layout.tsx
// se encarga de eso. Este componente solo se enfoca en su contenido.

export function JobsManagementPage() {
  useProtectedRoute();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Obtener publicaciones
  const jobsQuery = useQuery({
    queryKey: ["my-job-posts", searchQuery],
    queryFn: () => jobApi.getMyPosts({ size: 100, search: searchQuery || undefined }),
    retry: false,
  });

  const allJobs = jobsQuery.data?.items ?? [];

  // Filtrar jobs
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      if (statusFilter && job.status !== statusFilter) return false;
      if (typeFilter && job.type !== typeFilter) return false;
      return true;
    });
  }, [allJobs, statusFilter, typeFilter]);

  // Estadísticas
  const stats = useMemo(() => {
    const activeJobs = allJobs.filter((j) => j.status === "PUBLISHED").length;
    const totalApplications = allJobs.reduce((sum, j) => sum + (j.applications?.length ?? 0), 0);
    const filteredByAI = allJobs.reduce((sum, j) => {
      return sum + (j.applications?.filter((a) => a.status === "REVIEWING").length ?? 0);
    }, 0);
    const finalists = allJobs.reduce((sum, j) => {
      return sum + (j.applications?.filter((a) => a.status === "ACCEPTED").length ?? 0);
    }, 0);
    return { activeJobs, totalApplications, filteredByAI, finalists };
  }, [allJobs]);

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => jobApi.delete(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-job-posts"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ jobId, newStatus }: { jobId: string; newStatus: string }) =>
      jobApi.changeStatus(jobId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-job-posts"] });
    },
  });

  const handleDelete = async (jobId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta publicación? Esta acción no se puede deshacer.")) return;
    setActionLoading(jobId);
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(jobId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeStatus = async (jobId: string, newStatus: string) => {
    setActionLoading(jobId);
    setActionError(null);
    try {
      await statusMutation.mutateAsync({ jobId, newStatus });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al cambiar estado");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (jobId: string) => {
    setActionLoading(jobId);
    setActionError(null);
    try {
      // Obtener el job original y crear uno nuevo con los mismos datos
      const originalJob = allJobs.find((j) => j.id === jobId);
      if (!originalJob) throw new Error("Publicación no encontrada");
      await jobApi.create({
        title: `${originalJob.title} (copia)`,
        description: originalJob.description || "",
        location: originalJob.location || "",
        type: originalJob.type || "FULL_TIME",
        salaryMin: originalJob.salaryMin || 0,
        salaryMax: originalJob.salaryMax || 0,
        currency: originalJob.currency || "PEN",
        vacancies: originalJob.vacancies || 1,
        requirements: originalJob.requirements || "",
        selectionMode: "MANUAL",
      });
      queryClient.invalidateQueries({ queryKey: ["my-job-posts"] });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al duplicar");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewApplicants = (jobId: string) => {
    window.location.href = `/company/pipeline/${jobId}`;
  };

  if (jobsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Cargando publicaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a8a]">Mis Publicaciones</h1>
          <p className="text-sm text-slate-500 mt-1">Gestiona todas tus vacantes, proyectos freelance y asesorías</p>
        </div>
        <a
          href="/company/jobs/create"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-900 to-teal-600 text-white font-semibold px-6 py-3 rounded-2xl hover:from-blue-800 hover:to-teal-500 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Crear Nueva Publicación
        </a>
      </div>

      {/* Error de acciones */}
      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Stats Cards */}
      <HiringStatsCards
        data={{
          activeJobs: stats.activeJobs,
          totalApplications: stats.totalApplications,
          interviewsInProgress: stats.filteredByAI,
          finalists: stats.finalists,
        }}
      />

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título o industria..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
        >
          <option value="">Todos los estados</option>
          <option value="PUBLISHED">Activas</option>
          <option value="SUSPENDED">Pausadas</option>
          <option value="CLOSED">Finalizadas</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
        >
          <option value="">Todos los tipos</option>
          <option value="FULL_TIME">Empleo Fijo</option>
          <option value="PART_TIME">Medio Tiempo</option>
          <option value="FREELANCE">Freelance</option>
          <option value="CONTRACT">Contrato</option>
          <option value="INTERNSHIP">Prácticas</option>
        </select>
      </div>

      {/* Lista de publicaciones */}
      {filteredJobs.length === 0 ? (
        <EmptyState onCreate={() => window.location.href = "/company/jobs/create"} />
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              actionLoading={actionLoading}
              onViewApplicants={handleViewApplicants}
              onChangeStatus={handleChangeStatus}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
}