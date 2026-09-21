// features/freelance/components/ProposalModal.tsx
"use client";

import { useState } from "react";
import { X, Loader2, Info, Bot, Send } from "lucide-react";
import { useSubmitProposal } from "../hooks/useProjects";
import type { Project } from "../types/freelance.types";
import { freelanceApi } from "../api/freelanceApi";

interface ProposalModalProps {
  project: Project;
  onClose: () => void;
  onSuccess?: () => void;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  PEN: "S/.",
  USD: "$",
};

export function ProposalModal({ project, onClose, onSuccess }: ProposalModalProps) {
  const currencySymbol = CURRENCY_SYMBOLS[project.currency ?? "PEN"] ?? "S/.";
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedBudget, setProposedBudget] = useState(project.budget);
  const [estimatedDays, setEstimatedDays] = useState(project.estimatedDays);
  const { submit, isLoading, isError, error } = useSubmitProposal(project.id);

  // ── Estado del chat IA ─────────────────────────────────────────────────────
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleSubmit = () => {
    if (!coverLetter.trim()) return;
    submit(
      { coverLetter: coverLetter.trim(), proposedBudget, estimatedDays },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  // ── Función IA: autocompletar campos ──────────────────────────────────────
  const handleAiAssist = async () => {
    const trimmed = aiPrompt.trim();
    if (!trimmed || aiLoading) return;
    setAiLoading(true);
    try {
      const fullPrompt = `Proyecto: "${project.title}"
Descripción: ${project.description}
Presupuesto del cliente: S/. ${project.budget}
Plazo del cliente: ${project.estimatedDays} días

Mensaje del freelancer: ${trimmed}

Genera una propuesta personalizada basada en esta información.`;

      const suggestion = await freelanceApi.aiSuggestProposal(fullPrompt);
      if (suggestion.coverLetter) setCoverLetter(suggestion.coverLetter);
      if (suggestion.proposedBudget > 0) setProposedBudget(suggestion.proposedBudget);
      if (suggestion.estimatedDays > 0) setEstimatedDays(suggestion.estimatedDays);
      setAiPrompt("");
      setShowAiChat(false);
    } catch {
      // Silencio
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="flex w-full max-w-md flex-col rounded-2xl bg-white shadow-xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">Enviar Propuesta</h2>
            <button
              type="button"
              onClick={() => setShowAiChat(!showAiChat)}
              className="p-1 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"
              title="Asistente IA"
            >
              <Bot className="w-4 h-4" />
            </button>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Project info */}
          <div>
            <p className="text-sm font-semibold text-slate-900">{project.title}</p>
            <p className="text-xs text-slate-500">Presupuesto cliente: {currencySymbol} {project.budget.toLocaleString("es-PE")}</p>
          </div>

          {/* Proposed budget */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Tu presupuesto (S/.) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={proposedBudget}
              onChange={(e) => setProposedBudget(Number(e.target.value))}
              min={1}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0EA5A0]"
            />
          </div>

          {/* Estimated days */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Días estimados de entrega <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(Number(e.target.value))}
              min={1}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0EA5A0]"
            />
          </div>

          {/* Cover letter */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Carta de presentación <span className="text-red-500">*</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
              maxLength={1000}
              placeholder="Explica por qué eres el candidato ideal para este proyecto..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#0EA5A0] resize-none"
            />
            <p className="mt-1 text-right text-xs text-slate-400">{coverLetter.length}/1000</p>
          </div>

          {/* Info escrow */}
          <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
            <Info className="h-4 w-4 flex-shrink-0 text-blue-500 mt-0.5" strokeWidth={1.5} />
            <p className="text-xs text-blue-700">
              Si el cliente acepta tu propuesta, el pago quedará en Escrow (fideicomiso) hasta que completes los hitos acordados.
            </p>
          </div>

          {/* Error */}
          {isError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-xs text-red-600">
              {(error as any)?.message ?? "Error al enviar la propuesta. Intenta de nuevo."}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-100 px-6 py-4 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !coverLetter.trim()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0EA5A0] py-2.5 text-sm font-semibold text-white hover:bg-[#0d9090] transition-colors disabled:opacity-40"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
            ) : "Enviar Propuesta"}
          </button>
        </div>
      </div>

      {/* Chat IA que se abre al hacer clic en el ícono 🤖 */}
      {showAiChat && (
        <div className="absolute bottom-20 right-4 w-[300px] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-[70]">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span className="text-sm font-semibold">Asistente IA</span>
            </div>
            <button type="button" onClick={() => setShowAiChat(false)} className="p-1 rounded-lg hover:bg-white/20 transition">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="px-4 py-4 bg-slate-50">
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Describe tu experiencia y la IA autocompletará los campos de tu propuesta.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiAssist(); } }}
                placeholder="Ej: tengo 5 años en React..."
                disabled={aiLoading}
                className="flex-1 h-9 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleAiAssist}
                disabled={!aiPrompt.trim() || aiLoading}
                className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
