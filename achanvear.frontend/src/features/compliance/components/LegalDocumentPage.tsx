// features/compliance/components/LegalDocumentPage.tsx
"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, ChevronRight, Fingerprint, ShieldCheck } from "lucide-react";
import { useLegalDocument } from "../hooks/useLegalDocument";
import { LegalDocumentViewer } from "./LegalDocumentViewer";
import { academicLegalContent, LEGAL_SOURCES, ACADEMIC_CONTACT } from "../content/academicLegalContent";

export function LegalDocumentPage({ type }: { type: "TERMS" | "PRIVACY" }) {
  const content = academicLegalContent[type];
  const { data, isLoading, isError, refetch } = useLegalDocument(type);
  return (
    <div className="bg-[#f7f9fa] text-slate-700">
      <header className="relative overflow-hidden bg-[#102c46] text-white">
        <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full border-[60px] border-teal-300/10" />
        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          {type !== "TERMS" && <nav aria-label="Documentos de Achanvear" className="mb-10 flex flex-wrap gap-5 text-xs">
            <Link href="/nosotros" className="text-slate-300 hover:text-white">Nosotros</Link>
            <Link href="/terms" className="text-slate-300 hover:text-white">Términos y condiciones</Link>
            <Link href="/privacy" aria-current={type === "PRIVACY" ? "page" : undefined} className={type === "PRIVACY" ? "text-teal-300" : "text-slate-300 hover:text-white"}>Privacidad</Link>
          </nav>}
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-teal-300">Achanvear / {content.label}</p>
          <h1 className="mt-5 whitespace-pre-line text-3xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">{content.title}</h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{content.lead}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-slate-300"><span className="rounded-full border border-teal-200/25 bg-teal-300/10 px-3 py-1.5 text-teal-200">Información legal de Achanvear</span><span>Actualizada el 25 de octubre de 2026</span></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:py-14">
        <aside className="hidden lg:block"><nav aria-label="En esta página" className="rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24"><p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Lectura con contexto</p><div className="flex flex-col gap-1">{content.sections.map(section => <a key={section.id} href={`#${section.id}`} className="rounded-lg px-2 py-2 text-xs leading-5 text-slate-600 transition hover:bg-teal-50 hover:text-teal-800">{section.title}</a>)}<a href="#fuentes" className="mt-3 border-t border-slate-100 px-2 pt-4 text-xs font-semibold text-teal-700">Fuentes oficiales ↗</a></div></nav></aside>
        <div className="min-w-0 max-w-3xl">
          <div className="mb-10 flex gap-4 rounded-2xl border border-teal-200 bg-teal-50/60 p-5"><ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-teal-700" /><div><h2 className="text-sm font-semibold text-[#102c46]">Reglas claras para trabajar con confianza.</h2><p className="mt-2 text-sm leading-7 text-slate-600">Aquí puedes conocer las condiciones del servicio y el tratamiento de tus datos. Las aceptaciones registradas conservan la versión que les corresponde. <a href="#documento-publicado" className="font-medium text-teal-800 underline underline-offset-4">Consulta el documento publicado.</a></p></div></div>
          {type === "PRIVACY" && <div className="mb-10 grid gap-3 sm:grid-cols-2">{[{ title: "DNI", text: "Identidad de una persona", detail: "Dato personal; puede contrastarse con un proveedor externo." }, { title: "RUC", text: "Identificación del contribuyente", detail: "El formato no acredita una validación tributaria ante SUNAT." }].map(item => <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5"><Fingerprint className="h-5 w-5 text-teal-700" /><p className="mt-4 text-2xl font-semibold tracking-tight text-[#102c46]">{item.title}</p><p className="mt-1 text-sm font-medium">{item.text}</p><p className="mt-3 text-xs leading-6 text-slate-500">{item.detail}</p></div>)}</div>}
          <article className="space-y-9">{content.sections.map(section => <section key={section.id} id={section.id} className="scroll-mt-24 border-b border-slate-200 pb-9"><h2 className="text-xl font-semibold tracking-tight text-[#102c46]">{section.title}</h2><div className="mt-4 space-y-4">{section.paragraphs.map((paragraph, index) => <p key={index} className="text-sm leading-8 text-slate-600 sm:text-[15px]">{paragraph}</p>)}</div>{section.points && <ul className="mt-5 space-y-3 rounded-xl bg-white p-5">{section.points.map(point => <li key={point} className="flex gap-3 text-sm leading-7 text-slate-600"><ChevronRight className="mt-1.5 h-4 w-4 shrink-0 text-teal-600" />{point}</li>)}</ul>}</section>)}</article>
          <section id="fuentes" className="mt-10 scroll-mt-24"><div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-teal-700" /><h2 className="text-xl font-semibold text-[#102c46]">Ve a la fuente.</h2></div><p className="mt-3 text-sm leading-7 text-slate-500">Referencias oficiales para distinguir nuestras reglas de las normas del Estado peruano.</p><div className="mt-5 space-y-3">{LEGAL_SOURCES.map(source => <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer" className="group block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-teal-300"><div className="flex justify-between gap-3"><p className="text-sm font-semibold text-[#102c46]">{source.title}</p><ArrowUpRight className="h-4 w-4 shrink-0 text-teal-700" /></div><p className="mt-1 text-xs text-teal-700">({source.citation})</p><p className="mt-3 text-xs leading-6 text-slate-500">{source.detail}</p></a>)}</div></section>
          <section className="mt-10 rounded-2xl bg-[#102c46] p-6 text-white"><p className="text-xs font-medium uppercase tracking-widest text-teal-200">Contacto del equipo</p><h2 className="mt-3 text-lg font-semibold">Tu pregunta merece una respuesta.</h2><p className="mt-3 text-sm leading-7 text-slate-300">Para consultas sobre estas condiciones, privacidad o derechos sobre tus datos, escribe al equipo de Achanvear.</p><a href={`mailto:${ACADEMIC_CONTACT}?subject=Privacidad%20Achanvear`} className="mt-5 inline-flex items-center gap-2 break-all text-sm font-semibold text-teal-200 hover:text-white">{ACADEMIC_CONTACT}<ArrowUpRight className="h-4 w-4 shrink-0" /></a></section>
          <section id="documento-publicado" className="mt-10 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="text-base font-semibold text-[#102c46]">Documento publicado y consentimientos</h2><p className="mt-2 text-sm leading-7 text-slate-500">La versión publicada se conserva con su identificador. Las actualizaciones de esta página no modifican las aceptaciones que ya registraste.</p>{isLoading ? <p role="status" className="mt-4 text-xs text-slate-500">Consultando la versión publicada…</p> : isError || !data ? <div className="mt-4 text-sm text-slate-500">No pudimos recuperar la versión publicada. <button type="button" onClick={() => refetch()} className="font-semibold text-teal-700 underline">Reintentar</button></div> : <details className="mt-4"><summary className="cursor-pointer text-sm font-semibold text-teal-800">Leer versión {data.version}</summary><div className="mt-5"><LegalDocumentViewer document={data} embedded /></div></details>}</section>
        </div>
      </div>
    </div>
  );
}
