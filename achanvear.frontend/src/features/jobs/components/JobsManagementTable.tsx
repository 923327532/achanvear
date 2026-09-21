// features/jobs/components/JobsManagementTable.tsx
"use client";

import { Eye, Pencil, Trash2, Play, Pause, XCircle, Loader2, MapPin, Clock } from "lucide-react";
import type { Job } from "@/features/jobs/types/job.types";

interface JobsManagementTableProps {
  jobs: Job[];
  actionLoading: string | null;
  onDelete: (jobId: string) => void;
  onChangeStatus: (jobId: string, newStatus: string) => void;
}

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

function getSelectionModeBadge(mode?: string) {
  switch (mode) {
    case "IA":
    case "AI":
    case "AUTOMATED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          IA Automatizado
        </span>
      );
    case "SEMI":
    case "SEMI_AUTOMATED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          Semiautomatizado
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
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

export function JobsManagementTable({ jobs, actionLoading, onDelete, onChangeStatus }: JobsManagementTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <BriefcaseIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p className="text-sm font-medium text-slate-500">Aún no tienes publicaciones</p>
        <p className="text-xs text-slate-400 mt-1">Crea tu primer empleo para empezar a recibir postulaciones</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">Puesto</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">Postulaciones</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">Modo Selección</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">Estado</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">Publicado</th>
            <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {jobs.map((job) => {
            const isLoadingAction = actionLoading === job.id;
            const newApplications = job.applications?.filter((a) => a.status === "PENDING").length ?? 0;
            const totalApps = job.applications?.length ?? 0;

            return (
              <tr key={job.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-4 pr-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {job.location && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                      )}
                      {job.createdAt && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(job.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 pr-4">
                  <span className="text-sm font-semibold text-[#1e3a8a]">{totalApps}</span>
                  {newApplications > 0 && (
                    <span className="ml-1.5 text-xs text-emerald-600 font-medium">
                      ({newApplications} nuevas)
                    </span>
                  )}
                </td>
                <td className="py-4 pr-4">{getSelectionModeBadge(job.type)}</td>
                <td className="py-4 pr-4">{getStatusBadge(job.status)}</td>
                <td className="py-4 pr-4">
                  <span className="text-sm text-slate-500">{formatDate(job.createdAt)}</span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* Ver */}
                    <a
                      href={`/company/jobs/${job.id}/edit`}
                      className="p-2 text-slate-400 hover:text-[#1e3a8a] hover:bg-slate-100 rounded-lg transition"
                      title="Ver"
                    >
                      <Eye className="w-4 h-4" strokeWidth={1.5} />
                    </a>

                    {/* Editar */}
                    <a
                      href={`/company/jobs/${job.id}/edit`}
                      className="p-2 text-slate-400 hover:text-[#1e3a8a] hover:bg-slate-100 rounded-lg transition"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" strokeWidth={1.5} />
                    </a>

                    {/* Publicar (si está SUSPENDED) */}
                    {job.status === "SUSPENDED" && (
                      <button
                        onClick={() => onChangeStatus(job.id, "PUBLISHED")}
                        disabled={isLoadingAction}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="Publicar"
                      >
                        {isLoadingAction ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" strokeWidth={1.5} />
                        )}
                      </button>
                    )}

                    {/* Pausar (si está PUBLISHED) */}
                    {job.status === "PUBLISHED" && (
                      <button
                        onClick={() => onChangeStatus(job.id, "SUSPENDED")}
                        disabled={isLoadingAction}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Pausar"
                      >
                        {isLoadingAction ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Pause className="w-4 h-4" strokeWidth={1.5} />
                        )}
                      </button>
                    )}

                    {/* Cerrar (si no está CLOSED) */}
                    {job.status !== "CLOSED" && (
                      <button
                        onClick={() => onChangeStatus(job.id, "CLOSED")}
                        disabled={isLoadingAction}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Cerrar"
                      >
                        {isLoadingAction ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" strokeWidth={1.5} />
                        )}
                      </button>
                    )}

                    {/* Eliminar */}
                    <button
                      onClick={() => onDelete(job.id)}
                      disabled={isLoadingAction}
                      className="p-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      title="Eliminar"
                    >
                      {isLoadingAction ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}