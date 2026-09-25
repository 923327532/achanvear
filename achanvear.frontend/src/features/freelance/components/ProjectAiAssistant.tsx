// features/freelance/components/ProjectAiAssistant.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Loader2, Bot } from "lucide-react";
import { freelanceApi } from "../api/freelanceApi";
import type { ProjectAiSuggestion } from "../api/freelanceApi";

interface ProjectAiAssistantProps {
  onApplySuggestion: (suggestion: ProjectAiSuggestion) => void;
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ProjectAiAssistant({ onApplySuggestion }: ProjectAiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hola! Soy tu asistente IA para crear proyectos freelance. Describe el proyecto que necesitas y te ayudare a generar la descripcion, presupuesto, habilidades y mas.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSuggestion, setLastSuggestion] = useState<ProjectAiSuggestion | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setPrompt("");
    setIsLoading(true);

    try {
      const suggestion = await freelanceApi.aiSuggest(trimmed);
      setLastSuggestion(suggestion);

      // AUTOMATICAMENTE aplicar la sugerencia al formulario
      onApplySuggestion(suggestion);

      const parts: string[] = [];
      if (suggestion.title) parts.push(`**Titulo:** ${suggestion.title}`);
      if (suggestion.category) parts.push(`**Categoria:** ${suggestion.category}`);
      if (suggestion.subcategory) parts.push(`**Especialidad:** ${suggestion.subcategory}`);
      if (suggestion.description) {
        parts.push(`\n**Descripcion:**\n${suggestion.description}`);
      }
      if (suggestion.skills) parts.push(`**Habilidades:** ${suggestion.skills}`);
      if (suggestion.experienceLevel) parts.push(`**Experiencia:** ${suggestion.experienceLevel}`);
      if (suggestion.budget != null) parts.push(`**Presupuesto:** S/. ${suggestion.budget}`);
      if (suggestion.minBudget != null && suggestion.maxBudget != null) {
        parts.push(`**Rango:** S/. ${suggestion.minBudget} - S/. ${suggestion.maxBudget}`);
      }
      if (suggestion.estimatedDays != null) parts.push(`**Duracion:** ${suggestion.estimatedDays} dias`);
      if (suggestion.modality) parts.push(`**Modalidad:** ${suggestion.modality}`);
      parts.push("\n*Los campos ya fueron autocompletados. Puedes ajustarlos si es necesario.*");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: parts.join("\n\n"),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Lo siento, ocurrio un error al generar la sugerencia. Intenta de nuevo con una descripcion mas detallada.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleApply = () => {
    if (lastSuggestion) {
      onApplySuggestion(lastSuggestion);
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {/* Boton flotante tipo WhatsApp */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {/* Modal del asistente */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] max-w-[380px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold text-sm">Asistente IA</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-[320px] overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generando sugerencia...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Boton aplicar sugerencia */}
          {lastSuggestion && !isLoading && (
            <div className="px-4 py-2 border-t border-slate-100 bg-blue-50/50">
              <button
                onClick={handleApply}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
              >
                <Sparkles className="w-4 h-4" />
                Aplicar sugerencia al formulario
              </button>
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-200 bg-white">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej: app web con react, 30 dias, remoto..."
              disabled={isLoading}
              className="flex-1 h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!prompt.trim() || isLoading}
              className="shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
