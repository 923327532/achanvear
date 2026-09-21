"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Code2, FileText, Loader2, Mic, MicOff, PhoneOff, Send } from "lucide-react";
import {
  finishPracticalInterview,
  practicalWsUrl,
  reportPracticalViolation,
  startPracticalInterview,
  type FinishPracticalResponse,
  type PracticalChallenge,
  type WorkspaceType,
} from "../api/practicalVoiceApi";

type TranscriptLine = { role: "candidate" | "agent"; content: string };

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#0f172a] text-sm text-slate-300">
      Cargando editor...
    </div>
  ),
});

interface Props {
  sessionId: string;
  career: string;
  jobTitle: string;
  workspaceType?: WorkspaceType;
  onClose: () => void;
  onComplete?: (result: FinishPracticalResponse) => void;
}

export function PracticalVoiceInterviewRoom({
  sessionId,
  career,
  jobTitle,
  workspaceType,
  onClose,
  onComplete,
}: Props) {
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const transcriptRef = useRef<TranscriptLine[]>([]);
  const workspaceRef = useRef<Record<string, unknown>>({});

  const [challenge, setChallenge] = useState<PracticalChallenge | null>(null);
  const [resolvedWorkspaceType, setResolvedWorkspaceType] = useState<WorkspaceType>("simulation");
  const [status, setStatus] = useState<"booting" | "ready" | "recording" | "thinking" | "finished">("booting");
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");
  const [manualText, setManualText] = useState("");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [violations, setViolations] = useState(0);
  const [result, setResult] = useState<FinishPracticalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const workspaceState = useMemo(
    () => ({
      code,
      notes,
      challengeTitle: challenge?.title,
      workspaceType: resolvedWorkspaceType,
      updatedAt: new Date().toISOString(),
    }),
    [challenge?.title, code, notes, resolvedWorkspaceType]
  );

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    workspaceRef.current = workspaceState;
    wsRef.current?.send(JSON.stringify({ type: "workspace_state", payload: workspaceState }));
  }, [workspaceState]);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        const started = await startPracticalInterview({
          session_id: sessionId,
          career,
          job_title: jobTitle,
          workspace_type: workspaceType,
          country: "Peru",
        });
        if (!mounted) return;
        setChallenge(started.challenge);
        setResolvedWorkspaceType(started.workspace_type);
        setCode(started.challenge.starter_code ?? "");

        const ws = new WebSocket(practicalWsUrl(started.websocket_url));
        ws.binaryType = "arraybuffer";
        ws.onopen = () => setStatus("ready");
        ws.onmessage = (event) => handleWsMessage(event.data);
        ws.onerror = () => setError("Se perdio la conexion con el agente de voz");
        ws.onclose = () => {
          if (mounted && status !== "finished") setStatus("ready");
        };
        wsRef.current = ws;
      } catch (err: any) {
        setError(err?.message || "No se pudo preparar la entrevista practica");
      }
    }

    boot();
    return () => {
      mounted = false;
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      wsRef.current?.close();
    };
  }, [career, jobTitle, sessionId, workspaceType]);

  useEffect(() => {
    if (resolvedWorkspaceType !== "coding") return;

    const report = (type: string, detail: string, severity = "medium") => {
      setViolations((current) => current + 1);
      reportPracticalViolation({ session_id: sessionId, type, detail, severity }).catch(() => undefined);
      wsRef.current?.send(JSON.stringify({ type: "workspace_state", payload: workspaceRef.current }));
    };

    const onVisibility = () => {
      if (document.hidden) report("visibilitychange", "El candidato cambio de pestana o minimizo la ventana", "high");
    };
    const onBlur = () => report("blur", "La ventana perdio foco durante la entrevista", "medium");
    const onPaste = () => report("paste", "Se detecto pegado de contenido en el workspace", "medium");
    const onCopy = () => report("copy", "Se detecto copia de contenido desde el workspace", "low");

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("paste", onPaste);
    window.addEventListener("copy", onCopy);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("paste", onPaste);
      window.removeEventListener("copy", onCopy);
    };
  }, [resolvedWorkspaceType, sessionId]);

  function handleWsMessage(raw: string | ArrayBuffer) {
    if (typeof raw !== "string") return;
    const data = JSON.parse(raw);

    if (data.type === "transcript") {
      appendTranscript(data.role, data.text);
    }
    if (data.type === "agent_text") {
      setStatus((current) => current === "recording" ? "recording" : "ready");
      appendTranscript("agent", data.text);
    }
    if (data.type === "agent_audio") {
      playBase64Audio(data.audio_base64, data.format);
    }
    if (data.type === "stt_started") {
      setStatus((current) => current === "recording" ? "recording" : "thinking");
    }
    if (data.type === "stt_error") {
      setStatus("ready");
      setError(data.message);
    }
  }

  function appendTranscript(role: "candidate" | "agent", content: string) {
    setTranscript((current) => [...current, { role, content }]);
  }

  async function startRecording() {
    setError(null);
    currentAudioRef.current?.pause();
    currentAudioRef.current = null;
    wsRef.current?.send(JSON.stringify({ type: "barge_in" }));
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunksRef.current = [];
    recorder.ondataavailable = async (event) => {
      if (event.data.size <= 0 || wsRef.current?.readyState !== WebSocket.OPEN) return;
      currentAudioRef.current?.pause();
      currentAudioRef.current = null;
      const bytes = await event.data.arrayBuffer();
      wsRef.current.send(bytes);
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      setStatus("ready");
    };
    recorder.start(4500);
    recorderRef.current = recorder;
    setStatus("recording");
  }

  function stopRecording() {
    recorderRef.current?.stop();
    recorderRef.current = null;
  }

  function sendManualText() {
    const text = manualText.trim();
    if (!text) return;
    setManualText("");
    setStatus("thinking");
    wsRef.current?.send(JSON.stringify({ type: "candidate_text", text }));
  }

  async function finish() {
    setStatus("finished");
    const response = await finishPracticalInterview({
      session_id: sessionId,
      workspace_type: resolvedWorkspaceType,
      transcript: transcriptRef.current,
      workspace_state: workspaceRef.current,
      violations,
    });
    setResult(response);
    onComplete?.(response);
  }

  function playBase64Audio(audioBase64: string, format: string) {
    const audio = new Audio(`data:audio/${format};base64,${audioBase64}`);
    currentAudioRef.current = audio;
    audio.play().catch(() => undefined);
  }

  const isCoding = resolvedWorkspaceType === "coding";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white">
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div>
            <p className="text-xs uppercase text-emerald-300">Entrevista practica IA</p>
            <h1 className="text-lg font-semibold">{challenge?.title ?? "Preparando entorno..."}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200">
              Alertas: {violations}
            </span>
            <button onClick={finish} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
              <CheckCircle2 className="h-4 w-4" /> Finalizar
            </button>
            <button onClick={onClose} className="rounded-lg border border-white/15 p-2 text-white/70 hover:text-white">
              <PhoneOff className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="min-h-0 border-r border-white/10 bg-slate-900">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-start gap-3">
                {isCoding ? <Code2 className="mt-1 h-5 w-5 text-emerald-300" /> : <FileText className="mt-1 h-5 w-5 text-emerald-300" />}
                <div>
                  <p className="text-sm font-semibold">{challenge?.prompt}</p>
                  {challenge?.document && <p className="mt-2 text-sm text-slate-300">{challenge.document}</p>}
                </div>
              </div>
            </div>

            {isCoding ? (
              <div className="h-[calc(100%-112px)]">
                <MonacoEditor
                  height="100%"
                  language={challenge?.language ?? "typescript"}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value ?? "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true,
                    tabSize: 2,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            ) : (
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Escribe tu analisis, supuestos, calculos o decisiones mientras conversas con el agente..."
                className="h-[calc(100%-112px)] w-full resize-none bg-[#0f172a] p-5 text-sm leading-6 text-slate-50 outline-none"
              />
            )}
          </section>

          <section className="flex min-h-0 flex-col bg-slate-950">
            <div className="flex-1 overflow-y-auto p-5">
              {transcript.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  El agente explicara la prueba y hara preguntas por voz. Puedes interrumpir hablando de nuevo cuando necesites aclarar algo.
                </div>
              )}
              <div className="space-y-3">
                {transcript.map((line, index) => (
                  <div key={index} className={line.role === "agent" ? "rounded-xl bg-emerald-400/10 p-3 text-emerald-50" : "rounded-xl bg-white/10 p-3 text-white"}>
                    <p className="mb-1 text-[11px] uppercase text-white/45">{line.role === "agent" ? "Agente IA" : "Candidato"}</p>
                    <p className="text-sm leading-6">{line.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="mx-5 mb-3 flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-100">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            {result && (
              <div className="mx-5 mb-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                <p className="text-sm font-semibold">
                  Resultado final: {result.final_score}/100 - {result.passed ? "Aprobado" : "Revision requerida"}
                </p>
                <p className="mt-1 text-xs text-emerald-100">
                  Teoria {result.theory_score}/100 · Practica {result.score}/100 · Comunicacion {result.communication_score}/100
                </p>
                <p className="mt-1 text-xs text-emerald-50">{result.summary}</p>
                {result.communication_summary && (
                  <p className="mt-1 text-xs text-emerald-50">{result.communication_summary}</p>
                )}
              </div>
            )}

            <div className="border-t border-white/10 p-4">
              <div className="mb-3 flex gap-2">
                <input
                  value={manualText}
                  onChange={(event) => setManualText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") sendManualText();
                  }}
                  placeholder="Fallback de texto si el STT local no esta disponible..."
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                />
                <button onClick={sendManualText} className="rounded-lg bg-white/10 px-3 py-2">
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={status === "recording" ? stopRecording : startRecording}
                disabled={status === "booting" || status === "finished"}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"
              >
                {status === "thinking" ? <Loader2 className="h-4 w-4 animate-spin" /> : status === "recording" ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {status === "recording" ? "Pausar microfono" : status === "thinking" ? "El agente esta razonando..." : "Iniciar conversacion por voz"}
              </button>
              {status === "recording" && (
                <p className="mt-2 text-center text-xs text-emerald-200">
                  Microfono abierto. Habla de forma natural; el agente puede responder y puedes interrumpirlo.
                </p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
