// features/compliance/components/LegalDocumentViewer.tsx
"use client";

import type { LegalDocumentVersion } from "../types/compliance.types";

// Renderizador mínimo de contenido: encabezados "## " y párrafos separados por línea en blanco.
function cleanText(text: string) {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/__([^_]+)__/g, "$1").replace(/`([^`]+)`/g, "$1");
}

function renderContent(content: string) {
  const blocks = content.replace(/\r\n/g, "\n").split(/\n\n+/);
  return blocks.map((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (/^#{1,6}\s/.test(trimmed)) {
      return (
        <h2
          key={index}
          className="mt-8 mb-3 text-xl font-bold text-[#1B3A6B] first:mt-0"
        >
          {cleanText(trimmed.replace(/^#{1,6}\s+/, ""))}
        </h2>
      );
    }
    return (
      <p key={index} className="mb-4 text-[15px] leading-7 text-slate-700">
        {trimmed.split(/\n/).map((line, i) => (
          <span key={i}>
            {cleanText(line.replace(/^#{1,6}\s+/, ""))}
            {i < trimmed.split(/\n/).length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}

export function LegalDocumentViewer({ document, embedded = false }: { document: LegalDocumentVersion; embedded?: boolean }) {
  const Heading = embedded ? "h2" : "h1";
  const status = document.status === "PUBLISHED" ? "Publicado" : document.status === "DRAFT" ? "En revisión" : "Archivado";
  return (
    <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
      <Heading className="text-2xl font-semibold tracking-tight text-[#1B3A6B] sm:text-3xl">{cleanText(document.title)}</Heading>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>Versión: {document.version}</span>
        <span aria-hidden>·</span>
        <span>Estado: {status}</span>
      </div>
      <div className="mt-8 border-t border-slate-100 pt-6">{renderContent(document.content)}</div>
    </article>
  );
}
