// features/interview/components/TechnicalInterviewModal.tsx
"use client";

import { useState, useCallback } from "react";
import { useStartInterview, useSubmitAnswer, useCompleteInterview } from "../hooks/useFreelancerInterviews";
import { useAntiCheat } from "../hooks/useAntiCheat";

interface Props {
  interviewId: string;
  onClose: () => void;
  onComplete: () => void;
}

export function TechnicalInterviewModal({ interviewId, onClose, onComplete }: Props) {
  const [step, setStep] = useState<"intro" | "challenge" | "completed" | "aborted">("intro");
  const [challenge, setChallenge] = useState<string>("");
  const [solution, setSolution] = useState("");
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
        setStep("challenge");
        setChallenge(
          "Resuelve el siguiente problema:\n\n" +
          "Escribe una funcion que reciba un arreglo de numeros enteros y devuelva " +
          "el numero que mas se repite. Si hay empate, devuelve el numero mas pequeno.\n\n" +
          "Ejemplo:\n" +
          "Input: [1, 3, 2, 3, 4, 1, 3, 2, 1]\n" +
          "Output: 1 (se repite 3 veces, igual que 3, pero 1 es menor)\n\n" +
          "Explica tu solucion y su complejidad temporal."
        );
      }
    } catch {
      // Error al iniciar
    }
  };

  const handleSubmitSolution = async () => {
    if (!solution.trim()) return;
    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync({
        interviewId,
        payload: {
          questionId: "technical-challenge",
          answerContent: solution,
        },
      });

      const report = await completeMutation.mutateAsync(interviewId);
      setResult({
        score: report.finalScore ?? 0,
        passed: report.passed ?? false,
      });
      setStep("completed");
      onComplete();
    } catch {
      // Error
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

      <div className="relative w-full max-w-3xl mx-4 bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Entrevista Tecnica</h2>
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Entrevista Tecnica</h3>
              <p className="text-sm text-slate-500 max-w-md">
                Resuelve un caso practico relacionado a tu area. Demuestra tus habilidades
                tecnicas y capacidad de resolucion de problemas.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left max-w-md">
                <p className="text-xs font-semibold text-amber-800 mb-1">Importante</p>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>Tu pantalla sera grabada durante la entrevista</li>
                  <li>No cambies de pestana ni minimices la ventana</li>
                  <li>Tienes un maximo de 3 alertas antes de abortar</li>
                  <li>Explica tu razonamiento paso a paso</li>
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

          {step === "challenge" && (
            <div className="space-y-6">
              {/* Reto */}
              <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold">
                    RETO
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Caso Practico</span>
                </div>
                <pre className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">{challenge}</pre>
              </div>

              {/* Solucion */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Tu solucion</label>
                <textarea
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Escribe tu solucion aqui, incluye codigo y explicacion..."
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] resize-none font-mono"
                  disabled={isSubmitting}
                />
              </div>

              {/* Acciones */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmitSolution}
                  disabled={!solution.trim() || isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1B3A6B] text-white text-sm font-bold hover:bg-[#162f58] transition disabled:opacity-50"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Solucion"}
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
                {result.passed ? "Entrevista Tecnica Completada" : "Entrevista Finalizada"}
              </h3>
              <p className="text-sm text-slate-500">
                {result.passed
                  ? "Has aprobado la entrevista tecnica. El proceso continua."
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
              <p className="text-sm text-slate-500">La sesion ha sido abortada por violaciones de seguridad.</p>
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
