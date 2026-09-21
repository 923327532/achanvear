// features/admin/components/AdminAuditPage.tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAdminAuditLogs } from "../hooks/useAdminData";

const ACTION_LABELS: Record<string, string> = {
  USER_STATUS_CHANGE: "Cambio de estado de usuario",
  LEGAL_DOCUMENT_CREATE: "Creación de documento legal",
  LEGAL_DOCUMENT_PUBLISH: "Publicación de documento legal",
  CONSENT_VIEW: "Consulta de consentimientos",
  INTERVIEW_VIEW: "Consulta de entrevistas",
  METRICS_VIEW: "Consulta de métricas",
};

export function AdminAuditPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useAdminAuditLogs({ page, size: 10 });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B3A6B]">Auditoría</h1>
        <p className="mt-1 text-sm text-slate-500">
          Registro de acciones administrativas relevantes (no modificable).
        </p>
      </div>

      {isError && <p className="mb-4 text-sm text-red-500">No se pudieron cargar los registros de auditoría.</p>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Acción</th>
              <th className="px-4 py-3">Recurso</th>
              <th className="px-4 py-3">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#1B3A6B]" />
                </td>
              </tr>
            ) : (
              data?.items.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(log.createdAt).toLocaleString("es-PE")}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {log.adminUserId.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {log.resourceType} {log.resourceId ? `(${log.resourceId.slice(0, 8)}...)` : ""}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.metadata ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>Página {data.page + 1} de {data.totalPages} · {data.totalItems} registros</span>
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
