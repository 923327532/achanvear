// features/interview/components/TheoryInterviewModal.tsx
"use client";

import { useState, useCallback } from "react";
import { useStartInterview, useSubmitAnswer, useCompleteInterview } from "../hooks/useFreelancerInterviews";
import { useAntiCheat } from "../hooks/useAntiCheat";
import type { QuestionResponse } from "../types/interview.types";

interface Props {
  interviewId: string;
  onClose: () => void;
  onComplete: () => void;
}

export function TheoryInterviewModal({ interviewId, onClose, onComplete }: Props) {
  const [step, setStep] = useState<"intro" | "question" | "completed" | "aborted">("intro");
  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null);
  const [answer, setAnswer] = useState("");
  const [violationCount, setViolationCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  const startMutation = useStartInterview();
  const submitMutation = useSubmitAnswer();
  const completeMutation = useCompleteInterview();

  const handleViolation = useCallback((count: number) => {
    setViolationCount(count);
  }, []);

  useAntiCheat({
    interviewId,
    onViolation: handleViolation,
    maxViolations: 3,
  });

  const handleStart = async () => {
    try {
      const session = await startMutation.mutateAsync(interviewId);
      if (session) {
        setStep("question");
        setCurrentQuestion({
          id: "first",
          content: "Bienvenido a la entrevista teorica. " + (session.interviewerName
            ? `Soy ${session.interviewerName}, tu entrevistador. `
            : "") + "Comencemos con la primera pregunta: Describe tu experiencia profesional y como se alinea con el puesto al que postulas.",
          audioUrl: null,
        });
      }
    } catch {
      // Error al iniciar
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setIsSubmitting(true);
    try {
      const nextQ = await submitMutation.mutateAsync({
        interviewId,
        payload: {
          questionId: currentQuestion?.id ?? "q1",
          answerContent: answer,
        },
      });
      setAnswer("");

      if (nextQ && nextQ.content) {
        setCurrentQuestion(nextQ);
      } else {
        // No hay mas preguntas, completar
        const report = await completeMutation.mutateAsync(interviewId);
        setResult({
          score: report.finalScore ?? 0,
          passed: report.passed ?? false,
        });
        setStep("completed");
        onComplete();
      }
    } catch {
      // Error al enviar
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAbort = async () => {
    setStep("aborted");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Entrevista Teorica</h2>
              <p className="text-xs text-slate-500">ID: {interviewId.slice(0, 8)}...</p>
            </div>
            {violationCount > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                Alertas: {violationCount}/3
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "intro" && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-[#1B3A6B] flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Entrevista Teorica</h3>
              <p className="text-sm text-slate-500 max-w-md">
                Un agente de IA te hara preguntas sobre tus conocimientos teoricos
                relacionados al puesto. Responde con claridad y precision.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left max-w-md">
                <p className="text-xs font-semibold text-amber-800 mb-1">Importante</p>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>No cambies de pestana durante la entrevista</li>
                  <li>Tienes un maximo de 3 alertas antes de que se aborte la sesion</li>
                  <li>Responde de manera clara y completa</li>
                </ul>
              </div>
              <button
                onClick={handleStart}
                disabled={startMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B3A6B] text-white text-sm font-bold hover:bg-[#162f58] transition disabled:opacity-50"
              >
                {startMutation.isPending ? "Iniciando..." : "Comenzar Entrevista"}
              </button>
            </div>
          )}

          {step === "question" && currentQuestion && (
            <div className="space-y-6">
              {/* Pregunta */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-xs font-bold">
                    IA
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Agente de IA</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">{currentQuestion.content}</p>
              </div>

              {/* Respuesta */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Tu respuesta</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Escribe tu respuesta aqui..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Acciones */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim() || isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1B3A6B] text-white text-sm font-bold hover:bg-[#162f58] transition disabled:opacity-50"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Respuesta"}
                </button>
                <button
                  onClick={handleAbort}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition"
                >
                  Abortar
                </button>
              </div>
            </div>
          )}

          {step === "completed" && result && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className={`w-20 h-20 rounded-2xl ${result.passed ? "bg-emerald-100" : "bg-amber-100"} flex items-center justify-center`}>
                <svg className={`w-10 h-10 ${result.passed ? "text-emerald-600" : "text-amber-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {result.passed ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  )}
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {result.passed ? "Entrevista Completada" : "Entrevista Finalizada"}
              </h3>
              <p className="text-sm text-slate-500">
                {result.passed
                  ? "Has aprobado la entrevista teorica. Pasas a la siguiente etapa."
                  : "No has alcanzado el puntaje minimo requerido."}
              </p>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#1B3A6B]">{result.score}/100</p>
                <p className="text-xs text-slate-500 mt-1">Puntaje obtenido</p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B3A6B] text-white text-sm font-bold hover:bg-[#162f58] transition"
              >
                Cerrar
              </button>
            </div>
          )}

          {step === "aborted" && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-red-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Entrevista Abortada</h3>
              <p className="text-sm text-slate-500">La sesion ha sido abortada.</p>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B3A6B] text-white text-sm font-bold hover:bg-[#162f58] transition"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
