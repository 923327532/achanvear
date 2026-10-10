// features/jobs/components/JobList.tsx
"use client";

import { useEffect, useState } from "react";
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
  const { filters, setFilter, resetFilters } = useJobFiltersStore();

  useEffect(() => {
    resetFilters();
  }, [resetFilters]);

  const {
    jobs: backendJobs,
    isLoading,
    isError,
    totalItems,
    totalPages,
    currentPage,
    isFirst,
    isLast,
  } = useJobList();
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
          {/* RESPONSIVE: max-w-[85vw] evita que el panel ocupe todo el ancho en pantallas muy angostas */}
          <div className="fixed left-0 top-0 z-40 h-full w-64 max-w-[85vw] shadow-xl lg:relative lg:z-auto lg:shadow-none lg:w-56 lg:max-w-none lg:flex-shrink-0 lg:border-r lg:border-slate-200">
            <JobFilters onClose={() => setShowFilters(false)} />
          </div>
        </>
      )}

      {/* Contenido principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        {/* RESPONSIVE: px-4 en celular, px-6 desde sm; gap-3 y título más chico en celular; el botón Filtros no se encoge */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">Explorar Empleos</h1>
            <p className="mt-1 text-xs text-slate-500">Mostrando empleos activos disponibles</p>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex flex-shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors sm:px-4 ${
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
        <div className="border-b border-slate-100 bg-white px-4 py-3 sm:px-6">
          <div className="flex max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
            {/* RESPONSIVE: min-w-0 para que el input se pueda encoger */}
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              placeholder="Buscar por título, empresa o habilidad..."
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
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
            <div className="space-y-5">
              <p className="text-xs font-medium text-slate-500">
                {jobs.length} de {totalItems} empleos activos disponibles
              </p>
              {/* RESPONSIVE: 2 columnas solo desde xl (el sidebar deja ~700px a 1024px, y con el panel de filtros abierto aún menos) */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={(j) => setSelectedJob(j)}
                    onViewDetail={(j) => setDetailJob(j)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-medium text-slate-500">
                    Pagina {currentPage + 1} de {totalPages}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFilter("page", Math.max(0, currentPage - 1))}
                      disabled={isFirst}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFilter("page", index)}
                        className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${
                          currentPage === index
                            ? "bg-[#1B3A6B] text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFilter("page", Math.min(totalPages - 1, currentPage + 1))}
                      disabled={isLast}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
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
