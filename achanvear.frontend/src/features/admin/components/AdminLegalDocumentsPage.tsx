// features/admin/components/AdminLegalDocumentsPage.tsx
"use client";

import { useState } from "react";
import { Loader2, FilePlus2, CheckCircle2 } from "lucide-react";
import {
  useAdminLegalDocuments,
  useLegalDocumentHistory,
  useCreateLegalDocumentVersion,
  usePublishLegalDocumentVersion,
} from "../hooks/useAdminData";

const DOC_LABELS: Record<string, string> = { TERMS: "Términos y Condiciones", PRIVACY: "Política de Privacidad" };

export function AdminLegalDocumentsPage() {
  const [selectedType, setSelectedType] = useState<string>("TERMS");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ version: "", title: "", content: "" });

  const { data: documents, isLoading } = useAdminLegalDocuments();
  const { data: history, isLoading: historyLoading } = useLegalDocumentHistory(selectedType);

  const createMutation = useCreateLegalDocumentVersion();
  const publishMutation = usePublishLegalDocumentVersion();

  const currentDoc = documents?.find((doc) => doc.type === selectedType);

  const handleCreate = async () => {
    if (!form.version.trim() || !form.title.trim() || !form.content.trim()) return;
    await createMutation.mutateAsync({ type: selectedType, payload: form });
    setForm({ version: "", title: "", content: "" });
    setShowForm(false);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Documentos legales</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestión de versiones. Una versión aceptada no se elimina físicamente: queda como histórica.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1B3A6B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0EA5A0] transition-colors"
        >
          <FilePlus2 className="h-4 w-4" /> Nueva versión
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        {Object.keys(DOC_LABELS).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              selectedType === type ? "bg-[#1B3A6B] text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {DOC_LABELS[type]}
          </button>
        ))}
      </div>

      {isLoading && <Loader2 className="h-6 w-6 animate-spin text-[#1B3A6B]" />}

      {currentDoc && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400">Versión vigente</p>
          {currentDoc.currentVersion ? (
            <div className="mt-2">
              <p className="font-semibold text-slate-800">
                {currentDoc.currentVersion.title}{" "}
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  {currentDoc.currentVersion.status}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Versión {currentDoc.currentVersion.version}
                {currentDoc.currentVersion.publishedAt
                  ? ` · Publicado el ${new Date(currentDoc.currentVersion.publishedAt).toLocaleDateString("es-PE")}`
                  : ""}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Sin versión vigente publicada.</p>
          )}
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-slate-700">
            Crear versión para {DOC_LABELS[selectedType]}
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr]">
              <input
                value={form.version}
                onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
                placeholder="v2"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1B3A6B]"
              />
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Título del documento"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1B3A6B]"
              />
            </div>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Contenido (usa '## ' para encabezados y deja una línea en blanco entre párrafos). Pendiente de revisión legal."
              rows={8}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1B3A6B]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="rounded-xl bg-[#1B3A6B] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {createMutation.isPending ? "Guardando..." : "Guardar borrador"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Versión</th>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Publicado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {historyLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#1B3A6B]" />
                </td>
              </tr>
            ) : (
              history?.map((version) => (
                <tr key={version.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{version.version}</td>
                  <td className="px-4 py-3 text-slate-600">{version.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        version.status === "PUBLISHED"
                          ? "bg-emerald-100 text-emerald-700"
                          : version.status === "ARCHIVED"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {version.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {version.publishedAt ? new Date(version.publishedAt).toLocaleString("es-PE") : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {version.status === "DRAFT" && (
                      <button
                        onClick={() =>
                          publishMutation.mutate({ type: selectedType, versionId: version.id })
                        }
                        disabled={publishMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Publicar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

