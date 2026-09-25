// features/dashboard/components/FreelancerDashboardPage.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Video, User, Star, Send, Calendar,
  MapPin, Clock, MessageCircle, Search,
  ChevronRight, Briefcase, CheckCircle2,
} from "lucide-react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProjects } from "@/features/freelance/hooks/useProjects";
import { useAppliedJobIds } from "@/features/jobs/hooks/useAppliedJobIds";
import { JobDetailModal } from "@/features/jobs/components/JobDetailModal";
import { ApplicationModal } from "@/features/jobs/components/ApplicationModal";
import { ProjectDetailModal } from "@/features/freelance/components/ProjectDetailModal";
import { ProposalModal } from "@/features/freelance/components/ProposalModal";
import type { Job } from "@/features/jobs/types/job.types";
import type { Project } from "@/features/freelance/types/freelance.types";
import { useRecommendedJobs } from "@/features/jobs/hooks/useRecommendedJobs";

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Específicos de esta pantalla — no se reutilizan en otro lado, por eso viven
// aquí mismo en vez de en un archivo separado.

function TypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    FULL_TIME: "Tiempo completo",
    PART_TIME: "Medio tiempo",
    FREELANCE: "Freelance",
    INTERNSHIP: "Prácticas",
  };
  return (
    <span className="inline-flex items-center rounded-md bg-[#1B3A6B] px-2.5 py-0.5 text-xs font-semibold text-white">
      {labels[type] ?? type}
    </span>
  );
}

function TagBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">
      {label}
    </span>
  );
}

function SkillBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[#0EA5A0]/10 px-2.5 py-0.5 text-xs font-medium text-[#0EA5A0]">
      {label}
    </span>
  );
}

