// features/compliance/components/LegalDocumentViewer.tsx
"use client";

import type { LegalDocumentVersion } from "../types/compliance.types";

// Renderizador mínimo de contenido: encabezados "## " y párrafos separados por línea en blanco.
function renderContent(content: string) {
  const blocks = content.split(/\n\n+/);
  return blocks.map((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={index}
          className="mt-8 mb-3 text-xl font-bold text-[#1B3A6B] first:mt-0"
        >
          {trimmed.replace(/^##\s+/, "")}
        </h2>
      );
    }
    return (
      <p key={index} className="mb-4 text-[15px] leading-7 text-slate-700">
        {trimmed.split(/\n/).map((line, i) => (
          <span key={i}>
            {line}
            {i < trimmed.split(/\n/).length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}

export function LegalDocumentViewer({ document }: { document: LegalDocumentVersion }) {
  return (
    <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
      <h1 className="text-2xl font-bold text-[#1B3A6B] sm:text-3xl">{document.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>Versión: {document.version}</span>
        <span aria-hidden>·</span>
        <span>Estado: Vigente</span>
      </div>
      <div className="mt-8 border-t border-slate-100 pt-6">{renderContent(document.content)}</div>
    </article>
  );
}
