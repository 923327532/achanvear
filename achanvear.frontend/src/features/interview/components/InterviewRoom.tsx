// features/interview/components/InterviewRoom.tsx
// Sala inmersiva tipo Zoom - Usa preguntas/reto reales del agente Python
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useStartInterview, useSubmitAnswer, useCompleteInterview } from "../hooks/useFreelancerInterviews";
import { useInterviewConsent } from "../hooks/useInterviewConsent";
import { useAntiCheat } from "../hooks/useAntiCheat";
import { useScreenRecording } from "../hooks/useScreenRecording";
import { TimerBar } from "./TimerBar";
import { AntiCheatBanner } from "./AntiCheatBanner";
import { InterviewConsentGate } from "./InterviewConsentGate";
import { InterviewerAvatar } from "./InterviewerAvatar";
import type { InterviewSessionResponse, QuestionResponse, InterviewReportResponse, RecordInterviewConsentPayload } from "../types/interview.types";
import { Loader2, Send, AlertTriangle, FileCode2, Scale, Palette, Brain, ChevronRight, Terminal } from "lucide-react";

interface InterviewRoomProps {
  interviewId: string;
  interviewType: "THEORY" | "TECHNICAL";
  onClose: () => void;
  onComplete: (report: InterviewReportResponse) => void;
}

type RoomStep = "consent" | "connecting" | "question" | "completed" | "aborted" | "error";

// ─── Tipos de retos técnicos ─────────────────────────────────────────────
type ChallengeType = "CODING" | "LEGAL_CASE" | "DESIGN_BRIEF" | "ANALYTICAL_CASE" | "UNKNOWN";

interface ChallengeData {
  type: ChallengeType;
  title: string;
  description: string;
  instructions: string;
  time_limit: number;
  expected_output: string[];
}

function parseChallenge(challengeJson: string | null): ChallengeData | null {
  if (!challengeJson) return null;
  try {
    const parsed = typeof challengeJson === "string" ? JSON.parse(challengeJson) : challengeJson;
    return {
      type: parsed.type || "UNKNOWN",
      title: parsed.title || "Caso Practico",
      description: parsed.description || "",
      instructions: parsed.instructions || "",
      time_limit: parsed.time_limit || 900,
      expected_output: parsed.expected_output || [],
    };
  } catch {
    return null;
  }
}

// ─── Icono por tipo de challenge ─────────────────────────────────────────
function ChallengeIcon({ type }: { type: ChallengeType }) {
  const props = { className: "w-5 h-5" };
  switch (type) {
    case "CODING": return <FileCode2 {...props} />;
    case "LEGAL_CASE": return <Scale {...props} />;
    case "DESIGN_BRIEF": return <Palette {...props} />;
    default: return <Brain {...props} />;
  }
}

function ChallengeLabel({ type }: { type: ChallengeType }) {
  switch (type) {
    case "CODING": return "Reto de Programacion";
    case "LEGAL_CASE": return "Caso Legal";
    case "DESIGN_BRIEF": return "Brief de Diseno";
    case "ANALYTICAL_CASE": return "Caso Analitico";
    default: return "Caso Practico";
  }
}

// ═════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════