function formatSalary(min: number, max: number, currency: string = "PEN"): string {
  const sym = currency === "USD" ? "$" : "S/.";
  return `${sym} ${min.toLocaleString()} - ${sym} ${max.toLocaleString()}`;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export function FreelancerDashboardPage() {
  const { user } = useAuth();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { appliedJobIds } = useAppliedJobIds();

  const { jobs, industry, isLoading: jobsLoading, isFiltered } = useRecommendedJobs(4);

  // Modales empleos
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  // Modales proyectos
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [proposeProject, setProposeProject] = useState<Project | null>(null);

  const fullName = user?.fullName ?? "Profesional";
  const firstName = fullName.split(" ")[0];

  return (
    <div className="flex-1 p-3 sm:p-4 md:p-6">
      <div className="space-y-4 md:space-y-6">

        {/* ── Hero card ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B3A6B] to-[#0EA5A0] p-4 sm:p-5 md:p-7">
          <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <h1 className="text-xl font-bold text-white md:text-2xl">¡Hola, {firstName}!</h1>
              <p className="mt-1 text-xs text-white/80 md:text-sm">
                {jobs.length > 0
                  ? `Hay ${jobs.length} oportunidades disponibles para ti`
                  : "Explora nuevas oportunidades laborales"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                  Freelancer
                </span>
                <span className="text-xs text-white/70 hidden sm:inline">
                  • Contenido personalizado para tu perfil
                </span>
              </div>
            </div>
            <Link
              href="/freelancer/interviews"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:w-fit"
            >
              <Video className="h-4 w-4" strokeWidth={1.5} />
              <span className="whitespace-nowrap">Ir a Entrevistas</span>
            </Link>
          </div>
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 right-24 h-24 w-24 rounded-full bg-white/5" />
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
          {[
            { icon: Send,     label: "Empleos disponibles", value: jobs.length },
            { icon: Calendar, label: "Proyectos freelance",  value: projects?.length ?? 0 },
            { icon: User,     label: "Perfil completado",    value: "—" },
            { icon: Star,     label: "Reputación",           value: "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 sm:gap-3 md:p-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 md:h-10 md:w-10">
                <Icon className="h-4 w-4 text-slate-500 md:h-5 md:w-5" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-slate-900 md:text-xl">{value}</p>
                <p className="truncate text-xs text-slate-500 leading-tight mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Empleos recomendados ── */}
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="min-w-0 truncate text-sm font-semibold text-slate-900 md:text-base">Empleos recomendados</h2>
            <Link href="/freelancer/jobs" className="flex flex-shrink-0 items-center gap-1 text-xs font-semibold text-[#1B3A6B] hover:underline">
              Ver todos <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {jobsLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 rounded-xl border border-slate-200 bg-white animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-10 text-center sm:py-12">
              <Briefcase className="mb-2 h-8 w-8 text-slate-300" strokeWidth={1.5} />
              <p className="text-sm font-medium text-slate-500">No hay empleos disponibles</p>
              <p className="mt-1 text-xs text-slate-400">Vuelve más tarde para ver nuevas oportunidades</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              {jobs.slice(0, 4).map((job) => (
                <div key={job.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 md:p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                      {getInitials(job.company?.businessName ?? "Empresa")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{job.title}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span className="min-w-0 truncate">{job.company?.businessName ?? "Empresa"}</span>
                        <span className="flex-shrink-0">•</span>
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="min-w-0 truncate">{job.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <TypeBadge type={job.type} />
                    {job.level && <TagBadge label={job.level} />}
                    {job.modality && <TagBadge label={job.modality} />}
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {job.skills?.slice(0, 3).map((s) => <TagBadge key={s} label={s} />)}
                    {job.skills && job.skills.length > 3 && <TagBadge label={`+${job.skills.length - 3} más`} />}
                  </div>
                  <div className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between sm:border-t-0 sm:pt-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#0EA5A0]">
                        {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{job.createdAt ? new Date(job.createdAt).toLocaleDateString("es-PE") : "Reciente"}</span>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailJob(job)}
                        className="order-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 sm:order-1 sm:border-0 sm:px-0 sm:py-0 sm:hover:bg-transparent sm:hover:text-slate-900"
                      >
                        Ver detalles
                      </button>
                      {appliedJobIds.includes(job.id) ? (
                        <span className="order-1 inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 border border-emerald-200 sm:order-2">
                          <CheckCircle2 className="w-3 h-3" /> Ya postulaste
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setApplyJob(job)}
                          className="order-1 rounded-lg bg-[#1B3A6B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#162f58] transition-colors sm:order-2"
                        >
                          Postular
                        </button>
                      )}

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Proyectos freelance ── */}
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="min-w-0 truncate text-sm font-semibold text-slate-900 md:text-base">Proyectos freelance disponibles</h2>
            <Link href="/freelancer/projects" className="flex flex-shrink-0 items-center gap-1 text-xs font-semibold text-[#1B3A6B] hover:underline">
              Ver todos <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {projectsLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-52 rounded-xl border border-slate-200 bg-white animate-pulse" />
              ))}
            </div>
          ) : !projects || projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-10 text-center sm:py-12">
              <Briefcase className="mb-2 h-8 w-8 text-slate-300" strokeWidth={1.5} />
              <p className="text-sm font-medium text-slate-500">No hay proyectos disponibles</p>
              <p className="mt-1 text-xs text-slate-400">Vuelve más tarde para ver nuevas oportunidades freelance</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              {projects.slice(0, 4).map((project) => {
                const companyName   = project.companyName ?? null;
                const companyRating = project.companyRating ?? 0;
                const hasRating     = companyRating > 0;

                return (
                  <div key={project.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 md:p-5">
                    <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                      <h3 className="min-w-0 text-sm font-semibold text-slate-900 leading-tight">{project.title}</h3>
                      <span className="flex-shrink-0 text-sm font-bold text-[#0EA5A0]">
                        {project.maxBudget != null
                          ? `S/. ${(project.minBudget ?? project.budget).toLocaleString()} - S/. ${project.maxBudget.toLocaleString()}`
                          : `S/. ${(project.minBudget ?? project.budget).toLocaleString()}`}
                      </span>
                    </div>

                    {/* Cliente */}
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                        {companyName ? getInitials(companyName) : "CL"}
                      </div>
                      <div className="min-w-0 flex-1">
                        {companyName ? (
                          <p className="truncate text-xs font-semibold text-slate-800">{companyName}</p>
                        ) : (
                          <p className="truncate text-xs font-medium text-slate-400 italic">Empresa verificada</p>
                        )}
                        {hasRating && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span>{companyRating}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="mb-3 text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {project.description || "Sin descripción disponible"}
                    </p>

                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {project.skills?.slice(0, 3).map((s) => <SkillBadge key={s} label={s} />)}
                      {project.skills && project.skills.length > 3 && (
                        <SkillBadge label={`+${project.skills.length - 3}`} />
                      )}
                    </div>

                    <div className="mt-auto border-t border-slate-100 pt-3">
                      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{project.estimatedDays ?? "—"} días</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{project.proposals?.length ?? 0} propuestas</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailProject(project)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <Search className="h-3 w-3" />
                          Ver detalles
                        </button>
                        {project.hasApplied ? (
                          <span className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-50 py-1.5 text-xs font-semibold text-emerald-600 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Ya postulaste
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setProposeProject(project)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#0EA5A0] py-1.5 text-xs font-semibold text-white hover:bg-[#0d9090] transition-colors"
                          >
                            <Send className="h-3 w-3" />
                            Postular
                          </button>
                        )}

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── Modales empleos ── */}
      {detailJob && (
        <JobDetailModal
          job={detailJob}
          onClose={() => setDetailJob(null)}
          onApply={(j) => { setDetailJob(null); setApplyJob(j); }}
        />
      )}
      {applyJob && (
        <ApplicationModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSuccess={() => setApplyJob(null)}
        />
      )}

      {/* ── Modales proyectos ── */}
      {detailProject && (
        <ProjectDetailModal
          project={detailProject}
          onClose={() => setDetailProject(null)}
          onPropose={(p) => { setDetailProject(null); setProposeProject(p); }}
        />
      )}
      {proposeProject && (
        <ProposalModal
          project={proposeProject}
          onClose={() => setProposeProject(null)}
          onSuccess={() => setProposeProject(null)}
        />
      )}
    </div>
  );
}
