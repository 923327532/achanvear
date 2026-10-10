// features/freelance/components/ProjectsPage.tsx
"use client";

import { useState } from "react";
import { Filter, Search, Rocket } from "lucide-react";
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
  const {
    projects,
    isLoading,
    isError,
    totalPages,
    currentPage,
    isFirst,
    isLast,
  } = useProjects();
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
          {/* RESPONSIVE: max-w-[85vw] evita que el panel ocupe todo el ancho en pantallas muy angostas */}
          <div className="fixed left-0 top-0 z-40 h-full w-64 max-w-[85vw] shadow-xl lg:relative lg:z-auto lg:shadow-none lg:w-56 lg:max-w-none lg:flex-shrink-0 lg:border-r lg:border-slate-200">
            <ProjectFilters onClose={() => setShowFilters(false)} />
          </div>
        </>
      )}

      {/* Contenido principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        {/* RESPONSIVE: px-4 en celular, px-6 desde sm */}
        <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          {/* RESPONSIVE: gap-3 + min-w-0 en el título; el botón no se encoge (shrink-0) */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="min-w-0 text-lg font-semibold text-slate-900 sm:text-xl">Proyectos Freelance</h1>
            {activeTab === "explore" && (
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex flex-shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors sm:px-4 ${
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
          {/* RESPONSIVE: en celular 3 columnas iguales (el texto puede partirse en 2 líneas y ya no se corta);
              desde sm vuelve a fila con ancho natural */}
          <div className="grid grid-cols-3 gap-1 sm:flex">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`min-w-0 rounded-lg px-2 py-2 text-center text-xs font-semibold leading-tight transition-colors sm:px-4 sm:text-sm ${
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
          <div className="border-b border-slate-100 bg-white px-4 py-3 sm:px-6">
            <div className="flex max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="h-4 w-4 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
              {/* RESPONSIVE: min-w-0 para que el input se pueda encoger */}
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
                placeholder="Buscar proyectos..."
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
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
                <div className="space-y-5">
                  {/* RESPONSIVE: 2 columnas solo desde xl (el sidebar de 260px deja ~700px a 1024px,
                      y con el panel de filtros abierto aún menos) */}
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {projects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onViewDetail={(p) => setDetailProject(p)}
                        onPropose={(p) => setSelectedProject(p)}
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
                  {/* RESPONSIVE: 2 columnas solo desde xl */}
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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