"use client";

import { useState, useRef } from "react";
import { X, Loader2, Upload, Check, TrendingUp, FileText, AlertCircle, CheckCircle2, Bot, Send } from "lucide-react";
import { useSubmitProposal } from "../hooks/useProjects";
import type { Project } from "../types/freelance.types";
import { useRouter } from "next/navigation";
import { freelanceApi } from "@/features/freelance/api/freelanceApi";

type Step = 1 | 2 | 3;

interface ProposalModalProps {
  project: Project;
  onClose: () => void;
  onSuccess?: () => void;
}

function Stepper({ current }: { current: Step }) {
  const steps = [
    { n: 1 as Step, label: "Tu propuesta" },
    { n: 2 as Step, label: "Portfolio y CV" },
    { n: 3 as Step, label: "Confirmar" },
  ];
  return (
    <div className="flex items-start w-full">
      {steps.map((step, i) => {
        const done   = current > step.n;
        const active = current === step.n;
        return (
          <div key={step.n} className="flex items-start flex-1">
            <div className="flex flex-col items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all
                ${done || active ? "bg-[#1B3A6B] text-white" : "border-2 border-slate-200 bg-white text-slate-400"}`}>
                {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : step.n}
              </div>
              <span className={`mt-1.5 text-[11px] font-medium whitespace-nowrap
                ${active ? "text-[#1B3A6B]" : done ? "text-slate-500" : "text-slate-400"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mt-4 mx-1.5 transition-colors ${done ? "bg-[#1B3A6B]" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ProposalModal({ project, onClose, onSuccess }: ProposalModalProps) {
  const router = useRouter();
  const [step, setStep]               = useState<Step>(1);
  const [submitted, setSubmitted]     = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedBudget, setProposedBudget] = useState(project.minBudget ?? project.budget);
  const [estimatedDays, setEstimatedDays]   = useState(project.estimatedDays);
  const [cvFile, setCvFile]           = useState<File | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl]   = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { submit, isLoading, isError, error } = useSubmitProposal(project.id);

  // ── Estado del chat IA ─────────────────────────────────────────────────────
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const step1Valid = coverLetter.trim().length >= 100 && proposedBudget > 0 && estimatedDays > 0;

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("El archivo supera los 5MB permitidos."); return; }
    setCvFile(file);
  };

  const handleSubmit = () => {
    submit(
      { coverLetter: coverLetter.trim(), proposedBudget, estimatedDays },
      {
        onSuccess: () => {
          setSubmitted(true);
          onSuccess?.();
        },
      }
    );
  };

  // ── Función IA: autocompletar carta de presentación ──────────────────────
  const handleAiAssist = async () => {
    const trimmed = aiPrompt.trim();
    if (!trimmed || aiLoading) return;
    setAiLoading(true);
    try {
      const fullPrompt = `Proyecto: "${project.title}"
Descripción: ${project.description ?? ""}
Habilidades requeridas: ${(project.skills ?? []).join(", ")}

Mensaje del freelancer: ${trimmed}

Genera una carta de presentación personalizada para este proyecto.`;

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

  // ── Vista de éxito ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
        <div className="flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">

          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Enviar Propuesta</h2>
              <p className="mt-0.5 text-xs text-slate-500 truncate max-w-xs">{project.title}</p>
            </div>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors ml-4">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Contenido */}
          <div className="px-6 py-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
              <CheckCircle2 className="h-9 w-9 text-emerald-500" strokeWidth={1.75} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">¡Propuesta Enviada!</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-1">
              Tu propuesta para{" "}
              <span className="font-semibold text-slate-700">{project.title}</span>{" "}
              fue enviada exitosamente.
            </p>
            <p className="text-xs text-slate-400 mb-6">
              El cliente revisará tu propuesta y te contactará si está interesado.
            </p>

            {/* Resumen */}
            <div className="w-full rounded-xl bg-slate-50 border border-slate-100 px-5 py-4 mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Resumen de tu propuesta
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-left">
                  <p className="text-xs text-slate-400">Tu oferta</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    S/. {proposedBudget.toLocaleString()}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-400">Días de entrega</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{estimatedDays} días</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={() => { onClose(); router.push("/freelancer/projects"); }}
              className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Ver mis propuestas
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-[#1B3A6B] py-2.5 text-sm font-semibold text-white hover:bg-[#16305a] transition-colors"
            >
              Seguir explorando
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ── Wizard normal ─────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl max-h-[90vh]">

        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Enviar Propuesta</h2>
            <p className="mt-0.5 text-xs text-slate-500 truncate max-w-xs">{project.title}</p>
          </div>
          <div className="flex items-center gap-1 ml-4 flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowAiChat(!showAiChat)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-sm transition"
              title="Asistente IA"
            >
              <Bot className="w-4 h-4" />
            </button>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 pt-5 pb-3 flex-shrink-0">
          <Stepper current={step} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-4">

          {step === 1 && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Carta de presentación <span className="text-red-500">*</span>
                </label>
                <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6} maxLength={1000}
                  placeholder="Cuéntale al cliente por qué eres el freelancer ideal para este proyecto..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#0EA5A0] focus:ring-1 focus:ring-[#0EA5A0]/20 resize-none transition"
                />
                <div className="mt-1.5 flex items-center justify-between">
                  <p className={`text-xs ${coverLetter.length < 100 ? "text-amber-600" : "text-slate-400"}`}>
                    Mínimo 100 caracteres. Sé específico y profesional.
                  </p>
                  <span className="text-xs text-slate-400">{coverLetter.length}/1000</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                    Tu oferta económica (S/.) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" value={proposedBudget} onChange={(e) => setProposedBudget(Number(e.target.value))} min={1}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0EA5A0] focus:ring-1 focus:ring-[#0EA5A0]/20 transition" />
                  <p className="mt-1 text-xs text-slate-400">
                    Rango: S/. {(project.minBudget ?? project.budget).toLocaleString()}
                    {project.maxBudget ? ` - S/. ${project.maxBudget.toLocaleString()}` : ""}
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                    Días de entrega <span className="text-red-500">*</span>
                  </label>
                  <input type="number" value={estimatedDays} onChange={(e) => setEstimatedDays(Number(e.target.value))} min={1}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0EA5A0] focus:ring-1 focus:ring-[#0EA5A0]/20 transition" />
                  <p className="mt-1 text-xs text-slate-400">Plazo del cliente: {project.estimatedDays} días</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" strokeWidth={1.75} />
                <p className="text-xs text-amber-700 leading-relaxed">
                  El pago se gestionará a través del sistema de{" "}
                  <span className="font-semibold">Escrow Achanvear</span>. Solo recibirás el pago cuando el cliente confirme la entrega satisfactoria.
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Currículum Vitae (PDF) <span className="text-xs font-normal text-slate-400">— Opcional</span>
                </label>
                <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleCvChange} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className={`w-full rounded-xl border-2 border-dashed py-8 flex flex-col items-center gap-2 transition-colors
                    ${cvFile ? "border-[#0EA5A0] bg-[#0EA5A0]/5" : "border-slate-200 hover:border-slate-300 bg-slate-50"}`}>
                  {cvFile ? (
                    <><FileText className="h-7 w-7 text-[#0EA5A0]" strokeWidth={1.5} />
                      <span className="text-sm font-medium text-[#0EA5A0]">{cvFile.name}</span>
                      <span className="text-xs text-slate-400">{(cvFile.size / 1024 / 1024).toFixed(2)} MB — Click para cambiar</span></>
                  ) : (
                    <><Upload className="h-7 w-7 text-slate-400" strokeWidth={1.5} />
                      <span className="text-sm font-medium text-slate-600">Sube tu CV en PDF</span>
                      <span className="text-xs text-slate-400">Máximo 5MB</span></>
                  )}
                </button>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">URL de Portfolio</label>
                <input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://mi-portfolio.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#0EA5A0] focus:ring-1 focus:ring-[#0EA5A0]/20 transition" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">Perfil de LinkedIn</label>
                <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/tu-perfil"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#0EA5A0] focus:ring-1 focus:ring-[#0EA5A0]/20 transition" />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3 className="text-sm font-bold text-slate-900">Resumen de tu propuesta</h3>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Carta de presentación</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{coverLetter}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tu oferta</p>
                  <p className="text-lg font-bold text-slate-900">S/. {proposedBudget.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Días de entrega</p>
                  <p className="text-lg font-bold text-slate-900">{estimatedDays} días</p>
                </div>
              </div>
              {(cvFile || portfolioUrl || linkedinUrl) && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 space-y-1.5">
                  {cvFile && <p className="text-xs text-slate-600"><span className="font-semibold">CV:</span> {cvFile.name}</p>}
                  {portfolioUrl && <p className="text-xs text-slate-600"><span className="font-semibold">Portfolio:</span> {portfolioUrl}</p>}
                  {linkedinUrl && <p className="text-xs text-slate-600"><span className="font-semibold">LinkedIn:</span> {linkedinUrl}</p>}
                </div>
              )}
              <div className="flex items-start gap-3 rounded-xl border border-[#0EA5A0]/30 bg-[#0EA5A0]/5 px-4 py-3.5">
                <TrendingUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0EA5A0]" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-semibold text-[#0d8e89]">Protección Escrow Achanvear</p>
                  <p className="mt-0.5 text-xs text-[#0d8e89] leading-relaxed">
                    Si el cliente acepta tu propuesta, el pago quedará reservado en escrow y solo se liberará cuando ambas partes confirmen la entrega exitosa del proyecto.
                  </p>
                </div>
              </div>
              {isError && (
                <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600">
                  {(error as any)?.message ?? "Error al enviar la propuesta. Intenta de nuevo."}
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t border-slate-100 px-6 py-4 flex-shrink-0">
          {step === 1 && (
            <button type="button" onClick={() => setStep(2)} disabled={!step1Valid}
              className="w-full rounded-xl bg-[#1B3A6B] py-2.5 text-sm font-semibold text-white hover:bg-[#16305a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
             Siguiente
            </button>
          )}
          {step === 2 && (
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Atrás
              </button>
              <button type="button" onClick={() => setStep(3)}
                className="flex-1 rounded-xl bg-[#1B3A6B] py-2.5 text-sm font-semibold text-white hover:bg-[#16305a] transition-colors">
                Siguiente
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} disabled={isLoading}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40">
                Atrás
              </button>
              <button type="button" onClick={handleSubmit} disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] py-2.5 text-sm font-semibold text-white hover:bg-[#16305a] transition-colors disabled:opacity-40">
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</> : <><Check className="h-4 w-4" /> Enviar Propuesta</>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat IA que se abre al hacer clic en el ícono 🤖 */}
      {showAiChat && (
        <div className="fixed top-1/2 -translate-y-1/2 left-[calc(50%+286px)] z-[60]">
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
