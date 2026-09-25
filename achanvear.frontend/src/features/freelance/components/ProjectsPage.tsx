// features/freelance/components/ProjectsPage.tsx
"use client";

import { useState } from "react";
import { Filter, Search, Rocket, CheckCircle, Clock, XCircle } from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { useMyProposals } from "../hooks/useMyProposals";
import { useProjectFiltersStore } from "../store/useProjectFiltersStore";
import { ProjectCard } from "./ProjectCard";
import { ProjectFilters } from "./ProjectFilters";
import { ProposalModal } from "./ProposalModal";
import { ProjectDetailModal } from "./ProjectDetailModal";
import type { Project } from "../types/freelance.types";

type Tab = "explore" | "my-projects" | "proposals";

export function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("explore");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailProject, setDetailProject] = useState<Project | null>(null);

  const { filters, setFilter } = useProjectFiltersStore();
  const { projects, isLoading, isError } = useProjects();
  const {
    projects: myProposals,
    isLoading: proposalsLoading,
    isError: proposalsError,
    totalItems: proposalsTotal,
  } = useMyProposals();

  const TABS = [
    { key: "explore" as Tab,     label: "Explorar Proyectos" },
    { key: "my-projects" as Tab, label: "Mis Proyectos" },
    { key: "proposals" as Tab,   label: "Propuestas Enviadas" },
  ];

  return (
    <div className="flex min-w-0 flex-col lg:flex-row">
      {/* Panel de filtros */}
      {showFilters && activeTab === "explore" && (
        <>
          <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setShowFilters(false)} />
          <div className="fixed left-0 top-0 z-40 h-full w-64 shadow-xl lg:relative lg:z-auto lg:shadow-none lg:w-56 lg:flex-shrink-0 lg:border-r lg:border-slate-200">
            <ProjectFilters onClose={() => setShowFilters(false)} />
          </div>
        </>
      )}

      {/* Contenido principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-slate-900">Proyectos Freelance</h1>
            {activeTab === "explore" && (
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                  showFilters
                    ? "border-[#0EA5A0] bg-teal-50 text-[#0EA5A0]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Filter className="h-4 w-4" strokeWidth={1.5} />
                Filtros
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab.key
                    ? "bg-[#1B3A6B] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        {activeTab === "explore" && (
          <div className="border-b border-slate-100 bg-white px-6 py-3">
            <div className="flex max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="h-4 w-4 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
                placeholder="Buscar proyectos..."
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6">

          {/* Tab Explorar */}
          {activeTab === "explore" && (
            <>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-52 rounded-xl border border-slate-200 bg-white animate-pulse" />
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <Rocket className="h-8 w-8 text-red-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Error al cargar proyectos</p>
                  <p className="mt-1 text-xs text-slate-500">No se pudieron cargar los proyectos. Verifica tu conexión e intenta de nuevo.</p>
                </div>
              ) : !projects || projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <Rocket className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">No hay proyectos disponibles</p>
                  <p className="mt-1 text-xs text-slate-500">Vuelve más tarde para ver nuevas oportunidades</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onViewDetail={(p) => setDetailProject(p)}
                      onPropose={(p) => setSelectedProject(p)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Tab Mis Proyectos */}
          {activeTab === "my-projects" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Rocket className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold text-slate-700">No tienes proyectos activos</p>
              <p className="mt-1 text-xs text-slate-500">Los proyectos aparecerán cuando seas contratado</p>
            </div>
          )}

          {/* Tab Propuestas Enviadas */}
          {activeTab === "proposals" && (
            <>
              {proposalsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-52 rounded-xl border border-slate-200 bg-white animate-pulse" />
                  ))}
                </div>
              ) : proposalsError ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <Rocket className="h-8 w-8 text-red-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Error al cargar propuestas</p>
                  <p className="mt-1 text-xs text-slate-500">No se pudieron cargar tus propuestas. Verifica tu conexión e intenta de nuevo.</p>
                </div>
              ) : !myProposals || myProposals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <Rocket className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">No has enviado propuestas aún</p>
                  <p className="mt-1 text-xs text-slate-500">Explora proyectos y envía tu primera propuesta</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("explore")}
                    className="mt-6 rounded-xl bg-[#1B3A6B] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#162f58] transition-colors"
                  >
                    Explorar Proyectos
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 mb-4">
                    Has enviado <span className="font-semibold text-slate-700">{proposalsTotal}</span> propuesta(s)
                  </p>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {myProposals.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onViewDetail={(p) => setDetailProject(p)}
                        onPropose={(p) => setSelectedProject(p)}
                        showProposalStatus
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Modal detalle */}
      {detailProject && (
        <ProjectDetailModal
          project={detailProject}
          onClose={() => setDetailProject(null)}
          onPropose={(p) => { setDetailProject(null); setSelectedProject(p); }}
        />
      )}

      {/* Modal propuesta */}
      {selectedProject && (
        <ProposalModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSuccess={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
