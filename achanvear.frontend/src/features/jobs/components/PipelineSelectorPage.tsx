// features/jobs/components/PipelineSelectorPage.tsx
"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { GitBranch, Users, MapPin, Loader2, Briefcase } from "lucide-react";
import { jobApi } from "../api/jobApi";

// Página índice de "/company/pipeline". La ruta real de pipeline es dinámica
// (/company/pipeline/[jobId]) porque el pipeline de selección es por vacante
// específica — no existe un "pipeline general". Esta pantalla lista las
// vacantes activas y deja elegir a cuál entrar, en vez de redirigir a otra
// sección (como hacía la versión anterior de este archivo).

function getStatusBadge(status: string) {
  switch (status) {
    case "PUBLISHED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          Activo
        </span>
      );
    case "SUSPENDED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          Pausado
        </span>
      );
    case "CLOSED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          Cerrado
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
          {status}
        </span>
      );
  }
}

export function PipelineSelectorPage() {
  const router = useRouter();

  const jobsQuery = useQuery({
    queryKey: ["my-job-posts", "pipeline-selector"],
    queryFn: () => jobApi.getMyPosts({ size: 100 }),
    retry: false,
  });

  const jobs = jobsQuery.data?.items ?? [];
  const isLoading = jobsQuery.isLoading;

  return (
    // RESPONSIVE: antes era p-8 fijo (32px por lado). En celular dejaba las
    // tarjetas en ~220px de 284px disponibles. Mismo padding que el resto de
    // las pantallas de empresa.
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a8a]">Pipeline de Selección</h1>
        <p className="text-sm text-slate-500 mt-1">
          Elige una vacante para ver el pipeline de candidatos (screening, teórica, técnica y finalistas)
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#1e3a8a]" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-slate-200 bg-white">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Aún no tienes publicaciones</p>
          <p className="text-xs text-slate-400 mt-1">
            Crea una vacante para empezar a gestionar su pipeline de selección
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const totalApps = job.applications?.length ?? 0;
            const newApps = job.applications?.filter((a) => a.status === "PENDING").length ?? 0;

            return (
              <div
                key={job.id}
                className="min-w-0 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="min-w-0 break-words text-sm font-semibold text-slate-900 leading-snug">{job.title}</h3>
                  <div className="shrink-0">{getStatusBadge(job.status)}</div>
                </div>

                {job.location && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="min-w-0 break-words">{job.location}</span>
                  </div>
                )}

                {/* RESPONSIVE: conteo + botón en una sola fila competían por el
                    ancho y "Ver pipeline" se partía en dos líneas. En celular
                    se apilan y el botón ocupa todo el ancho; desde sm vuelven
                    a ir lado a lado. */}
                <div className="flex flex-col gap-3 pt-3 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-[#1e3a8a]">{totalApps}</span>
                    <span className="text-slate-400">postulaciones</span>
                    {newApps > 0 && (
                      <span className="text-xs text-emerald-600 font-medium">({newApps} nuevas)</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/company/pipeline/${job.id}`)}
                    className="inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#1e3a8a] px-3 py-2 text-xs font-semibold text-white hover:bg-[#162f58] transition-colors sm:w-auto sm:py-1.5"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    Ver pipeline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}