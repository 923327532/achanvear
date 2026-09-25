// features/interview/components/ChooseSlotModal.tsx
"use client";

import { useState } from "react";
import { Calendar, Clock, CheckCircle2, Copy, X, Loader2, Key } from "lucide-react";
import { scheduleApi, type InterviewScheduleResponse, type ChooseSlotResponse } from "../api/scheduleApi";

interface ChooseSlotModalProps {
  schedule: InterviewScheduleResponse;
  onClose: () => void;
  onComplete: () => void;
}

export function ChooseSlotModal({ schedule, onClose, onComplete }: ChooseSlotModalProps) {
  const [step, setStep] = useState<"choose" | "confirming" | "done" | "error">("choose");
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [result, setResult] = useState<ChooseSlotResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const formatSlotDate = (dateTime: string) => {
    try {
      const d = new Date(dateTime);
      return d.toLocaleDateString("es-PE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateTime;
    }
  };

  const formatSlotTime = (dateTime: string) => {
    try {
      const d = new Date(dateTime);
      return d.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const isSlotPast = (dateTime: string) => {
    try {
      return new Date(dateTime) < new Date();
    } catch {
      return false;
    }
  };

  const handleChoose = async () => {
    if (selectedSlot === null) return;
    setStep("confirming");
    try {
      const response = await scheduleApi.chooseSlot(schedule.scheduleId, selectedSlot);
      setResult(response);
      setStep("done");
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al elegir horario");
      setStep("error");
    }
  };

  const handleDone = () => {
    onComplete();
    onClose();
  };

  const handleCopyId = () => {
    if (result?.interviewId) {
      navigator.clipboard.writeText(result.interviewId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const interviewTypeLabel = schedule.interviewType === "THEORY" ? "Teórica" : "Técnica";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {step === "choose" && (
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Elige tu horario</h2>
              <p className="text-xs text-slate-500">Entrevista {interviewTypeLabel}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Slots */}
          <div className="p-6 space-y-3">
            {schedule.proposedSlots
              .filter((s) => s.status === "AVAILABLE" || s.status === "PENDING")
              .map((slot) => {
                const past = isSlotPast(slot.dateTime);
                return (
                  <button
                    key={slot.index}
                    onClick={() => !past && setSelectedSlot(slot.index)}
                    disabled={past}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedSlot === slot.index
                        ? "border-[#1B3A6B] bg-blue-50 shadow-sm"
                        : past
                        ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                        : "border-slate-200 hover:border-[#1B3A6B]/30 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedSlot === slot.index ? "bg-[#1B3A6B] text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {selectedSlot === slot.index ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Calendar className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">
                          {formatSlotDate(slot.dateTime)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm text-slate-600">{formatSlotTime(slot.dateTime)}</span>
                        </div>
                      </div>
                      {past && (
                        <span className="text-xs font-medium text-slate-400">Vencido</span>
                      )}
                    </div>
                  </button>
                );
              })}

            {schedule.proposedSlots.filter((s) => s.status === "AVAILABLE" || s.status === "PENDING").length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">No hay horarios disponibles</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3 rounded-b-2xl">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">
              Cancelar
            </button>
            <button
              onClick={handleChoose}
              disabled={selectedSlot === null}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-sm font-bold hover:bg-[#162f58] transition disabled:opacity-50"
            >
              Confirmar Horario
            </button>
          </div>
        </div>
      )}

      {step === "confirming" && (
        <div className="relative bg-white rounded-2xl shadow-2xl p-12 text-center">
          <Loader2 className="w-10 h-10 text-[#1B3A6B] animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-600">Confirmando horario...</p>
        </div>
      )}

      {step === "done" && result && (
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Horario Confirmado</h3>
          <p className="text-sm text-slate-500 mb-6">Tu entrevista ha sido agendada correctamente</p>

          {/* Token */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 mb-3 text-left">
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">Token de acceso</span>
            </div>
            <p className="text-sm font-bold text-[#1B3A6B] font-mono tracking-wider select-all break-all">
              {result.interviewToken}
            </p>
          </div>

          {/* Interview ID */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-500">ID de Entrevista</span>
              <button
                onClick={handleCopyId}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                {copied ? (
                  <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Copiado</>
                ) : (
                  <><Copy className="w-3 h-3" /> Copiar</>
                )}
              </button>
            </div>
            <p className="text-sm font-mono text-slate-700 select-all break-all">{result.interviewId}</p>
          </div>

          <button
            onClick={handleDone}
            className="w-full py-3 rounded-xl bg-[#1B3A6B] text-white text-sm font-bold hover:bg-[#162f58] transition"
          >
            Listo
          </button>
        </div>
      )}

      {step === "error" && (
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Error</h3>
          <p className="text-sm text-slate-500 mb-6">{errorMsg}</p>
          <button
            onClick={() => setStep("choose")}
            className="w-full py-3 rounded-xl bg-[#1B3A6B] text-white text-sm font-bold hover:bg-[#162f58] transition"
          >
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}
