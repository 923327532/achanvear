// features/services/components/DraftsTab.tsx
"use client";

import { Loader2, FileText, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMyDrafts, useDeleteService } from "../hooks/useMyServices";
import { CATEGORY_LABELS } from "../types/service.types";

export function DraftsTab() {
  const router = useRouter();
  const { drafts, isLoading } = useMyDrafts();
  const { removeAsync, isLoading: isDeleting } = useDeleteService();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#0EA5A0] animate-spin" />
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="text-sm text-gray-400">No tienes borradores guardados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {drafts.map((draft) => (
        <div
          key={draft.id}
          className="bg-white border border-amber-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">{draft.title}</span>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Borrador
                </span>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {CATEGORY_LABELS[draft.category]}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Última edición: {new Date(draft.updatedAt).toLocaleDateString("es-PE")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/freelancer/my-services/${draft.id}/edit`)}
              className="flex items-center gap-1.5 text-xs font-medium text-[#1B3A6B] border border-[#1B3A6B]/20 px-3 py-1.5 rounded-lg hover:bg-[#1B3A6B]/5 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Continuar editando
            </button>
            <button
              onClick={() => removeAsync(draft.id)}
              disabled={isDeleting}
              className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}