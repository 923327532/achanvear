// features/dashboard/components/CompanyDashboardHome.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useCompanyDashboard } from "@/features/jobs/hooks/useCompanyDashboard";
import { jobApi } from "@/features/jobs/api/jobApi";
import { HiringStatsCards } from "@/features/jobs/components/HiringStatsCards";
import { JobsManagementTable } from "@/features/jobs/components/JobsManagementTable";
import { HiringPipeline } from "@/features/jobs/components/HiringPipeline";
import { QuickActions } from "@/features/jobs/components/QuickActions";

export function CompanyDashboardHome() {
  const { data: dashboard, refetch } = useCompanyDashboard();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta publicación? Esta acción no se puede deshacer.")) return;
    setActionLoading(jobId);
    setActionError(null);
    try {
      await jobApi.delete(jobId);
      refetch();
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
      await jobApi.changeStatus(jobId, newStatus);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al cambiar estado");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="space-y-6 lg:space-y-8">
        {/* Header principal */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a8a]">Panel de Control</h1>
            <p className="text-sm text-slate-500 mt-1">
              Gestiona tus procesos de selección y vacantes activas
            </p>
          </div>
          <a
            href="/company/jobs/create"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-[#162f58] sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Publicar nuevo empleo
          </a>
        </div>

        {/* Cards estadísticas */}
        <HiringStatsCards
          data={{
            activeJobs: dashboard?.activeJobs ?? 0,
            totalApplications: dashboard?.totalApplications ?? 0,
            interviewsInProgress: dashboard?.interviewsInProgress ?? 0,
            finalists: dashboard?.finalists ?? 0,
          }}
        />

        {/* Error de acciones */}
        {actionError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {actionError}
          </div>
        )}

        {/* Sección Publicaciones */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Mis publicaciones activas</h2>
            <a href="/company/jobs" className="text-sm font-medium text-[#1e3a8a] hover:text-[#162f58] transition-colors">
              Ver todas
            </a>
          </div>
          <div className="px-6 pb-6 pt-2">
            <JobsManagementTable
              jobs={dashboard?.recentJobs ?? []}
              actionLoading={actionLoading}
              onDelete={handleDeleteJob}
              onChangeStatus={handleChangeStatus}
            />
          </div>
        </section>

        {/* Pipeline en progreso */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Pipeline en progreso</h2>
          <HiringPipeline
            data={{
              screening: dashboard?.totalApplications ?? 0,
              theory: dashboard?.interviewsInProgress ?? 0,
              technical: dashboard?.interviewsInProgress ?? 0,
              finalists: dashboard?.finalists ?? 0,
            }}
          />
        </section>

        {/* Acciones rápidas */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Acciones rápidas</h2>
          <QuickActions />
        </section>
      </div>
    </div>
  );
}
