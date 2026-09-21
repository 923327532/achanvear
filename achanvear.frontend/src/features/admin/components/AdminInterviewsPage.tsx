// features/admin/components/AdminInterviewsPage.tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAdminInterviews } from "../hooks/useAdminData";

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-sky-100 text-sky-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  ABORTED: "bg-red-100 text-red-700",
  BLOCKED: "bg-slate-200 text-slate-600",
};

export function AdminInterviewsPage() {
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useAdminInterviews({
    status: status || undefined,
    type: type || undefined,
    page,
    size: 10,
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Supervisión de entrevistas</h1>
          <p className="mt-1 text-sm text-slate-500">Estado, tipo, resultado e incidencias anti-cheat.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="SCHEDULED">Programada</option>
            <option value="IN_PROGRESS">Iniciada</option>
            <option value="COMPLETED">Completada</option>
            <option value="ABORTED">Cancelada</option>
            <option value="BLOCKED">Bloqueada</option>
          </select>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(0); }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">Todos los tipos</option>
            <option value="THEORY">Teórica</option>
            <option value="TECHNICAL">Técnica / Práctica</option>
          </select>
        </div>
      </div>

      {isError && <p className="mb-4 text-sm text-red-500">No se pudieron cargar las entrevistas.</p>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Candidato</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Resultado</th>
              <th className="px-4 py-3">Incidencias</th>
              <th className="px-4 py-3">IA</th>
              <th className="px-4 py-3">Grabación (S3)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#1B3A6B]" />
                </td>
              </tr>
            ) : (
              data?.items.map((interview) => (
                <tr key={interview.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{interview.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-slate-600">{interview.candidateId.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-slate-700">{interview.interviewType === "THEORY" ? "Teórica" : "Técnica"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[interview.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {interview.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{interview.score ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{interview.result ?? "—"}</td>
                  <td className="px-4 py-3">
                    {interview.totalViolations > 0 ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        {interview.totalViolations}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{interview.usedAi ? "Sí" : "No"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{interview.recordingFileKey ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>Página {data.page + 1} de {data.totalPages} · {data.totalItems} entrevistas</span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              disabled={page >= data.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

