// features/jobs/components/JobsManagementTable.tsx
"use client";

import Link from "next/link";
import { Pencil, Trash2, Play, Pause, XCircle, Loader2, MapPin, Clock } from "lucide-react";
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

// FIX: este badge recibía job.type (FULL_TIME/PART_TIME/FREELANCE, el tipo de
// contrato) en vez de job.selectionMode (MANUAL/SEMI_AUTOMATED/FULLY_AUTOMATED,
// lo que realmente se configura al crear el empleo). Como job.type nunca
// coincidía con ningún case, siempre caía en el default "Manual" sin importar
// qué modo de selección se hubiera elegido al crear la vacante. También se
// corrigieron los valores de los case para que coincidan con el enum real
// (SelectionMode en job.types.ts) en vez de "IA"/"AI"/"SEMI" sueltos.
function getSelectionModeBadge(mode?: string) {
  switch (mode) {
    case "FULLY_AUTOMATED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          IA Automatizado
        </span>
      );
    case "SEMI_AUTOMATED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          Semiautomatizado
        </span>
      );
    case "MANUAL":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
          Manual
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-400 border border-slate-200">
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

// ─── Acciones de una fila/tarjeta ─────────────────────────────────────────────
// Un solo componente para tabla y tarjeta, así la lógica (qué botón aparece
// según el estado) no se duplica. En la tabla van solo íconos; en la tarjeta
// móvil llevan texto, porque en pantalla táctil no existe el tooltip (title).

interface JobActionsProps {
  job: Job;
  isLoadingAction: boolean;
  onDelete: (jobId: string) => void;
  onChangeStatus: (jobId: string, newStatus: string) => void;
  onClose: (job: Job) => void;
  showLabels?: boolean;
}

function JobActions({
  job,
  isLoadingAction,
  onDelete,
  onChangeStatus,
  onClose,
  showLabels = false,
}: JobActionsProps) {
  const base = showLabels
    ? "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition disabled:opacity-50"
    : "p-2 text-slate-400 rounded-lg transition disabled:opacity-50";

  return (
    <>
      {/* Editar */}
      <Link
        href={`/company/jobs/${job.id}/edit`}
        className={`${base} hover:text-[#1e3a8a] hover:bg-slate-100`}
        title="Editar"
      >
        <Pencil className="w-4 h-4" strokeWidth={1.5} />
        {showLabels && "Editar"}
      </Link>

      {/* Publicar (si está SUSPENDED) */}
      {job.status === "SUSPENDED" && (
        <button
          type="button"
          onClick={() => onChangeStatus(job.id, "PUBLISHED")}
          disabled={isLoadingAction}
          className={`${base} hover:text-emerald-600 hover:bg-emerald-50`}
          title="Publicar"
        >
          {isLoadingAction ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" strokeWidth={1.5} />
          )}
          {showLabels && "Publicar"}
        </button>
      )}

      {/* Pausar (si está PUBLISHED) */}
      {job.status === "PUBLISHED" && (
        <button
          type="button"
          onClick={() => onChangeStatus(job.id, "SUSPENDED")}
          disabled={isLoadingAction}
          className={`${base} hover:text-amber-600 hover:bg-amber-50`}
          title="Pausar"
        >
          {isLoadingAction ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Pause className="w-4 h-4" strokeWidth={1.5} />
          )}
          {showLabels && "Pausar"}
        </button>
      )}

      {/* Cerrar (si no está CLOSED) — pide confirmación */}
      {job.status !== "CLOSED" && (
        <button
          type="button"
          onClick={() => onClose(job)}
          disabled={isLoadingAction}
          className={`${base} hover:text-red-600 hover:bg-red-50`}
          title="Cerrar"
        >
          {isLoadingAction ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" strokeWidth={1.5} />
          )}
          {showLabels && "Cerrar"}
        </button>
      )}

      {/* Eliminar */}
      <button
        type="button"
        onClick={() => onDelete(job.id)}
        disabled={isLoadingAction}
        className={`${base} hover:text-red-700 hover:bg-red-50`}
        title="Eliminar"
      >
        {isLoadingAction ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
        )}
        {showLabels && "Eliminar"}
      </button>
    </>
  );
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

  // Cerrar una vacante es irreversible desde la UI: "Publicar" solo reaparece
  // si el estado es SUSPENDED, nunca desde CLOSED. Por eso pedimos confirmación
  // aquí, con el mismo criterio que ya usa "Eliminar".
  const handleCloseClick = (job: Job) => {
    const confirmed = window.confirm(
      `¿Cerrar "${job.title}"? Dejará de recibir postulaciones y no podrás reabrirla desde aquí.`
    );
    if (confirmed) {
      onChangeStatus(job.id, "CLOSED");
    }
  };

  return (
    <>
      {/* ── RESPONSIVE: tarjetas por debajo de xl (1280px) ────────────────────
          La tabla de 6 columnas necesita ~740px libres. Con el sidebar de
          260px visible desde lg (1024px), a 1024px quedan ~650px y la columna
          Acciones (la última) se salía de pantalla. Por eso la tabla solo se
          usa desde xl; antes de eso cada empleo es una tarjeta con sus
          botones siempre visibles. */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:hidden">
        {jobs.map((job) => {
          const isLoadingAction = actionLoading === job.id;
          const newApplications = job.applications?.filter((a) => a.status === "PENDING").length ?? 0;
          const totalApps = job.applications?.length ?? 0;

          return (
            <div key={job.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 break-words text-sm font-semibold text-slate-900">{job.title}</p>
                <div className="shrink-0">{getStatusBadge(job.status)}</div>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </span>
                )}
                {job.createdAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(job.createdAt)}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {getSelectionModeBadge(job.selectionMode)}
                <span className="text-xs text-slate-500">
                  <span className="font-semibold text-[#1e3a8a]">{totalApps}</span> postulaciones
                  {newApplications > 0 && (
                    <span className="ml-1 font-medium text-emerald-600">({newApplications} nuevas)</span>
                  )}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <JobActions
                  job={job}
                  isLoadingAction={isLoadingAction}
                  onDelete={onDelete}
                  onChangeStatus={onChangeStatus}
                  onClose={handleCloseClick}
                  showLabels
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tabla: solo desde xl (1280px) ──────────────────────────────────── */}
      <div className="hidden overflow-x-auto xl:block">
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
                  <td className="py-4 pr-4">{getSelectionModeBadge(job.selectionMode)}</td>
                  <td className="py-4 pr-4">{getStatusBadge(job.status)}</td>
                  <td className="py-4 pr-4">
                    <span className="text-sm text-slate-500">{formatDate(job.createdAt)}</span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <JobActions
                        job={job}
                        isLoadingAction={isLoadingAction}
                        onDelete={onDelete}
                        onChangeStatus={onChangeStatus}
                        onClose={handleCloseClick}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
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