// features/jobs/components/ApplicationModal.tsx
"use client";

import { useState, useRef } from "react";
import { X, Loader2, Upload, CheckCircle2, Info, Bot, Send } from "lucide-react";
import { useApplyJob } from "../hooks/useApplyJob";
import type { Job } from "../types/job.types";
import { freelanceApi } from "@/features/freelance/api/freelanceApi";

interface ApplicationModalProps {
  job: Job;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ApplicationModal({ job, onClose, onSuccess }: ApplicationModalProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { apply, isLoading, isError, error } = useApplyJob(job.id);

  // ── Estado del chat IA ─────────────────────────────────────────────────────
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const companyName = job.company?.tradeName || job.company?.businessName;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") setCvFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") setCvFile(file);
  };

  // ── Función IA: autocompletar carta de presentación ──────────────────────
  const handleAiAssist = async () => {
    const trimmed = aiPrompt.trim();
    if (!trimmed || aiLoading) return;
    setAiLoading(true);
    try {
      const fullPrompt = `Puesto: "${job.title}"
Empresa: ${companyName}
Descripción: ${job.description ?? ""}
Habilidades requeridas: ${(job.skills ?? []).join(", ")}

Mensaje del freelancer: ${trimmed}

Genera una carta de presentación personalizada basada en esta información.`;

      const suggestion = await freelanceApi.aiSuggestProposal(fullPrompt);
      if (suggestion.coverLetter) setCoverLetter(suggestion.coverLetter);
      setAiPrompt("");
      setShowAiChat(false);
    } catch {
      // Silencio
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = () => {
    setValidationError(null);
    if (coverLetter.trim().length < 50) {
      setValidationError("La carta de presentación debe tener al menos 50 caracteres.");
      return;
    }

    apply(
      { cvUrl: "", coverLetter: coverLetter.trim() },
      {
        onSuccess: () => {
          setSubmitted(true);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="relative flex w-full max-w-md flex-col rounded-2xl bg-white shadow-xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900">Postular a Empleo</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowAiChat(!showAiChat)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-sm transition"
              title="Asistente IA"
            >
              <Bot className="w-4 h-4" />
            </button>
            <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── Vista de éxito ── */}
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">¡Postulación enviada!</p>
                <p className="mt-1 text-sm text-slate-500">
                  Tu postulación a <span className="font-semibold">{job.title}</span> fue enviada correctamente.
                  Nuestro Agente IA la evaluará pronto.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 rounded-xl bg-[#1B3A6B] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#162f58] transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              {/* Job info */}
              <div>
                <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                <p className="text-xs text-slate-500">{companyName}</p>
              </div>

          {/* CV Upload */}
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-700">CV / Currículum</p>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                dragActive ? "border-[#1B3A6B] bg-blue-50" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {cvFile ? (
                <div className="flex flex-col items-center gap-2 text-[#0EA5A0]">
                  <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
                  <p className="text-xs font-semibold text-slate-800">{cvFile.name}</p>
                  <p className="text-xs text-slate-400">{(cvFile.size / 1024).toFixed(0)} KB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
                  <p className="text-xs text-slate-500">
                    Arrastra tu CV aquí o haz clic para seleccionar
                  </p>
                </div>
              )}
            </div>
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Seleccionar archivo
              </button>
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            </div>
          </div>

          {/* Cover letter */}
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-700">
              Carta de Presentación
            </p>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Cuéntanos por qué eres el candidato ideal para este puesto..."
              className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none transition resize-none ${
                coverLetter.trim().length > 0 && coverLetter.trim().length < 50
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-[#1B3A6B]"
              }`}
            />
            {/* Indicador de caracteres */}
            <div className="flex items-center justify-between mt-1">
              <p className={`text-[10px] ${
                coverLetter.trim().length > 0 && coverLetter.trim().length < 50
                  ? "text-red-500"
                  : "text-slate-400"
              }`}>
                {coverLetter.trim().length < 50
                  ? `Mínimo 50 caracteres (${coverLetter.trim().length}/50)`
                  : `${coverLetter.length}/1000 caracteres`
                }
              </p>
            </div>
          </div>


          {/* Info IA */}
          <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
            <Info className="h-4 w-4 flex-shrink-0 text-blue-500 mt-0.5" strokeWidth={1.5} />
            <p className="text-xs text-blue-700">
              Tu postulación será evaluada primero por nuestro Agente IA. Si pasas el screening, recibirás una invitación para la entrevista.
            </p>
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-700">
              {validationError}
            </div>
          )}

          {/* Error del backend */}
          {isError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-xs text-red-600">
              {(error as any)?.message ?? "Error al postular. Intenta de nuevo."}
            </div>
          )}
            </>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="flex gap-3 border-t border-slate-100 px-6 py-4 flex-shrink-0">
            <button type="button" onClick={onClose} disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40">
              Cancelar
            </button>
            <button type="button" onClick={handleSubmit} disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] py-2.5 text-sm font-semibold text-white hover:bg-[#162f58] transition-colors disabled:opacity-40">
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
              ) : "Enviar Postulación"}
            </button>
          </div>
        )}
      </div>

      {/* Chat IA que se abre al hacer clic en el ícono 🤖 */}
      {showAiChat && (
        <div className="fixed top-1/2 -translate-y-1/2 left-[calc(50%+256px)] z-[60]">
          <div className="w-[340px] bg-white rounded-2xl border border-blue-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="text-sm font-semibold">Asistente IA</span>
              </div>
              <button type="button" onClick={() => setShowAiChat(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 py-5 bg-blue-50/50">
              <p className="text-xs text-blue-600 leading-relaxed mb-3 font-medium">
                Describe tu experiencia y la IA autocompletará tu carta de presentación.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiAssist(); } }}
                  placeholder="Ej: tengo 3 años en Python..."
                  disabled={aiLoading}
                  className="flex-1 h-10 px-3 rounded-lg border border-blue-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleAiAssist}
                  disabled={!aiPrompt.trim() || aiLoading}
                  className="shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {aiLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
