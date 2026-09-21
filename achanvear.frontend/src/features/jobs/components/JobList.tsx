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

// ─── Mock data — reemplazar cuando el backend esté listo ─────────────────────
const MOCK_JOBS: Job[] = [
  {
    id: "1",
    companyId: "c1",
    company: { id: "c1", businessName: "Empresa 1", tradeName: "Empresa 1", industry: "Tecnología", specialty: "Backend", companySize: "MEDIUM", logoUrl: null, status: "ACTIVE" },
    title: "Desarrollador Full Stack Senior",
    description: "Buscamos un desarrollador Full Stack Senior con experiencia en React y Node.js.",
    location: "Lima",
    type: "FULL_TIME",
    salaryMin: 8000,
    salaryMax: 12000,
    currency: "PEN",
    vacancies: 1,
    status: "PUBLISHED",
    applications: [],
    level: "SENIOR",
    modality: "REMOTE",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "2",
    companyId: "c2",
    company: { id: "c2", businessName: "Empresa 2", tradeName: "Empresa 2", industry: "Tecnología", specialty: "Frontend", companySize: "SMALL", logoUrl: null, status: "ACTIVE" },
    title: "Desarrollador Frontend Mid",
    description: "Desarrollador Frontend con experiencia en React y CSS moderno.",
    location: "Arequipa",
    type: "PART_TIME",
    salaryMin: 5000,
    salaryMax: 7000,
    currency: "PEN",
    vacancies: 2,
    status: "PUBLISHED",
    applications: [],
    level: "MID",
    modality: "HYBRID",
    skills: ["React", "TypeScript", "Node.js"],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "3",
    companyId: "c3",
    company: { id: "c3", businessName: "StartupLima", tradeName: "StartupLima", industry: "Fintech", specialty: "Backend", companySize: "STARTUP", logoUrl: null, status: "ACTIVE" },
    title: "Desarrollador Full Stack Mid",
    description: "Startup de fintech busca desarrollador Full Stack para su equipo core.",
    location: "Lima",
    type: "FULL_TIME",
    salaryMin: 6000,
    salaryMax: 9000,
    currency: "PEN",
    vacancies: 1,
    status: "PUBLISHED",
    applications: [],
    level: "MID",
    modality: "REMOTE",
    skills: ["Vue.js", "Python", "Django"],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export function JobList() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const { filters, setFilter } = useJobFiltersStore();

  // Intentar backend, caer en mock si falla
  const { jobs: backendJobs, isLoading, isError } = useJobList();
  const jobs = isError || backendJobs.length === 0 ? MOCK_JOBS : backendJobs;
  const totalItems = isError ? MOCK_JOBS.length : (backendJobs.length === 0 ? MOCK_JOBS.length : backendJobs.length);

  return (
    <div className="flex h-full">
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
      <div className="flex flex-1 flex-col overflow-hidden">
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
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            // Skeleton loading
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-xl border border-slate-200 bg-white animate-pulse" />
              ))}
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