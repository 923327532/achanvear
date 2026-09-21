// features/admin/components/AdminConsentsPage.tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAdminConsents } from "../hooks/useAdminData";

const TYPE_LABELS: Record<string, string> = {
  REGISTRATION_TERMS: "Términos (registro)",
  REGISTRATION_PRIVACY: "Privacidad (registro)",
  INTERVIEW_DATA_PROCESSING: "Tratamiento de datos (entrevista)",
  INTERVIEW_AI_EVALUATION: "Uso de IA (entrevista)",
  INTERVIEW_RECORDING: "Grabación (entrevista)",
};

export function AdminConsentsPage() {
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useAdminConsents({
    type: type || undefined,
    status: status || undefined,
    page,
    size: 10,
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Consentimientos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Evidencia de aceptación de documentos y consentimientos de entrevista. No modificable retroactivamente.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(0); }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">Todos los tipos</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="ACCEPTED">Aceptado</option>
            <option value="WITHDRAWN">Retirado</option>
          </select>
        </div>
      </div>

      {isError && <p className="mb-4 text-sm text-red-500">No se pudieron cargar los consentimientos.</p>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Entrevista</th>
              <th className="px-4 py-3">Versión</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha de aceptación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#1B3A6B]" />
                </td>
              </tr>
            ) : (
              data?.items.map((consent) => (
                <tr key={consent.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{TYPE_LABELS[consent.consentType] ?? consent.consentType}</td>
                  <td className="px-4 py-3 text-slate-500">{consent.userId.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-slate-500">{consent.interviewId ? consent.interviewId.slice(0, 8) + "..." : "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{consent.documentVersion ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        consent.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {consent.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(consent.acceptedAt).toLocaleString("es-PE")}
                  </td>
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
