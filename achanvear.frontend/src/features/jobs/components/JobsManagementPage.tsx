// features/jobs/components/JobsManagementPage.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProtectedRoute } from "@/shared/hooks/useProtectedRoute";
import { ConfirmModal } from "@/shared/components/ui/ConfirmModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../api/jobApi";
import type { Job } from "../types/job.types";
import { HiringStatsCards } from "./HiringStatsCards";
import {
  Plus,
  Search,
  MapPin,
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
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
    case "FULLY_AUTOMATED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          <Sparkles className="w-3 h-3" />
          Automatización Achanvear (IA)
        </span>
      );
    case "SEMI_AUTOMATED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          Semiautomatizado
        </span>
      );
    case "MANUAL":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
          Manual
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-400 border border-slate-200">
          Sin configurar
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
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
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

const ACTION_BASE =
  "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition disabled:opacity-50 sm:gap-0 sm:border-0 sm:p-1.5 sm:font-normal sm:text-slate-400";

function JobCard({
  job,
  viewMode,
  actionLoading,
  onViewApplicants,
  onChangeStatus,
  onRequestClose,
  onRequestDelete,
  onDuplicate,
}: {
  job: Job;
  viewMode: "list" | "cards";
  actionLoading: string | null;
  onViewApplicants: (jobId: string) => void;
  onChangeStatus: (jobId: string, newStatus: string) => void;
  onRequestClose: (job: Job) => void;
  onRequestDelete: (job: Job) => void;
  onDuplicate: (jobId: string) => void;
}) {
  const isLoadingAction = actionLoading === job.id;
  const totalApps = job.applications?.length ?? 0;
  const filteredByAI = job.applications?.filter((a) => a.screeningScore != null).length ?? 0;
  const finalists = job.applications?.filter((a) => ["APPROVED", "HIRED"].includes(a.currentStage ?? a.status)).length ?? 0;

  return (
    <article className="h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
      <div className="p-4">
        <div className={`flex gap-3 ${viewMode === "cards" ? "flex-col" : "flex-col sm:flex-row sm:items-start sm:justify-between"}`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h3 className="min-w-0 break-words text-sm sm:text-base font-semibold leading-snug text-slate-900">{job.title}</h3>
              {getStatusBadge(job.status || "")}
            </div>

            <div className="flex items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500 flex-wrap">
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

            <div className="mt-2.5">
              {getSelectionModeBadge(job.selectionMode)}
            </div>
          </div>

          <div className={`flex gap-2 ${viewMode === "cards" ? "flex-col" : "flex-col sm:items-end sm:shrink-0"}`}>
            <button
              onClick={() => onViewApplicants(job.id)}
              className="inline-flex w-full items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[#1e3a8a] bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all sm:w-auto"
            >
              <Eye className="w-4 h-4" strokeWidth={1.5} />
              Ver Postulantes
            </button>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-1">
              <Link
                href={`/company/jobs/${job.id}/edit`}
                className={`${ACTION_BASE} hover:text-[#1e3a8a] hover:bg-slate-100`}
                title="Editar"
              >
                <Pencil className="w-4 h-4" strokeWidth={1.5} />
                <span className="sm:hidden">Editar</span>
              </Link>

              {job.status === "SUSPENDED" && (
                <button
                  type="button"
                  onClick={() => onChangeStatus(job.id, "PUBLISHED")}
                  disabled={isLoadingAction}
                  className={`${ACTION_BASE} hover:text-emerald-600 hover:bg-emerald-50`}
                  title="Reactivar"
                >
                  {isLoadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" strokeWidth={1.5} />}
                  <span className="sm:hidden">Reactivar</span>
                </button>
              )}

              {job.status === "PUBLISHED" && (
                <button
                  type="button"
                  onClick={() => onChangeStatus(job.id, "SUSPENDED")}
                  disabled={isLoadingAction}
                  className={`${ACTION_BASE} hover:text-amber-600 hover:bg-amber-50`}
                  title="Pausar"
                >
                  {isLoadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" strokeWidth={1.5} />}
                  <span className="sm:hidden">Pausar</span>
                </button>
              )}

              {job.status !== "CLOSED" && (
                <button
                  type="button"
                  onClick={() => onRequestClose(job)}
                  disabled={isLoadingAction}
                  className={`${ACTION_BASE} hover:text-red-600 hover:bg-red-50`}
                  title="Cerrar Vacante"
                >
                  {isLoadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" strokeWidth={1.5} />}
                  <span className="sm:hidden">Cerrar</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onDuplicate(job.id)}
                disabled={isLoadingAction}
                className={`${ACTION_BASE} hover:text-slate-600 hover:bg-slate-100`}
                title="Duplicar"
              >
                <Copy className="w-4 h-4" strokeWidth={1.5} />
                <span className="sm:hidden">Duplicar</span>
              </button>

              <button
                type="button"
                onClick={() => onRequestDelete(job)}
                disabled={isLoadingAction}
                className={`${ACTION_BASE} hover:text-red-700 hover:bg-red-50`}
                title="Eliminar"
              >
                {isLoadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrashIcon className="w-4 h-4" />}
                <span className="sm:hidden">Eliminar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 my-3" />

        <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50/80 p-3">
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

        </div>
      </div>
    </article>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

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

export function JobsManagementPage() {
  useProtectedRoute();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ kind: "close" | "delete"; job: Job } | null>(null);

  const jobsQuery = useQuery({
    queryKey: ["my-job-posts", "management"],
    queryFn: async () => {
      const first = await jobApi.getMyPosts({ size: 100 });
      const remaining = await Promise.all(Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, index) =>
        jobApi.getMyPosts({ page: index + 1, size: 100 })));
      return { ...first, items: [ ...first.items, ...remaining.flatMap(result => result.items) ] };
    },
    retry: false,
  });

  const statsQuery = useQuery({
    queryKey: ["company-hiring-stats"],
    queryFn: () => jobApi.getCompanyHiringStats(),
    retry: false,
  });

  const allJobs = jobsQuery.data?.items ?? [];

  const filteredJobs = useMemo(() => {
    const search = searchQuery.trim().toLocaleLowerCase("es");
    return allJobs.filter((job) => {
      if (search && ![job.title, job.location, job.company?.industry].filter(Boolean).join(" ").toLocaleLowerCase("es").includes(search)) return false;
      if (statusFilter && job.status !== statusFilter) return false;
      if (typeFilter && job.type !== typeFilter) return false;
      return true;
    });
  }, [allJobs, statusFilter, typeFilter, searchQuery]);
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const refreshAfterChange = () => {
    queryClient.invalidateQueries({ queryKey: ["my-job-posts"] });
    queryClient.invalidateQueries({ queryKey: ["company-hiring-stats"] });
  };
  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => jobApi.delete(jobId),
    onSuccess: refreshAfterChange,
  });

  const statusMutation = useMutation({
    mutationFn: ({ jobId, newStatus }: { jobId: string; newStatus: string }) =>
      jobApi.changeStatus(jobId, newStatus),
    onSuccess: refreshAfterChange,
  });

  const handleDelete = async (jobId: string) => {
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

  const handleConfirmPending = () => {
    if (!pending) return;
    const { kind, job } = pending;
    setPending(null);
    if (kind === "delete") {
      void handleDelete(job.id);
    } else {
      void handleChangeStatus(job.id, "CLOSED");
    }
  };

  const handleDuplicate = async (jobId: string) => {
    setActionLoading(jobId);
    setActionError(null);
    try {
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
        selectionMode: (originalJob.selectionMode as any) || "MANUAL",
      });
      refreshAfterChange();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al duplicar");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewApplicants = (jobId: string) => {
    router.push(`/company/pipeline/${jobId}`);
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
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[#1e3a8a]">Mis Publicaciones</h1>
          <p className="text-sm text-slate-500 mt-1">Gestiona todas tus vacantes, proyectos freelance y asesorías</p>
        </div>
        <Link
          href="/company/jobs/create"
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 bg-gradient-to-r from-blue-900 to-teal-600 text-white font-semibold px-6 py-3 rounded-2xl hover:from-blue-800 hover:to-teal-500 transition-all shadow-sm sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Crear Nueva Publicación
        </Link>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {actionError}
        </div>
      )}

      {statsQuery.isError && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          No se pudieron cargar las métricas de postulaciones y entrevistas. Intenta recargar la página.
        </div>
      )}

      <HiringStatsCards
        compact
        data={{
          activeJobs: statsQuery.data?.activeJobs ?? null,
          totalApplications: statsQuery.data?.totalApplications ?? null,
          interviewsInProgress: statsQuery.data?.interviewsInProgress ?? null,
          finalists: statsQuery.data?.finalists ?? null,
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-md sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Buscar por título o industria..."
            className="w-full min-w-0 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition sm:w-auto"
        >
          <option value="">Todos los estados</option>
          <option value="PUBLISHED">Activas</option>
          <option value="SUSPENDED">Pausadas</option>
          <option value="CLOSED">Finalizadas</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition sm:w-auto"
        >
          <option value="">Todos los tipos</option>
          <option value="FULL_TIME">Empleo Fijo</option>
          <option value="PART_TIME">Medio Tiempo</option>
          <option value="FREELANCE">Freelance</option>
          <option value="CONTRACT">Contrato</option>
          <option value="INTERNSHIP">Prácticas</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-800">{filteredJobs.length}</span> publicaciones
          {filteredJobs.length > 0 && <span className="ml-2 text-xs text-slate-400">Mostrando {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredJobs.length)}</span>}
        </p>
        <div role="group" aria-label="Vista de publicaciones" className="inline-flex rounded-xl border border-slate-200 bg-slate-100/70 p-1">
          {([{ value: "list", label: "Lista", icon: List }, { value: "cards", label: "Tarjetas", icon: LayoutGrid }] as const).map(({ value, label, icon: Icon }) => (
            <button key={value} type="button" aria-pressed={viewMode === value} onClick={() => setViewMode(value)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${viewMode === value ? "bg-white text-blue-900 shadow-sm ring-1 ring-slate-200/60" : "text-slate-500 hover:text-slate-800"}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>
      </div>

      {jobsQuery.isError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          No se pudieron cargar las publicaciones.
          <button type="button" onClick={() => jobsQuery.refetch()} className="ml-2 font-semibold underline">Reintentar</button>
        </div>
      ) : filteredJobs.length === 0 ? (
        allJobs.length > 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
            <Search className="mx-auto mb-3 h-7 w-7 text-slate-300" />
            <p className="font-semibold text-slate-800">No hay publicaciones con esos filtros</p>
            <button type="button" className="mt-3 text-sm font-semibold text-blue-900" onClick={() => { setSearchQuery(""); setStatusFilter(""); setTypeFilter(""); setPage(1); }}>Limpiar filtros</button>
          </div>
        ) : <EmptyState onCreate={() => router.push("/company/jobs/create")} />
      ) : (
        <div className={viewMode === "cards" ? "grid grid-cols-1 gap-4 md:grid-cols-2" : "space-y-3"}>
          {paginatedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              viewMode={viewMode}
              actionLoading={actionLoading}
              onViewApplicants={handleViewApplicants}
              onChangeStatus={handleChangeStatus}
              onRequestClose={(j) => setPending({ kind: "close", job: j })}
              onRequestDelete={(j) => setPending({ kind: "delete", job: j })}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}

      {!jobsQuery.isError && filteredJobs.length > 0 && (
        <nav aria-label="Paginación de publicaciones" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500">4 publicaciones por página / Página {currentPage} de {totalPages}</p>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Página anterior" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Anterior</button>
            <span aria-current="page" className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-900 px-3 text-xs font-semibold text-white">{currentPage}</span>
            <button type="button" aria-label="Página siguiente" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Siguiente<ChevronRight className="h-4 w-4" /></button>
          </div>
        </nav>
      )}

      {pending && (
        <ConfirmModal
          title={pending.kind === "delete" ? "Eliminar publicación" : "Cerrar vacante"}
          description={
            pending.kind === "delete"
              ? `Vas a eliminar "${pending.job.title}". Esta acción no se puede deshacer.`
              : `Vas a cerrar "${pending.job.title}". Dejará de recibir postulaciones y no podrás reabrirla desde aquí.`
          }
          confirmLabel={pending.kind === "delete" ? "Eliminar" : "Cerrar vacante"}
          onConfirm={handleConfirmPending}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}