export function InterviewRoom({ interviewId, interviewType, onClose, onComplete }: InterviewRoomProps) {
  const [step, setStep] = useState<RoomStep>("consent");
  const [sessionInfo, setSessionInfo] = useState<InterviewSessionResponse | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [result, setResult] = useState<InterviewReportResponse | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(15);
  const [recordingConsented, setRecordingConsented] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [connectError, setConnectError] = useState(false);

  // Challenge tecnico
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startMutation = useStartInterview();
  const submitMutation = useSubmitAnswer();
  const completeMutation = useCompleteInterview();
  const consentMutation = useInterviewConsent();

  const handleViolation = useCallback((count: number) => {
    setViolationCount(count);
    if (count >= 3) setStep("aborted");
  }, []);

  useAntiCheat({ interviewId, onViolation: handleViolation, maxViolations: 3 });

  const { startRecording, stopRecording, isRecording, recordingDuration, recordingError } = useScreenRecording({ interviewId });

  // ── Fullscreen lock ──────────────────────────────────────────────────
  useEffect(() => {
    if (step !== "question") return;
    const enterFs = async () => {
      try { if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); } catch {}
    };
    enterFs();
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handleBeforeUnload);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F11" || (e.ctrlKey && (e.key === "w" || e.key === "r")) || (e.altKey && (e.key === "F4" || e.keyCode === 115)) || e.key === "Escape") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    const handleFsChange = () => {
      if (!document.fullscreenElement && step === "question") {
        // No forzar fullscreen automáticamente - el navegador lo bloquea
        // Mostrar overlay visual pidiendo al usuario hacer click
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("fullscreenchange", handleFsChange);
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch {}
    };
  }, [step]);

  // ── Aceptación del consentimiento previo ───────────────────────────────
  // Primero se registra el consentimiento en el backend; recién después se inicia
  // la sesión (WebSocket/Python). La grabación solo se solicita si fue aceptada.
  const handleConsentAccept = async (payload: RecordInterviewConsentPayload) => {
    setConsentError(null);
    setRecordingConsented(payload.acceptRecording);
    try {
      await consentMutation.mutateAsync({ interviewId, payload });
    } catch (err: any) {
      setConsentError(err?.message || "No se pudo registrar el consentimiento");
      return;
    }
    await handleStartInterview();
  };

  // ── Iniciar entrevista ────────────────────────────────────────────────
  const handleStartInterview = async () => {
    setStep("connecting");
    setConnectError(false);
    try {
      const session = await startMutation.mutateAsync(interviewId);
      if (!session) {
        setConnectError(true); setErrorMessage("No se pudo iniciar la sesion"); setStep("error");
        return;
      }
      setSessionInfo(session);

      // Iniciar grabacion solo si el consentimiento de grabación fue aceptado
      if (recordingConsented) await startRecording();

      // Configurar primera pregunta o reto
      if (interviewType === "TECHNICAL" && session.challengeJson) {
        const parsed = parseChallenge(session.challengeJson);
        setChallenge(parsed);
        setCurrentQuestion({
          id: "tech-challenge",
          content: session.firstQuestionContent || parsed?.description || "Resuelve el siguiente caso practico.",
          audioUrl: null,
        });
      } else {
        setCurrentQuestion({
          id: "q1",
          content: session.firstQuestionContent || "Describe tu experiencia profesional y su alineacion con el puesto.",
          audioUrl: null,
        });
      }
      setQuestionIndex(1);
      setStep("question");
    } catch (err: any) {
      setConnectError(true);
      setErrorMessage(err?.message || "Error al conectar con el agente IA");
      setStep("error");
    }
  };

  // ── Enviar respuesta ──────────────────────────────────────────────────
  const handleSubmitAnswer = async (timeoutAnswer?: string) => {
    const answerToSend = timeoutAnswer !== undefined ? timeoutAnswer : answer;
    if (!answerToSend.trim()) return;
    setIsSubmitting(true);
    try {
      const nextQ = await submitMutation.mutateAsync({
        interviewId,
        payload: { questionId: currentQuestion?.id ?? "q1", answerContent: answerToSend },
      });
      setAnswer("");
      if (nextQ && nextQ.content) {
        setCurrentQuestion(nextQ);
        setQuestionIndex((prev) => prev + 1);
        textareaRef.current?.focus();
      } else {
        const report = await completeMutation.mutateAsync(interviewId);
        setResult(report);
        setStep("completed");
        stopRecording();
        onComplete(report);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Error al enviar respuesta";
      setErrorMessage(msg);
      // Mostrar el error en la consola y opcionalmente como alerta
      console.error("[handleSubmitAnswer]", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Tiempo agotado ────────────────────────────────────────────────────
  const answerRef = useRef(answer);
  const isSubmittingRef = useRef(false);
  useEffect(() => { answerRef.current = answer; }, [answer]);

  const handleTimeUp = useCallback(() => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    // Usar setTimeout para evitar el warning de React (setState durante render)
    setTimeout(() => {
      if (answerRef.current.trim()) {
        handleSubmitAnswer();
      } else {
        handleSubmitAnswer("(tiempo agotado)");
      }
      isSubmittingRef.current = false;
    }, 0);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitAnswer(); }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] bg-[#0F172A] flex flex-col">
      <AntiCheatBanner violationCount={violationCount} maxViolations={3} isRecording={isRecording} />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ─── Panel izquierdo: Entrevistador IA ─── */}
        <div className="lg:w-[280px] bg-gradient-to-b from-[#1E293B] to-[#0F172A] flex flex-col items-center justify-center p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-700/50 shrink-0">
          {step === "connecting" ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="w-12 h-12 text-[#3B82F6] animate-spin" />
              <p className="text-sm font-medium text-slate-400">Conectando con IA...</p>
            </div>
          ) : step === "error" ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400" />
              <p className="text-sm font-medium text-slate-300">{errorMessage}</p>
              <button onClick={handleStartInterview} className="px-6 py-2.5 rounded-xl bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#2563EB] transition">Reintentar</button>
            </div>
          ) : sessionInfo ? (
            <InterviewerAvatar name={sessionInfo.interviewerName} style={sessionInfo.interviewerStyle} voice={sessionInfo.interviewerVoice} size="lg" />
          ) : (
            <InterviewerAvatar name="Agente IA" style="Entrevistador virtual" voice="MALE1" size="lg" />
          )}
          {isRecording && (
            <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium text-red-400">Grabando {recordingDuration}</span>
            </div>
          )}
          {recordingError && (
            <div className="mt-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-xs text-amber-400">{recordingError}</p>
            </div>
          )}
        </div>

        {/* ─── Panel derecho: Contenido de la entrevista ─── */}
        <div className="flex-1 flex flex-col bg-[#1E293B] min-w-0">

          {step === "consent" && (
            <InterviewConsentGate
              interviewType={interviewType}
              isSubmitting={consentMutation.isPending || startMutation.isPending}
              error={consentError}
              onAccept={handleConsentAccept}
              onCancel={onClose}
            />
          )}

          {step === "question" && currentQuestion && (
            <div className="flex-1 flex flex-col p-6 lg:p-8 overflow-y-auto">
              {/* Progreso + tipo */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium text-slate-400">
                  {interviewType === "THEORY" ? "Entrevista Teorica" : "Entrevista Tecnica"}
                </span>
                {challenge && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <ChallengeIcon type={challenge.type} />
                    <ChallengeLabel type={challenge.type} />
                  </span>
                )}
                <span className="ml-auto text-xs font-bold text-white bg-[#3B82F6] px-2 py-0.5 rounded-full">
                  {questionIndex}/{totalQuestions}
                </span>
              </div>

              {/* Contenido: pregunta o reto */}
              {challenge ? (
                <div className="space-y-4 mb-6">
                  {/* Header del reto */}
                  <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-indigo-500/30">
                        <ChallengeIcon type={challenge.type} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
                        <p className="text-xs text-slate-400">
                          <ChallengeLabel type={challenge.type} /> · {Math.floor(challenge.time_limit / 60)} minutos
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{challenge.description}</p>
                  </div>

                  {/* Instrucciones */}
                  <div className="bg-[#2D3A50] rounded-xl border border-slate-600/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ChevronRight className="w-4 h-4 text-[#3B82F6]" />
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Instrucciones</span>
                    </div>
                    <p className="text-sm text-slate-400 whitespace-pre-wrap">{challenge.instructions}</p>
                  </div>

                  {/* Criterios de evaluacion */}
                  {challenge.expected_output.length > 0 && (
                    <div className="bg-[#2D3A50] rounded-xl border border-slate-600/50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Criterios de Evaluacion</span>
                      </div>
                      <ul className="space-y-1.5">
                        {challenge.expected_output.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                /* Pregunta teorica */
                <div className="bg-[#2D3A50] rounded-2xl border border-slate-600/50 p-5 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-white text-xs font-bold">IA</div>
                    <span className="text-xs font-semibold text-slate-400">Pregunta del agente</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">{currentQuestion.content}</p>
                </div>
              )}

              {/* Timer - key=questionIndex fuerza reinicio en cada pregunta */}
              <TimerBar key={questionIndex} durationSeconds={90} onTimeUp={handleTimeUp} isActive={step === "question"} />

              {/* Area de respuesta */}
              <div className="flex-1 mt-4 min-h-[120px]">
                <textarea
                  ref={textareaRef}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={challenge?.type === "CODING"
                    ? "Escribe tu codigo aqui...\n\nEjemplo:\nfunction findMostFrequent(arr) {\n  // tu solucion\n}"
                    : "Escribe tu respuesta aqui..."
                  }
                  className={`w-full h-full min-h-[120px] max-h-[400px] px-4 py-3 rounded-xl bg-[#2D3A50] border border-slate-600/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] resize-y ${
                    challenge?.type === "CODING" ? "font-mono text-[13px] leading-relaxed" : ""
                  }`}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              {/* Barra de acciones */}
              <div className="flex gap-3 mt-4">
                <button onClick={() => handleSubmitAnswer()} disabled={!answer.trim() || isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#3B82F6] text-white text-sm font-bold hover:bg-[#2563EB] transition disabled:opacity-50">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Evaluando...</> : <><Send className="w-4 h-4" /> Enviar {challenge ? "Solucion" : "Respuesta"}</>}
                </button>
                <button onClick={() => { stopRecording(); setStep("aborted"); }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition">
                  Abortar
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-center">Enter = enviar · Shift+Enter = salto de linea</p>
            </div>
          )}

          {step === "completed" && result && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="max-w-md w-full text-center">
                <div className={`w-24 h-24 rounded-full ${result.passed ? "bg-emerald-500/20" : "bg-amber-500/20"} flex items-center justify-center mx-auto mb-6`}>
                  <div className={`w-16 h-16 rounded-full ${result.passed ? "bg-emerald-500" : "bg-amber-500"} flex items-center justify-center`}>
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {result.passed ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />}
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{result.passed ? "Entrevista Completada" : "Entrevista Finalizada"}</h3>
                <p className="text-sm text-slate-400 mb-6">{result.passed ? "Has aprobado. Pasas a la siguiente etapa." : "No alcanzaste el puntaje minimo."}</p>
                <div className="bg-[#2D3A50] rounded-2xl border border-slate-600/50 p-6 mb-6">
                  <p className="text-5xl font-bold text-[#3B82F6]">{result.finalScore ?? 0}/100</p>
                  <p className="text-sm text-slate-400 mt-2">Puntaje final</p>
                </div>
                <button onClick={onClose} className="px-8 py-3 rounded-xl bg-[#3B82F6] text-white text-sm font-bold hover:bg-[#2563EB] transition">Salir</button>
              </div>
            </div>
          )}

          {step === "aborted" && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="max-w-md w-full text-center">
                <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                  <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Entrevista Abortada</h3>
                <p className="text-sm text-slate-400 mb-6">Sesion abortada por cambios de pantalla. Reporte registrado.</p>
                <button onClick={onClose} className="px-8 py-3 rounded-xl bg-[#3B82F6] text-white text-sm font-bold hover:bg-[#2563EB] transition">Salir</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      {step === "question" && (
        <div className="bg-[#1E293B] border-t border-slate-700/50 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>ID: {interviewId.slice(0, 8)}...</span>
            {isRecording && <span className="flex items-center gap-1 text-red-400"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> REC {recordingDuration}</span>}
          </div>
          <div className="text-xs text-slate-500">{challenge ? <ChallengeLabel type={challenge.type} /> : interviewType === "THEORY" ? "Entrevista Teorica" : "Entrevista Tecnica"}</div>
        </div>
      )}
    </div>
  );
}