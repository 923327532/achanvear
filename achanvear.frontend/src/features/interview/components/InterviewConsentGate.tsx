// features/interview/components/InterviewConsentGate.tsx
// Pantalla de consentimiento específico previo a la entrevista.
// Componente de presentación: muestra la información, recibe la decisión del usuario
// y emite el evento de aceptación al hook/caso de uso del frontend.
"use client";

import { useState } from "react";
import { Loader2, Mic, ShieldCheck, Brain, Camera, Info } from "lucide-react";
import type { RecordInterviewConsentPayload } from "../types/interview.types";

interface InterviewConsentGateProps {
  interviewType: "THEORY" | "TECHNICAL";
  isSubmitting?: boolean;
  error?: string | null;
  onAccept: (payload: RecordInterviewConsentPayload) => void;
  onCancel: () => void;
}

export function InterviewConsentGate({
  interviewType,
  isSubmitting = false,
  error = null,
  onAccept,
  onCancel,
}: InterviewConsentGateProps) {
  const [acceptDataProcessing, setAcceptDataProcessing] = useState(false);
  const [acceptAiEvaluation, setAcceptAiEvaluation] = useState(false);
  const [acceptRecording, setAcceptRecording] = useState(false);

  // Tratamiento de datos y uso de IA son obligatorios para iniciar.
  const requiredAccepted = acceptDataProcessing && acceptAiEvaluation;

  const handleAccept = () => {
    if (!requiredAccepted) return;
    onAccept({ acceptDataProcessing, acceptAiEvaluation, acceptRecording });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
      <div className="max-w-xl w-full bg-[#2D3A50] rounded-2xl p-8 shadow-xl border border-slate-600/50">
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center mx-auto mb-4">
            <Mic className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {interviewType === "THEORY" ? "Entrevista Teórica" : "Entrevista Técnica"}
          </h2>
          <p className="text-sm text-slate-400">
            Antes de comenzar necesitamos tu consentimiento informado
          </p>
        </div>

        <div className="mb-6 rounded-xl bg-slate-700/40 border border-slate-600/40 p-4">
          <div className="flex items-start gap-2 text-xs text-slate-300 leading-5">
            <Info className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
            <p>
              Tu entrevista será evaluada con fines de selección por la empresa que publicó la
              vacante. Se usarán servicios de inteligencia artificial para generar preguntas y
              evaluar tus respuestas. Si lo aceptas, la sesión podrá grabarse (pantalla, audio o
              video) y almacenarse de forma segura. Puedes cancelar ahora sin ninguna penalización.
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-700/50 cursor-pointer hover:bg-slate-700/70 transition">
            <input
              type="checkbox"
              checked={acceptDataProcessing}
              onChange={(e) => setAcceptDataProcessing(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-500 text-[#3B82F6] focus:ring-[#3B82F6]"
            />
            <div>
              <p className="text-sm font-medium text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Tratamiento de datos para evaluación
              </p>
              <p className="text-xs text-slate-400">
                Acepto que mis respuestas y datos relacionados con la entrevista sean tratados
                para fines de evaluación.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-700/50 cursor-pointer hover:bg-slate-700/70 transition">
            <input
              type="checkbox"
              checked={acceptAiEvaluation}
              onChange={(e) => setAcceptAiEvaluation(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-500 text-[#3B82F6] focus:ring-[#3B82F6]"
            />
            <div>
              <p className="text-sm font-medium text-slate-200 flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-400" />
                Evaluación con inteligencia artificial
              </p>
              <p className="text-xs text-slate-400">
                Acepto que la evaluación utilice servicios de inteligencia artificial.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-700/50 cursor-pointer hover:bg-slate-700/70 transition">
            <input
              type="checkbox"
              checked={acceptRecording}
              onChange={(e) => setAcceptRecording(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-500 text-[#3B82F6] focus:ring-[#3B82F6]"
            />
            <div>
              <p className="text-sm font-medium text-slate-200 flex items-center gap-2">
                <Camera className="w-4 h-4 text-red-400" />
                Grabación de la sesión
              </p>
              <p className="text-xs text-slate-400">
                Acepto la grabación de la sesión, incluida la pantalla, audio o video cuando
                corresponda.
              </p>
            </div>
          </label>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-600 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleAccept}
            disabled={!requiredAccepted || isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl bg-[#3B82F6] text-white text-sm font-bold hover:bg-[#2563EB] transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" /> Iniciar
              </>
            )}
          </button>
        </div>
        {!requiredAccepted && (
          <p className="mt-3 text-center text-xs text-slate-400">
            Debes aceptar el tratamiento de datos y el uso de IA para iniciar la entrevista.
          </p>
        )}
      </div>
    </div>
  );
}
