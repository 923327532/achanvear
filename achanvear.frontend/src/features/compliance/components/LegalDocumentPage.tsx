// features/compliance/components/LegalDocumentPage.tsx
"use client";

import { Loader2 } from "lucide-react";
import { useLegalDocument } from "../hooks/useLegalDocument";
import { LegalDocumentViewer } from "./LegalDocumentViewer";

export function LegalDocumentPage({ type }: { type: "TERMS" | "PRIVACY" }) {
  const { data, isLoading, isError, error } = useLegalDocument(type);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B3A6B]" />
      </div>
    );
  }

  if (isError || !data) {
    const message =
      error instanceof Error && error.message ? error.message : "No se pudo cargar el documento.";
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-800">Documento no disponible</h1>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 px-4 py-10 sm:px-6">
      <LegalDocumentViewer document={data} />
    </div>
  );
}
