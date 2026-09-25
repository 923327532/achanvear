// features/jobs/components/JobList.tsx
"use client";

import { useState } from "react";
import { Filter, Search } from "lucide-react";
import { useJobList } from "../hooks/useJobList";
import { useJobFiltersStore } from "../store/useJobFiltersStore";
import { JobCard } from "./JobCard";
import { JobFilters } from "./JobFilters";
import { ApplicationModal } from "./ApplicationModal";
import { JobDetailModal } from "./JobDetailModal";
import type { Job } from "../types/job.types";

export function JobList() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const { filters, setFilter } = useJobFiltersStore();

  const { jobs: backendJobs, isLoading, isError } = useJobList();
  const jobs = backendJobs;

  return (
    <div className="flex min-w-0 flex-col lg:flex-row">
      {/* Panel de filtros — visible en desktop siempre, en mobile como overlay */}
      {showFilters && (
        <>
          {/* Overlay mobile */}
          <div
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            onClick={() => setShowFilters(false)}
          />
          <div className="fixed left-0 top-0 z-40 h-full w-64 shadow-xl lg:relative lg:z-auto lg:shadow-none lg:w-56 lg:flex-shrink-0 lg:border-r lg:border-slate-200">
            <JobFilters onClose={() => setShowFilters(false)} />
          </div>
        </>
      )}

      {/* Contenido principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Explorar Empleos</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
              showFilters
                ? "border-[#1B3A6B] bg-blue-50 text-[#1B3A6B]"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Filter className="h-4 w-4" strokeWidth={1.5} />
            Filtros
          </button>
        </div>

        {/* Search bar */}
        <div className="border-b border-slate-100 bg-white px-6 py-3">
          <div className="flex max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              placeholder="Buscar por título, empresa o habilidad..."
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Lista de empleos */}
        <div className="flex-1 p-4 sm:p-6">
          {isLoading ? (
            // Skeleton loading
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-xl border border-slate-200 bg-white animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-semibold text-slate-700">No pudimos cargar los empleos</p>
              <p className="mt-1 text-xs text-slate-500">Actualiza la pagina o intenta nuevamente en unos minutos</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-semibold text-slate-700">No encontramos empleos</p>
              <p className="mt-1 text-xs text-slate-500">Intenta cambiar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={(j) => setSelectedJob(j)}
                  onViewDetail={(j) => setDetailJob(j)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal detalle */}
      {detailJob && (
        <JobDetailModal
          job={detailJob}
          onClose={() => setDetailJob(null)}
          onApply={(j) => { setDetailJob(null); setSelectedJob(j); }}
        />
      )}

      {/* Modal postulación */}
      {selectedJob && (
        <ApplicationModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSuccess={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}
