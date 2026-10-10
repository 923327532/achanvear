"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, Code2, Download, EyeOff, FileCode2, FilePlus2, FileText, Folder, FolderPlus, History, Layers3, Loader2, Mic, MicOff, PhoneOff, Play, Send, Stethoscope, UserRound, Video, X } from "lucide-react";
import {
  finishPracticalInterview,
  practicalWsUrl,
  reportPracticalViolation,
  runPracticalCode,
  startPracticalInterview,
  type PracticalCodeFile,
  type FinishPracticalResponse,
  type PracticalChallenge,
  type WorkspaceType,
} from "../api/practicalVoiceApi";
import { interviewApi } from "../api/interviewApi";

type TranscriptLine = { role: "candidate" | "agent"; content: string };
type VoiceStatus = "idle" | "speaking" | "listening";
type LastRunResult = {
  success: boolean;
  language?: string;
  stdout: string;
  stderr: string;
  exit_code: number;
  runtime_available: boolean;
  ranAt: string;
};

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
  candidateName?: string;
  workspaceType?: WorkspaceType;
  onClose: () => void;
  onComplete?: (result: FinishPracticalResponse) => void;
}

export function PracticalVoiceInterviewRoom({
  sessionId,
  career,
  jobTitle,
  candidateName,
  workspaceType,
  onClose,
  onComplete,
}: Props) {
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const transcriptRef = useRef<TranscriptLine[]>([]);
  const workspaceRef = useRef<Record<string, unknown>>({});
  const voiceStatusRef = useRef<VoiceStatus>("idle");
  const screenExitCountRef = useRef(0);
  const disqualifiedRef = useRef(false);
  const finishingRef = useRef(false);

  const [challenge, setChallenge] = useState<PracticalChallenge | null>(null);
  const [resolvedWorkspaceType, setResolvedWorkspaceType] = useState<WorkspaceType>("simulation");
  const [status, setStatus] = useState<"booting" | "ready" | "recording" | "thinking" | "finished">("booting");
  const [code, setCode] = useState("");
  const [codeFiles, setCodeFiles] = useState<PracticalCodeFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState("");
  const [codeOutput, setCodeOutput] = useState("");
  const [lastRun, setLastRun] = useState<LastRunResult | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("typescript");
  const [newFilePath, setNewFilePath] = useState("");
  const [newFolderPath, setNewFolderPath] = useState("");
  const [projectFolders, setProjectFolders] = useState<string[]>([]);
  const [selectedFolderPath, setSelectedFolderPath] = useState("");
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [manualText, setManualText] = useState("");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [violations, setViolations] = useState(0);
  const [result, setResult] = useState<FinishPracticalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [exitCountdown, setExitCountdown] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showCase, setShowCase] = useState(true);
  const [showMeetPanel, setShowMeetPanel] = useState(true);
  const [createDialog, setCreateDialog] = useState<"file" | "folder" | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [explorerWidth, setExplorerWidth] = useState(286);
  const [folderContextMenu, setFolderContextMenu] = useState<{ x: number; y: number; path: string } | null>(null);
  const [meetPanelPosition, setMeetPanelPosition] = useState({ x: 16, y: 16 });
  const [securityEvents, setSecurityEvents] = useState<Array<{ type: string; detail: string; at: string }>>([]);
  const [screenExitCount, setScreenExitCount] = useState(0);
  const dragStateRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const explorerResizeRef = useRef<{ startX: number; originWidth: number } | null>(null);
  const timerWarningsRef = useRef({ ten: false, five: false });

  const workspaceState = useMemo(
    () => ({
      code,
      files: codeFiles,
      folders: projectFolders,
      selectedFolderPath,
      activeFilePath,
      codeOutput,
      lastRun,
      codeLanguage,
      previewHtml,
      notes,
      securityEvents,
      challengeTitle: challenge?.title,
      workspaceType: resolvedWorkspaceType,
      updatedAt: new Date().toISOString(),
    }),
    [activeFilePath, challenge?.title, code, codeFiles, codeLanguage, codeOutput, lastRun, notes, previewHtml, projectFolders, resolvedWorkspaceType, securityEvents, selectedFolderPath]
  );

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    if (!timerActive || status === "booting" || status === "finished") return;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status, timerActive]);

  useEffect(() => {
    if (!timerActive || status === "finished") return;
    if (timeLeft <= 10 * 60 && !timerWarningsRef.current.ten) {
      timerWarningsRef.current.ten = true;
      speakInBrowser("Aviso de tiempo: te quedan 10 minutos. Puedes ejecutar las veces que necesites y entregar cuando estes listo.");
      appendTranscript("agent", "Aviso de tiempo: te quedan 10 minutos. Puedes ejecutar las veces que necesites y entregar cuando estes listo.");
    }
    if (timeLeft <= 5 * 60 && !timerWarningsRef.current.five) {
      timerWarningsRef.current.five = true;
      speakInBrowser("Aviso final: te quedan 5 minutos. Revisa tu solucion, ejecuta si necesitas validar y presiona entregar al terminar.");
      appendTranscript("agent", "Aviso final: te quedan 5 minutos. Revisa tu solucion, ejecuta si necesitas validar y presiona entregar al terminar.");
    }
    if (timeLeft === 0) {
      finish(false);
    }
  }, [status, timeLeft, timerActive]);

  useEffect(() => {
    workspaceRef.current = workspaceState;
    sendWsJson({ type: "workspace_state", payload: workspaceState });
  }, [workspaceState]);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        const started = await startPracticalInterview({
          session_id: sessionId,
          career,
          job_title: jobTitle,
          candidate_name: candidateName,
          workspace_type: workspaceType,
          country: "Peru",
        });
        if (!mounted) return;
        setChallenge(started.challenge);
        setResolvedWorkspaceType(started.workspace_type);
        const starterLanguage = started.challenge.language ?? "typescript";
        const initialFiles = started.challenge.files?.length
          ? started.challenge.files
          : languageStarters[starterLanguage]
            ? [languageStarters[starterLanguage]]
            : [];
        setCodeFiles(initialFiles);
        setProjectFolders(deriveFolders(initialFiles.map((file) => file.path)));
        setActiveFilePath(started.challenge.entry_file ?? initialFiles[0]?.path ?? "");
        setCode(initialFiles[0]?.content ?? started.challenge.starter_code ?? "");
        setCodeLanguage(starterLanguage);

        const ws = new WebSocket(practicalWsUrl(started.websocket_url));
        ws.binaryType = "arraybuffer";
        ws.onopen = () => {
          setStatus("ready");
          sendWsJson({ type: "workspace_state", payload: workspaceRef.current });
        };
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
      stopBrowserSpeech();
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      wsRef.current?.close();
    };
  }, [candidateName, career, jobTitle, sessionId, workspaceType]);

  useEffect(() => {
    const report = (type: string, detail: string, severity = "medium") => {
      setViolations((current) => current + 1);
      setSecurityEvents((current) => [...current, { type, detail, at: new Date().toISOString() }]);
      reportPracticalViolation({ session_id: sessionId, type, detail, severity }).catch(() => undefined);
      sendWsJson({ type: "workspace_state", payload: workspaceRef.current });
    };
    const disqualify = (reason: string) => {
      if (disqualifiedRef.current) return;
      disqualifiedRef.current = true;
      report("disqualified", reason, "critical");
      setError(reason);
      setStatus("finished");
      setExitCountdown(null);
      stopBrowserSpeech();
      wsRef.current?.close();
      interviewApi.abort(sessionId, reason).catch(() => undefined);
    };

    const onVisibility = () => {
      if (document.hidden) {
        const nextCount = screenExitCountRef.current + 1;
        screenExitCountRef.current = nextCount;
        setScreenExitCount(nextCount);
        report("screen_exit", `Salida de pantalla numero ${nextCount}`, "high");
        if (nextCount >= 3) {
          disqualify("Entrevista cancelada y candidato descalificado por salir de la pantalla 3 veces.");
          return;
        }
        setExitCountdown(30);
        speakInBrowser("Has salido de la pantalla de entrevista. Esta salida queda registrada. Regresa antes de 30 segundos. Si sales tres veces, la entrevista sera cancelada y quedaras descalificado.");
        return;
      }
      setExitCountdown(null);
    };
    const onBlur = () => report("blur", "La ventana perdio foco durante la entrevista", "medium");
    const onPaste = () => report("paste", "Se detecto pegado de contenido en el workspace", "medium");
    const onCopy = () => report("copy", "Se detecto copia de contenido desde el workspace", "low");
    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      report("contextmenu", "Se intento abrir menu contextual durante la entrevista", "medium");
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const blocked =
        key === "f12" ||
        (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
        (event.ctrlKey && ["u", "s", "p"].includes(key)) ||
        (event.metaKey && ["u", "s", "p"].includes(key));
      if (!blocked) return;
      event.preventDefault();
      report("blocked_shortcut", `Atajo bloqueado: ${event.key}`, "high");
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("paste", onPaste);
    window.addEventListener("copy", onCopy);
    window.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("paste", onPaste);
      window.removeEventListener("copy", onCopy);
      window.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sessionId]);

  useEffect(() => {
    if (exitCountdown === null) return;
    if (exitCountdown <= 0) {
      const reason = "Entrevista cancelada y candidato descalificado por permanecer fuera de la pantalla 30 segundos.";
      disqualifiedRef.current = true;
      setError(reason);
      setStatus("finished");
      stopBrowserSpeech();
      wsRef.current?.close();
      setSecurityEvents((current) => [...current, { type: "disqualified", detail: reason, at: new Date().toISOString() }]);
      reportPracticalViolation({ session_id: sessionId, type: "disqualified", detail: reason, severity: "critical" }).catch(() => undefined);
      interviewApi.abort(sessionId, reason).catch(() => undefined);
      return;
    }
    const timer = window.setTimeout(() => {
      setExitCountdown((current) => current === null ? null : current - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [exitCountdown]);

  function handleWsMessage(raw: string | ArrayBuffer) {
    if (typeof raw !== "string") return;
    const data = JSON.parse(raw);

    if (data.type === "transcript") {
      appendTranscript(data.role, data.text);
    }
    if (data.type === "agent_text") {
      setStatus((current) => current === "recording" ? "recording" : "ready");
      appendTranscript("agent", data.text);
      speakInBrowser(data.text);
      if (shouldStartTimer(data.text)) setTimerActive(true);
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
    if (data.type === "finish_requested") {
      finish(true);
    }
  }

  function appendTranscript(role: "candidate" | "agent", content: string) {
    setTranscript((current) => [...current, { role, content }]);
  }

  function setVoice(value: VoiceStatus) {
    voiceStatusRef.current = value;
    setVoiceStatus(value);
  }

  function stopBrowserSpeech() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (voiceStatusRef.current === "speaking") setVoice("idle");
  }

  function speakInBrowser(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-PE";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice =
      voices.find((voice) => voice.lang.toLowerCase().startsWith("es-pe")) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("es-")) ||
      null;
    utterance.onstart = () => setVoice("speaking");
    utterance.onend = () => setVoice("idle");
    utterance.onerror = () => setVoice("idle");
    window.speechSynthesis.speak(utterance);
  }

  function sendWsJson(payload: Record<string, unknown>) {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(payload));
    return true;
  }

  function shouldStartTimer(text: string) {
    const normalized = text.toLowerCase();
    return (
      normalized.includes("comenzamos") ||
      normalized.includes("tienes 20 minutos") ||
      normalized.includes("empecemos el reto") ||
      normalized.includes("empezamos el reto")
    );
  }

  async function startRecording() {
    setError(null);
    currentAudioRef.current?.pause();
    currentAudioRef.current = null;
    stopBrowserSpeech();
    sendWsJson({ type: "barge_in" });
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-PE";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((result: any) => result[0]?.transcript ?? "")
          .join(" ")
          .trim();
        if (text) {
          setStatus("thinking");
          sendWsJson({ type: "candidate_text", text });
        }
      };
      recognition.onerror = () => {
        setStatus("ready");
        setVoice("idle");
        setError("No pude escuchar con el reconocimiento del navegador. Puedes escribir tu respuesta abajo.");
      };
      recognition.onend = () => {
        setStatus((current) => current === "recording" ? "ready" : current);
        if (voiceStatusRef.current === "listening") setVoice("idle");
      };
      recognitionRef.current = recognition;
      recognition.start();
      setStatus("recording");
      setVoice("listening");
      return;
    }

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
    setVoice("listening");
  }

  function stopRecording() {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    recorderRef.current?.stop();
    recorderRef.current = null;
    if (voiceStatusRef.current === "listening") setVoice("idle");
  }

  function sendManualText() {
    const text = manualText.trim();
    if (!text) return;
    setManualText("");
    setStatus("thinking");
    if (!sendWsJson({ type: "candidate_text", text })) {
      setStatus("ready");
      setError("La conexion con el agente aun se esta preparando. Intenta otra vez en unos segundos.");
    }
  }

  async function finish(fromAgent = false) {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setStatus("finished");
    setError(null);
    if (!fromAgent) {
      appendTranscript("agent", "Dame un momento. Comenzare a evaluar tus respuestas y el trabajo realizado.");
      speakInBrowser("Dame un momento. Comenzare a evaluar tus respuestas y el trabajo realizado.");
    }
    try {
      const response = await finishPracticalInterview({
        session_id: sessionId,
        workspace_type: resolvedWorkspaceType,
        transcript: transcriptRef.current,
        workspace_state: workspaceRef.current,
        violations,
      });
      setResult(response);
      setShowHistory(true);
      const closing = response.passed
        ? "Excelente, ya termine la evaluacion. Podras descargar tu reporte de entrevista. Has aprobado esta etapa y la empresa se pondra en contacto contigo para los siguientes pasos."
        : "Ya termine la evaluacion. Podras descargar tu reporte de entrevista con el resultado y recomendaciones. En esta etapa no alcanzaste el puntaje requerido, pero el informe quedara disponible.";
      appendTranscript("agent", closing);
      speakInBrowser(closing);
      await interviewApi.complete(sessionId, {
        score: response.score,
        summary: response.summary,
        evidence: buildCompletionEvidence(response),
      });
      onComplete?.(response);
    } catch (err: any) {
      finishingRef.current = false;
      setStatus("ready");
      setError(err?.message || "No se pudo guardar la evaluacion practica");
    }
  }

  async function cancelPracticalInterview(reason = "Entrevista practica cancelada por el candidato") {
    stopBrowserSpeech();
    setStatus("finished");
    try {
      await interviewApi.abort(sessionId, reason);
    } catch {
      // Si el backend ya la cerro, solo salimos de la sala.
    } finally {
      onClose();
    }
  }

  function buildCompletionEvidence(response: FinishPracticalResponse) {
    const lastTurns = transcriptRef.current
      .slice(-10)
      .map((line) => `${line.role === "agent" ? "IA" : "Candidato"}: ${line.content}`)
      .join("\n");
    return [
      `Resumen: ${response.summary}`,
      `Comunicacion: ${response.communication_summary}`,
      `Recomendacion: ${response.recommendation}`,
      `Fortalezas: ${response.strengths.join(", ") || "Sin fortalezas registradas"}`,
      `Riesgos: ${response.risks.join(", ") || "Sin riesgos registrados"}`,
      codeOutput ? `Salida de codigo:\n${codeOutput}` : "",
      notes ? `Notas del candidato:\n${notes}` : "",
      lastTurns ? `Ultimos turnos:\n${lastTurns}` : "",
    ].filter(Boolean).join("\n\n");
  }

  function escapeHtml(value: string) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function estimatedRanking(score: number) {
    if (score >= 92) return "Puesto 1 entre candidatos aprobados";
    if (score >= 86) return "Puesto 2 entre candidatos aprobados";
    if (score >= 80) return "Puesto 3 entre candidatos aprobados";
    if (score >= 75) return "Aprobado, ranking sujeto al total de candidatos";
    return "No ingresa al ranking de aprobados";
  }

  function buildDownloadableReport(response: FinishPracticalResponse) {
    const finalScore = Number(response.final_score ?? response.score ?? 0);
    const passedLabel = response.passed ? "APROBADO" : "NO APROBADO";
    const turns = transcriptRef.current
      .slice(-12)
      .map((line) => `<p><strong>${line.role === "agent" ? "IA" : "Profesional"}:</strong> ${escapeHtml(line.content)}</p>`)
      .join("");
    const security = securityEvents
      .map((event) => `<li>${escapeHtml(event.type)}: ${escapeHtml(event.detail)} (${new Date(event.at).toLocaleTimeString("es-PE")})</li>`)
      .join("");
    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Reporte entrevista practica - Achanvear</title>
  <style>
    body{font-family:Inter,Arial,sans-serif;margin:0;background:#f4f7fb;color:#0f172a}
    .page{max-width:980px;margin:32px auto;background:white;border:1px solid #e2e8f0;border-radius:22px;overflow:hidden;box-shadow:0 20px 60px rgba(15,23,42,.08)}
    .hero{background:#102a43;color:white;padding:28px 34px;display:flex;justify-content:space-between;gap:24px}
    .brand{display:flex;align-items:center;gap:14px}.logo{width:48px;height:48px;border-radius:14px;background:#14b8a6;display:grid;place-items:center;font-weight:900}
    .badge{display:inline-block;border-radius:999px;padding:7px 12px;background:${response.passed ? "#dcfce7" : "#fee2e2"};color:${response.passed ? "#166534" : "#991b1b"};font-weight:800;font-size:12px}
    .content{padding:30px 34px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.card{border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#fff}
    .score{font-size:34px;font-weight:900;color:#102a43}.label{font-size:12px;color:#64748b;text-transform:uppercase;font-weight:800}
    h2{margin:28px 0 12px;font-size:17px}.section{border-top:1px solid #e2e8f0;margin-top:24px;padding-top:20px}
    ul{margin:8px 0 0 18px}.muted{color:#64748b}.turns p{background:#f8fafc;border-radius:12px;padding:10px 12px}
  </style>
</head>
<body>
  <main class="page">
    <section class="hero">
      <div class="brand"><div class="logo">A</div><div><h1>Achanvear</h1><p>Informe ejecutivo de entrevista practica</p></div></div>
      <div><span class="badge">${passedLabel}</span><p>${new Date().toLocaleString("es-PE")}</p></div>
    </section>
    <section class="content">
      <p class="label">Profesional</p>
      <h1>${escapeHtml(candidateName || "Profesional evaluado")}</h1>
      <p class="muted">Puesto: ${escapeHtml(jobTitle)} · Area: ${escapeHtml(career)}</p>
      <p class="muted">Entrevistador IA: ${escapeHtml(interviewer?.name || "Agente IA")} · ${escapeHtml(interviewer?.role || "Evaluacion practica")}</p>
      <div class="grid">
        <div class="card"><p class="label">Final</p><p class="score">${finalScore}/100</p></div>
        <div class="card"><p class="label">Tecnico</p><p class="score">${response.score}/100</p></div>
        <div class="card"><p class="label">Experiencia</p><p class="score">${response.theory_score}/100</p></div>
        <div class="card"><p class="label">Psicologico/comunicacion</p><p class="score">${response.communication_score}/100</p></div>
      </div>
      <div class="section"><h2>Ranking</h2><p>${estimatedRanking(finalScore)}. El puesto final se recalcula con todos los candidatos aprobados de la vacante.</p></div>
      <div class="section"><h2>Resumen ejecutivo</h2><p>${escapeHtml(response.summary)}</p><p>${escapeHtml(response.communication_summary || "")}</p></div>
      <div class="section"><h2>Fortalezas</h2><ul>${response.strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
      <div class="section"><h2>Riesgos</h2><ul>${response.risks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
      <div class="section"><h2>Recomendacion</h2><p>${escapeHtml(response.recommendation)}</p></div>
      <div class="section"><h2>Monitoreo antifraude</h2><p>Alertas registradas: ${violations}</p><ul>${security || "<li>Sin alertas relevantes.</li>"}</ul></div>
      <div class="section turns"><h2>Evidencia de conversacion</h2>${turns || "<p>Sin turnos registrados.</p>"}</div>
    </section>
  </main>
</body>
</html>`;
  }

  function downloadReport() {
    if (!result) return;
    const html = buildDownloadableReport(result);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `reporte-entrevista-${sessionId.slice(0, 8)}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function playBase64Audio(audioBase64: string, format: string) {
    stopBrowserSpeech();
    const audio = new Audio(`data:audio/${format};base64,${audioBase64}`);
    currentAudioRef.current = audio;
    setVoice("speaking");
    audio.onended = () => setVoice("idle");
    audio.onerror = () => setVoice("idle");
    audio.play().catch(() => undefined);
  }

  function inferEditorLanguage(file: PracticalCodeFile | undefined) {
    if (file?.language) return file.language;
    const path = file?.path ?? activeFilePath;
    if (path.endsWith(".js")) return "javascript";
    if (path.endsWith(".ts")) return "typescript";
    if (path.endsWith(".py")) return "python";
    if (path.endsWith(".java")) return "java";
    if (path.endsWith(".cs")) return "csharp";
    if (path.endsWith(".go")) return "go";
    if (path.endsWith(".php")) return "php";
    if (path.endsWith(".rb")) return "ruby";
    if (path.endsWith(".sql")) return "sql";
    if (path.endsWith(".mongo") || path.endsWith(".mongodb")) return "javascript";
    if (path.endsWith(".md")) return "markdown";
    if (path.endsWith(".html")) return "html";
    if (path.endsWith(".css")) return "css";
    return codeLanguage;
  }

  function inferLanguageFromPath(path: string) {
    const normalized = path.toLowerCase();
    if (normalized.endsWith(".js") || normalized.endsWith(".jsx")) return "javascript";
    if (normalized.endsWith(".ts") || normalized.endsWith(".tsx")) return "typescript";
    if (normalized.endsWith(".py")) return "python";
    if (normalized.endsWith(".java")) return "java";
    if (normalized.endsWith(".cs")) return "csharp";
    if (normalized.endsWith(".go")) return "go";
    if (normalized.endsWith(".php")) return "php";
    if (normalized.endsWith(".rb")) return "ruby";
    if (normalized.endsWith(".sql")) return "postgresql";
    if (normalized.endsWith(".mongo") || normalized.endsWith(".mongodb")) return "mongodb";
    if (normalized.endsWith(".html")) return "html";
    if (normalized.endsWith(".css")) return "css";
    return codeLanguage;
  }

  function deriveFolders(paths: string[]) {
    const folders = new Set<string>();
    paths.forEach((path) => {
      const parts = path.replaceAll("\\", "/").split("/").filter(Boolean);
      parts.slice(0, -1).forEach((_, index) => {
        folders.add(parts.slice(0, index + 1).join("/"));
      });
    });
    return Array.from(folders).sort((a, b) => a.localeCompare(b));
  }

  function normalizeProjectPath(path: string) {
    return path.trim().replaceAll("\\", "/").replace(/^\/+/, "").replace(/\/+/g, "/");
  }

  function addFolder() {
    const rawPath = normalizeProjectPath(newFolderPath).replace(/\/$/, "");
    const cleanPath = selectedFolderPath && rawPath && !rawPath.includes("/")
      ? `${selectedFolderPath}/${rawPath}`
      : rawPath;
    if (!cleanPath || projectFolders.includes(cleanPath)) return;
    setProjectFolders((current) => Array.from(new Set([...current, cleanPath, ...deriveFolders([`${cleanPath}/.keep`])])).sort((a, b) => a.localeCompare(b)));
    setSelectedFolderPath(cleanPath);
    setNewFolderPath("");
    setCreateDialog(null);
  }

  function fileExtension(path: string) {
    const match = path.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toUpperCase() : "FILE";
  }

  function extensionStyle(path: string) {
    const ext = fileExtension(path).toLowerCase();
    const styles: Record<string, { icon: string; badge: string; label: string }> = {
      ts: { icon: "text-sky-300", badge: "bg-sky-400/15 text-sky-200", label: "TS" },
      tsx: { icon: "text-sky-300", badge: "bg-sky-400/15 text-sky-200", label: "TSX" },
      js: { icon: "text-yellow-300", badge: "bg-yellow-300/15 text-yellow-100", label: "JS" },
      jsx: { icon: "text-yellow-300", badge: "bg-yellow-300/15 text-yellow-100", label: "JSX" },
      py: { icon: "text-blue-300", badge: "bg-blue-400/15 text-blue-100", label: "PY" },
      java: { icon: "text-orange-300", badge: "bg-orange-400/15 text-orange-100", label: "JAVA" },
      cs: { icon: "text-violet-300", badge: "bg-violet-400/15 text-violet-100", label: "C#" },
      go: { icon: "text-cyan-300", badge: "bg-cyan-400/15 text-cyan-100", label: "GO" },
      php: { icon: "text-indigo-300", badge: "bg-indigo-400/15 text-indigo-100", label: "PHP" },
      rb: { icon: "text-red-300", badge: "bg-red-400/15 text-red-100", label: "RB" },
      sql: { icon: "text-pink-300", badge: "bg-pink-400/15 text-pink-100", label: "SQL" },
      html: { icon: "text-orange-300", badge: "bg-orange-400/15 text-orange-100", label: "HTML" },
      css: { icon: "text-blue-300", badge: "bg-blue-400/15 text-blue-100", label: "CSS" },
      md: { icon: "text-slate-300", badge: "bg-slate-400/15 text-slate-200", label: "MD" },
      json: { icon: "text-amber-300", badge: "bg-amber-400/15 text-amber-100", label: "JSON" },
    };
    return styles[ext] ?? { icon: "text-emerald-300", badge: "bg-emerald-400/15 text-emerald-100", label: fileExtension(path) };
  }

  function buildExplorerTree() {
    const nodes = new Map<string, { path: string; name: string; level: number; type: "folder" | "file"; file?: PracticalCodeFile }>();
    projectFolders.forEach((folder) => {
      const parts = folder.split("/").filter(Boolean);
      parts.forEach((_, index) => {
        const path = parts.slice(0, index + 1).join("/");
        nodes.set(path, {
          path,
          name: parts[index],
          level: index,
          type: "folder",
        });
      });
    });
    codeFiles.forEach((file) => {
      const parts = file.path.split("/").filter(Boolean);
      parts.slice(0, -1).forEach((_, index) => {
        const path = parts.slice(0, index + 1).join("/");
        if (!nodes.has(path)) {
          nodes.set(path, {
            path,
            name: parts[index],
            level: index,
            type: "folder",
          });
        }
      });
      nodes.set(`file:${file.path}`, {
        path: file.path,
        name: parts.at(-1) ?? file.path,
        level: Math.max(0, parts.length - 1),
        type: "file",
        file,
      });
    });

    return Array.from(nodes.values()).sort((a, b) => {
      const aKey = a.type === "folder" ? `${a.path}/` : a.path;
      const bKey = b.type === "folder" ? `${b.path}/` : b.path;
      return aKey.localeCompare(bKey);
    });
  }

  const languageOptions = [
    { value: "typescript", label: "TypeScript", short: "TS", accent: "bg-sky-400/15 text-sky-100 border-sky-300/25" },
    { value: "javascript", label: "JavaScript", short: "JS", accent: "bg-yellow-300/15 text-yellow-100 border-yellow-300/25" },
    { value: "python", label: "Python", short: "PY", accent: "bg-blue-400/15 text-blue-100 border-blue-300/25" },
    { value: "java", label: "Java", short: "JAVA", accent: "bg-orange-400/15 text-orange-100 border-orange-300/25" },
    { value: "csharp", label: "C#", short: "C#", accent: "bg-violet-400/15 text-violet-100 border-violet-300/25" },
    { value: "go", label: "Go", short: "GO", accent: "bg-cyan-400/15 text-cyan-100 border-cyan-300/25" },
    { value: "php", label: "PHP", short: "PHP", accent: "bg-indigo-400/15 text-indigo-100 border-indigo-300/25" },
    { value: "ruby", label: "Ruby", short: "RB", accent: "bg-red-400/15 text-red-100 border-red-300/25" },
    { value: "postgresql", label: "PostgreSQL / SQL", short: "SQL", accent: "bg-pink-400/15 text-pink-100 border-pink-300/25" },
    { value: "mongodb", label: "MongoDB / NoSQL", short: "MDB", accent: "bg-emerald-400/15 text-emerald-100 border-emerald-300/25" },
  ];
  const selectedLanguage = languageOptions.find((item) => item.value === codeLanguage) ?? languageOptions[0];
  const languageStarters: Record<string, PracticalCodeFile> = {
    typescript: { path: "hello.ts", language: "typescript", content: "export function main() {\n  return 'Hola mundo desde TypeScript';\n}\n\nconsole.log(main());\n" },
    javascript: { path: "hello.js", language: "javascript", content: "function main() {\n  return 'Hola mundo desde JavaScript';\n}\n\nconsole.log(main());\n" },
    python: { path: "hello.py", language: "python", content: "def main():\n    return 'Hola mundo desde Python'\n\nprint(main())\n" },
    java: { path: "Main.java", language: "java", content: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hola mundo desde Java\");\n    }\n}\n" },
    csharp: { path: "Program.cs", language: "csharp", content: "using System;\n\npublic class Program\n{\n    public static void Main()\n    {\n        Console.WriteLine(\"Hola mundo desde C#\");\n    }\n}\n" },
    go: { path: "main.go", language: "go", content: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hola mundo desde Go\")\n}\n" },
    php: { path: "index.php", language: "php", content: "<?php\n\necho \"Hola mundo desde PHP\" . PHP_EOL;\n" },
    ruby: { path: "main.rb", language: "ruby", content: "puts 'Hola mundo desde Ruby'\n" },
    postgresql: { path: "database/hello.sql", language: "postgresql", content: "SELECT 'Hola mundo desde PostgreSQL' AS mensaje;\n" },
    mongodb: { path: "database/hello.mongodb", language: "mongodb", content: "db.healthcheck.insertOne({ message: 'Hola mundo desde MongoDB', createdAt: new Date() });\ndb.healthcheck.find({});\n" },
  };
  const filteredLanguageOptions = languageOptions.filter((option) => {
    const query = languageSearch.trim().toLowerCase();
    if (!query) return true;
    return `${option.label} ${option.short}`.toLowerCase().includes(query);
  });
  const architectureTemplates: Array<{ id: string; name: string; description: string; files: PracticalCodeFile[] }> = [
    {
      id: "clean-ts",
      name: "Clean Architecture",
      description: "domain, application, infrastructure y presentation.",
      files: [
        { path: "src/domain/entities/Candidate.ts", language: "typescript", content: "export type Candidate = {\n  id: string;\n  name: string;\n  score: number;\n  passed: boolean;\n};\n" },
        { path: "src/domain/repositories/CandidateRepository.ts", language: "typescript", content: "import type { Candidate } from '../entities/Candidate';\n\nexport interface CandidateRepository {\n  findAll(): Promise<Candidate[]>;\n}\n" },
        { path: "src/application/use-cases/RankCandidates.ts", language: "typescript", content: "import type { CandidateRepository } from '../../domain/repositories/CandidateRepository';\n\nexport class RankCandidates {\n  constructor(private readonly repository: CandidateRepository) {}\n\n  async execute() {\n    const candidates = await this.repository.findAll();\n    return candidates.filter((candidate) => candidate.passed).sort((a, b) => b.score - a.score);\n  }\n}\n" },
        { path: "src/infrastructure/InMemoryCandidateRepository.ts", language: "typescript", content: "import type { Candidate } from '../domain/entities/Candidate';\nimport type { CandidateRepository } from '../domain/repositories/CandidateRepository';\n\nexport class InMemoryCandidateRepository implements CandidateRepository {\n  async findAll(): Promise<Candidate[]> {\n    return [];\n  }\n}\n" },
        { path: "src/presentation/renderCandidateCard.ts", language: "typescript", content: "import type { Candidate } from '../domain/entities/Candidate';\n\nexport function renderCandidateCard(candidate: Candidate) {\n  return `<article>${candidate.name}</article>`;\n}\n" },
      ],
    },
    {
      id: "hexagonal-ts",
      name: "Hexagonal",
      description: "ports, adapters y application service.",
      files: [
        { path: "src/core/model/Candidate.ts", language: "typescript", content: "export type Candidate = { id: string; name: string; score: number; passed: boolean };\n" },
        { path: "src/core/ports/CandidatePort.ts", language: "typescript", content: "import type { Candidate } from '../model/Candidate';\n\nexport interface CandidatePort {\n  list(): Promise<Candidate[]>;\n}\n" },
        { path: "src/core/services/CandidateRankingService.ts", language: "typescript", content: "import type { CandidatePort } from '../ports/CandidatePort';\n\nexport class CandidateRankingService {\n  constructor(private readonly candidates: CandidatePort) {}\n\n  async rankApproved() {\n    return (await this.candidates.list()).filter((item) => item.passed).sort((a, b) => b.score - a.score);\n  }\n}\n" },
        { path: "src/adapters/in-memory/InMemoryCandidateAdapter.ts", language: "typescript", content: "import type { CandidatePort } from '../../core/ports/CandidatePort';\n\nexport class InMemoryCandidateAdapter implements CandidatePort {\n  async list() { return []; }\n}\n" },
      ],
    },
    {
      id: "fullstack-crud",
      name: "Frontend + Backend CRUD",
      description: "React service, API handler y SQL schema.",
      files: [
        { path: "frontend/src/components/CandidateList.tsx", language: "typescript", content: "export function CandidateList() {\n  return <section aria-label=\"Candidates\"></section>;\n}\n" },
        { path: "frontend/src/services/candidateApi.ts", language: "typescript", content: "export async function listCandidates() {\n  return [];\n}\n" },
        { path: "backend/src/controllers/candidateController.ts", language: "typescript", content: "export async function listCandidatesController() {\n  return [];\n}\n" },
        { path: "backend/src/services/candidateService.ts", language: "typescript", content: "export function rankCandidates(candidates: Array<{ score: number }>) {\n  return [...candidates].sort((a, b) => b.score - a.score);\n}\n" },
        { path: "database/schema.sql", language: "sql", content: "CREATE TABLE candidates (\n  id uuid PRIMARY KEY,\n  name text NOT NULL,\n  score numeric NOT NULL,\n  passed boolean NOT NULL DEFAULT false\n);\n" },
      ],
    },
    {
      id: "monolith",
      name: "Monolito Modular",
      description: "modules con controller, service y repository.",
      files: [
        { path: "src/modules/candidates/candidate.controller.ts", language: "typescript", content: "export class CandidateController {}\n" },
        { path: "src/modules/candidates/candidate.service.ts", language: "typescript", content: "export class CandidateService {}\n" },
        { path: "src/modules/candidates/candidate.repository.ts", language: "typescript", content: "export class CandidateRepository {}\n" },
        { path: "src/shared/errors/AppError.ts", language: "typescript", content: "export class AppError extends Error {}\n" },
      ],
    },
  ];

  function selectFile(path: string) {
    const file = codeFiles.find((item) => item.path === path);
    if (!file) return;
    setActiveFilePath(path);
    setCode(file.content);
  }

  function updateActiveFile(value: string) {
    setCode(value);
    if (!activeFilePath) return;
    setCodeFiles((current) =>
      current.map((file) => file.path === activeFilePath ? { ...file, content: value } : file)
    );
  }

  function addFile() {
    const rawPath = normalizeProjectPath(newFilePath);
    const cleanPath = selectedFolderPath && rawPath && !rawPath.includes("/")
      ? `${selectedFolderPath}/${rawPath}`
      : rawPath;
    if (!cleanPath || codeFiles.some((file) => file.path === cleanPath)) return;
    if (!/\.[a-z0-9]+$/i.test(cleanPath)) {
      setError("Crea el archivo con extension, por ejemplo src/services/CandidateService.ts");
      return;
    }
    const language = inferLanguageFromPath(cleanPath);
    const nextFile = { path: cleanPath, content: "", language };
    setCodeFiles((current) => [...current, nextFile]);
    setProjectFolders((current) => Array.from(new Set([...current, ...deriveFolders([cleanPath])])).sort((a, b) => a.localeCompare(b)));
    setActiveFilePath(cleanPath);
    setCode("");
    setCodeLanguage(language);
    setNewFilePath("");
    setError(null);
    setCreateDialog(null);
  }

  function applyArchitectureTemplate(templateId: string) {
    const template = architectureTemplates.find((item) => item.id === templateId);
    if (!template) return;
    setCodeFiles((current) => {
      const existing = new Set(current.map((file) => file.path));
      const nextFiles = template.files.filter((file) => !existing.has(file.path));
      const next = [...current, ...nextFiles];
      setProjectFolders(deriveFolders(next.map((file) => file.path)));
      const firstFile = nextFiles[0] ?? next[0];
      if (firstFile) {
        setActiveFilePath(firstFile.path);
        setCode(firstFile.content);
        setCodeLanguage(inferLanguageFromPath(firstFile.path));
      }
      return next;
    });
    setTemplateDialogOpen(false);
  }

  function fixLanguage(language: string) {
    setCodeLanguage(language);
    const starter = languageStarters[language];
    if (starter) {
      setCodeFiles((current) => {
        const exists = current.some((file) => file.path === starter.path);
        const next = exists ? current : [...current, starter];
        setProjectFolders(deriveFolders(next.map((file) => file.path)));
        return next;
      });
      setActiveFilePath(starter.path);
      setCode(starter.content);
    }
    setLanguageDialogOpen(false);
    setLanguageSearch("");
  }

  function removeFile(path: string) {
    setCodeFiles((current) => {
      const next = current.filter((file) => file.path !== path);
      if (path === activeFilePath) {
        setActiveFilePath(next[0]?.path ?? "");
        setCode(next[0]?.content ?? "");
      }
      setProjectFolders(deriveFolders(next.map((file) => file.path)));
      return next;
    });
  }

  function removeFolder(path: string) {
    const normalized = normalizeProjectPath(path).replace(/\/$/, "");
    setCodeFiles((current) => {
      const next = current.filter((file) => file.path !== normalized && !file.path.startsWith(`${normalized}/`));
      if (activeFilePath === normalized || activeFilePath.startsWith(`${normalized}/`)) {
        setActiveFilePath(next[0]?.path ?? "");
        setCode(next[0]?.content ?? "");
      }
      if (selectedFolderPath === normalized || selectedFolderPath.startsWith(`${normalized}/`)) {
        setSelectedFolderPath("");
      }
      setProjectFolders(deriveFolders(next.map((file) => file.path)));
      return next;
    });
  }

  function startMeetPanelDrag(event: PointerEvent<HTMLDivElement>) {
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: meetPanelPosition.x,
      originY: meetPanelPosition.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveMeetPanel(event: PointerEvent<HTMLDivElement>) {
    const drag = dragStateRef.current;
    if (!drag) return;
    const panelWidth = 300;
    const panelHeight = 230;
    const maxX = Math.max(8, window.innerWidth - panelWidth - 8);
    const maxY = Math.max(8, window.innerHeight - panelHeight - 8);
    setMeetPanelPosition({
      x: Math.min(maxX, Math.max(8, drag.originX + event.clientX - drag.startX)),
      y: Math.min(maxY, Math.max(8, drag.originY + event.clientY - drag.startY)),
    });
  }

  function stopMeetPanelDrag(event: PointerEvent<HTMLDivElement>) {
    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function startExplorerResize(event: PointerEvent<HTMLDivElement>) {
    explorerResizeRef.current = { startX: event.clientX, originWidth: explorerWidth };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveExplorerResize(event: PointerEvent<HTMLDivElement>) {
    const resize = explorerResizeRef.current;
    if (!resize) return;
    setExplorerWidth(Math.min(460, Math.max(220, resize.originWidth + event.clientX - resize.startX)));
  }

  function stopExplorerResize(event: PointerEvent<HTMLDivElement>) {
    explorerResizeRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  async function runCode() {
    try {
      setCodeOutput("Ejecutando en runner multi-lenguaje...");
      const entryFile = activeFilePath || challenge?.entry_file || codeFiles[0]?.path;
      const response = await runPracticalCode({
        language: codeLanguage,
        code,
        files: codeFiles.length > 0 ? codeFiles : undefined,
        entry_file: entryFile,
        function_name: challenge?.function_name,
        test_cases: challenge?.test_cases,
      });
      setLastRun({ ...response, ranAt: new Date().toISOString() });
      const outputText = [
        response.success ? "Ejecucion correcta" : "Ejecucion con errores",
        `Lenguaje: ${response.language || codeLanguage}`,
        `Exit code: ${response.exit_code}`,
        response.stdout ? `Salida:\n${response.stdout}` : "",
        response.stderr ? `Errores:\n${response.stderr}` : "",
      ].filter(Boolean).join("\n\n");
      setCodeOutput(outputText);
      sendWsJson({
        type: "workspace_state",
        payload: {
          ...workspaceRef.current,
          activeFilePath: entryFile,
          codeOutput: outputText,
          lastRun: { ...response, ranAt: new Date().toISOString() },
        },
      });
      if (challenge?.preview === "html" && response.stdout) {
        try {
          const parsed = JSON.parse(response.stdout);
          const first = Array.isArray(parsed) ? parsed[0] : parsed;
          if (typeof first === "string") setPreviewHtml(first);
        } catch {
          setPreviewHtml(response.stdout);
        }
      }
    } catch (err: any) {
      setCodeOutput(`Error al ejecutar: ${err?.message || "codigo invalido"}`);
    }
  }

  const isCoding = resolvedWorkspaceType === "coding";
  const interviewer = challenge?.interviewer_profile;
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
  const timerTone = timeLeft <= 2 * 60 ? "danger" : timeLeft <= 5 * 60 ? "warning" : "ok";
  const timerPercent = Math.max(0, Math.min(100, (timeLeft / (20 * 60)) * 100));
  const explorerItems = buildExplorerTree();
  const micLabel = status === "recording" ? "Pausar" : status === "thinking" ? "Pensando" : "Hablar";
  const headerButtonClass = "inline-flex h-9 min-w-[104px] items-center justify-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-3 text-xs font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/[0.1] disabled:opacity-50";
  const headerPrimaryButtonClass = "inline-flex h-9 min-w-[104px] items-center justify-center gap-1.5 rounded-lg border border-emerald-300/30 bg-emerald-400 px-3 text-xs font-bold text-slate-950 transition hover:bg-emerald-300";
  const headerDangerButtonClass = "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-white/[0.06] text-white/75 transition hover:border-red-300/35 hover:bg-red-400/10 hover:text-red-100";
  const fullMicLabel = status === "recording"
    ? "Pausar microfono"
    : status === "thinking"
      ? "El agente esta razonando..."
      : "Iniciar conversacion por voz";
  const renderMicIcon = () => (
    <span className="relative inline-grid h-4 w-4 shrink-0 place-items-center" aria-hidden="true">
      <Loader2 className={`absolute h-4 w-4 animate-spin transition-opacity ${status === "thinking" ? "opacity-100" : "opacity-0"}`} />
      <MicOff className={`absolute h-4 w-4 transition-opacity ${status === "recording" ? "opacity-100" : "opacity-0"}`} />
      <Mic className={`absolute h-4 w-4 transition-opacity ${status !== "thinking" && status !== "recording" ? "opacity-100" : "opacity-0"}`} />
    </span>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white">
      {exitCountdown !== null && (
        <div className="absolute inset-x-0 top-16 z-20 mx-auto w-fit max-w-[calc(100%-2rem)] rounded-xl border border-red-400/40 bg-red-500/20 px-5 py-3 text-center shadow-2xl backdrop-blur">
          <p className="text-sm font-bold text-red-50">Estas fuera de la pantalla de entrevista</p>
          <p className="mt-1 text-xs text-red-100">
            Salida {screenExitCount}/3. Regresa en {exitCountdown} segundos o quedaras descalificado.
          </p>
        </div>
      )}
      {createDialog && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/20 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#111827]/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                {createDialog === "file" ? <FilePlus2 className="h-4 w-4 text-emerald-300" /> : <FolderPlus className="h-4 w-4 text-sky-300" />}
                <p className="text-sm font-bold text-white">{createDialog === "file" ? "Nuevo archivo" : "Nueva carpeta"}</p>
              </div>
              <button onClick={() => setCreateDialog(null)} className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <input
                autoFocus
                value={createDialog === "file" ? newFilePath : newFolderPath}
                onChange={(event) => createDialog === "file" ? setNewFilePath(event.target.value) : setNewFolderPath(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    if (createDialog === "file") addFile();
                    else addFolder();
                  }
                  if (event.key === "Escape") setCreateDialog(null);
                }}
                placeholder={createDialog === "file" ? (selectedFolderPath ? "CandidateService.ts" : "src/services/CandidateService.ts") : (selectedFolderPath ? "domain" : "src/services")}
                className="w-full rounded-lg border border-white/10 bg-[#0b1120] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/50"
              />
              <p className="text-xs text-slate-400">
                {selectedFolderPath && <>Destino: <span className="font-semibold text-slate-200">{selectedFolderPath}/</span> </>}
                {createDialog === "file"
                  ? "Incluye extension para inferir lenguaje y evaluacion."
                  : "Puedes crear rutas anidadas o una carpeta hija."}
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setCreateDialog(null)} className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 hover:text-white">
                  Cancelar
                </button>
                <button
                  onClick={createDialog === "file" ? addFile : addFolder}
                  className="rounded-lg bg-emerald-400 px-3 py-2 text-sm font-bold text-slate-950"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {languageDialogOpen && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/20 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-[#111827]/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-white">Fijar lenguaje de ejecucion</p>
                <p className="text-xs text-slate-400">Puedes tener frontend, backend y SQL; esto fija el runner principal.</p>
              </div>
              <button onClick={() => setLanguageDialogOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <input
                autoFocus
                value={languageSearch}
                onChange={(event) => setLanguageSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setLanguageDialogOpen(false);
                }}
                placeholder="Buscar Java, TypeScript, Python, SQL..."
                className="w-full rounded-lg border border-white/10 bg-[#0b1120] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/50"
              />
              <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
                {filteredLanguageOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => fixLanguage(option.value)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left hover:bg-white/10 ${
                      option.value === codeLanguage ? "border-emerald-300/45 bg-emerald-300/10" : "border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-bold text-white">{option.label}</span>
                      <span className="text-xs text-slate-400">Fijar y crear hello world ejecutable</span>
                    </span>
                    <span className={`rounded border px-2 py-1 text-[10px] font-black ${option.accent}`}>{option.short}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {templateDialogOpen && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/20 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[#111827]/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-white">Plantillas de organizacion</p>
                <p className="text-xs text-slate-400">Crea una estructura base para evaluar arquitectura y criterio senior.</p>
              </div>
              <button onClick={() => setTemplateDialogOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              {architectureTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyArchitectureTemplate(template.id)}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-left hover:border-emerald-300/35 hover:bg-emerald-300/10"
                >
                  <div className="flex items-center gap-2">
                    <Layers3 className="h-4 w-4 text-emerald-300" />
                    <span className="text-sm font-bold text-white">{template.name}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{template.description}</p>
                  <p className="mt-2 text-[11px] text-slate-500">{template.files.length} archivos base</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {folderContextMenu && (
        <div
          className="absolute z-50 w-48 overflow-hidden rounded-lg border border-white/10 bg-[#252526]/95 py-1 text-xs text-slate-200 shadow-2xl"
          style={{ left: folderContextMenu.x, top: folderContextMenu.y }}
        >
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-white/10"
            onClick={() => {
              setSelectedFolderPath(folderContextMenu.path);
              setCreateDialog("file");
              setFolderContextMenu(null);
            }}
          >
            <FilePlus2 className="h-3.5 w-3.5 text-emerald-300" /> Nuevo archivo
          </button>
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-white/10"
            onClick={() => {
              setSelectedFolderPath(folderContextMenu.path);
              setCreateDialog("folder");
              setFolderContextMenu(null);
            }}
          >
            <FolderPlus className="h-3.5 w-3.5 text-sky-300" /> Nueva carpeta
          </button>
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-100 hover:bg-red-400/15"
            onClick={() => {
              removeFolder(folderContextMenu.path);
              setFolderContextMenu(null);
            }}
          >
            <X className="h-3.5 w-3.5" /> Eliminar carpeta
          </button>
        </div>
      )}
      <div className="flex h-full flex-col">
        <header className="flex min-h-[44px] items-center justify-end gap-1.5 border-b border-white/10 px-3 py-1.5">
          <div className="hidden">
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-300">Entrevista practica IA</p>
            <h1 className="truncate text-sm font-semibold leading-5">{challenge?.title ?? "Preparando entorno..."}</h1>
            <span className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              voiceStatus === "speaking"
                ? "bg-sky-400/15 text-sky-200"
                : voiceStatus === "listening"
                  ? "bg-emerald-400/15 text-emerald-200"
                  : "bg-white/10 text-white/60"
            }`}>
              {voiceStatus === "speaking" ? "IA hablando" : voiceStatus === "listening" ? "Escuchando" : "Voz lista"}
            </span>
            {interviewer && (
              <p className="truncate text-[11px] text-slate-400">
                {interviewer.name} · {interviewer.role} · {interviewer.gender === "female" ? "voz femenina" : "voz masculina"}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => setShowCase((current) => !current)}
              className={headerButtonClass}
            >
              {isCoding ? <Code2 className="h-3.5 w-3.5" /> : challenge?.workspace_tool === "case_notes" ? <Stethoscope className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
              Caso
            </button>
            {isCoding && (
              <>
                <button
                  onClick={() => setLanguageDialogOpen(true)}
                  className={headerButtonClass}
                >
                  <span className={`rounded border px-1.5 py-0.5 text-[9px] font-black ${selectedLanguage.accent}`}>
                    {selectedLanguage.short}
                  </span>
                  {selectedLanguage.label}
                </button>
                <button onClick={runCode} className={headerPrimaryButtonClass}>
                  <Play className="h-3.5 w-3.5" /> Ejecutar
                </button>
              </>
            )}
            <div className={`flex h-9 min-w-[118px] flex-col justify-center rounded-lg border px-2.5 ${
              timerTone === "danger"
                ? "border-red-400/50 bg-red-500/15"
                : timerTone === "warning"
                  ? "border-amber-300/50 bg-amber-400/15"
                  : "border-emerald-300/40 bg-emerald-400/15"
            }`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-black uppercase ${
                  timerTone === "danger" ? "text-red-100" : timerTone === "warning" ? "text-amber-100" : "text-emerald-100"
                }`}>
                  {timerTone === "danger" ? "Finaliza" : timerTone === "warning" ? "Atencion" : "Tiempo"}
                </span>
                <span className="font-mono text-base font-black leading-none text-white">{minutes}:{seconds}</span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${
                    timerTone === "danger" ? "bg-red-400" : timerTone === "warning" ? "bg-amber-300" : "bg-emerald-300"
                  }`}
                  style={{ width: `${timerPercent}%` }}
                />
              </div>
            </div>
            <span className="inline-flex h-9 min-w-[118px] items-center justify-center rounded-lg border border-red-300/15 bg-red-500/10 px-2.5 text-[11px] font-semibold text-red-200">
              Alertas: {violations} · Salidas: {screenExitCount}/3
            </span>
            <button
              onClick={() => setShowMeetPanel((current) => !current)}
              className={headerButtonClass}
            >
              <Video className="h-3.5 w-3.5 text-emerald-300" /> {showMeetPanel ? "Ocultar sala" : "Ver sala"}
            </button>
            <button
              onClick={status === "recording" ? stopRecording : startRecording}
              disabled={status === "booting" || status === "finished"}
              className="inline-flex h-9 min-w-[104px] items-center justify-center gap-1.5 rounded-lg border border-sky-300/35 bg-sky-400 px-3 text-xs font-bold text-slate-950 transition hover:bg-sky-300 disabled:opacity-50"
            >
              {renderMicIcon()}
              {micLabel}
            </button>
            <button
              onClick={() => setShowHistory((current) => !current)}
              className={headerButtonClass}
            >
              <History className="h-3.5 w-3.5" /> Historial
            </button>
            <button onClick={() => finish(false)} className={headerPrimaryButtonClass}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Entregar
            </button>
            <button onClick={() => cancelPracticalInterview()} className={headerDangerButtonClass}>
              <PhoneOff className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <main className="relative grid min-h-0 flex-1 grid-cols-1 gap-0" onClick={() => setFolderContextMenu(null)}>
          {showMeetPanel ? (
            <div
              className="absolute z-20 w-[300px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur"
              style={{ left: meetPanelPosition.x, top: meetPanelPosition.y }}
            >
              <div
                className="flex cursor-move touch-none items-center justify-between border-b border-white/10 px-3 py-2"
                onPointerDown={startMeetPanelDrag}
                onPointerMove={moveMeetPanel}
                onPointerUp={stopMeetPanelDrag}
                onPointerCancel={stopMeetPanelDrag}
              >
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-emerald-300" />
                  <span className="text-xs font-semibold text-white">Entrevista grabada y monitoreada</span>
                </div>
                <button
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => setShowMeetPanel(false)}
                  className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <EyeOff className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                <div className="relative flex aspect-video flex-col items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-400 text-lg font-black text-slate-950">
                    {(interviewer?.name ?? "IA").slice(0, 1)}
                  </div>
                  <p className="mt-2 max-w-[120px] truncate text-xs font-semibold text-white">{interviewer?.name ?? "Agente IA"}</p>
                  {voiceStatus === "speaking" && <span className="absolute right-2 top-2 rounded-full bg-sky-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">hablando</span>}
                </div>
                <div className="relative flex aspect-video flex-col items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900">
                  <div className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-sky-400 text-lg font-black text-slate-950 ring-2 ring-sky-200/50">
                    <UserRound className="h-8 w-8" />
                    <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400" />
                  </div>
                  <p className="mt-2 max-w-[120px] truncate text-xs font-semibold text-white">{candidateName || "Profesional"}</p>
                  {voiceStatus === "listening" && <span className="absolute right-2 top-2 rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">escuchando</span>}
                </div>
              </div>
              <div className="border-t border-white/10 px-3 py-2">
                <p className="text-[11px] leading-4 text-slate-300">
                  Evidencia activa: voz, transcripcion, workspace, alertas de pantalla y cambios de foco.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-200">
                  <span className="h-2 w-2 rounded-full bg-red-400" /> REC
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={status === "recording" ? stopRecording : startRecording}
                    disabled={status === "booting" || status === "finished"}
                    className="rounded-full bg-white/10 p-2 text-white hover:bg-white/15 disabled:opacity-50"
                  >
                    {renderMicIcon()}
                  </button>
                  <button onClick={() => cancelPracticalInterview()} className="rounded-full bg-red-500 p-2 text-white">
                    <PhoneOff className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          <section className="min-h-0 bg-[#101826]">
            {isCoding ? (
              <div
                className="grid h-full min-h-0"
                style={{ gridTemplateColumns: `${explorerWidth}px 4px minmax(0, 1fr)` }}
              >
                  <aside className="min-h-0 overflow-hidden bg-[#181818]">
                    <div className="border-b border-white/10 px-2.5 py-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-300">Explorer</p>
                          <p className="truncate text-[10px] text-slate-500">
                            {selectedFolderPath ? selectedFolderPath : `${codeFiles.length} archivos`}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          title="Plantillas de arquitectura"
                          onClick={() => setTemplateDialogOpen(true)}
                          className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-white/10 hover:text-emerald-200"
                        >
                          <Layers3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title={selectedFolderPath ? `Crear archivo en ${selectedFolderPath}` : "Crear archivo"}
                          onClick={() => setCreateDialog("file")}
                          className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-white/10 hover:text-emerald-200"
                        >
                          <FilePlus2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title={selectedFolderPath ? `Crear carpeta dentro de ${selectedFolderPath}` : "Crear carpeta"}
                          onClick={() => setCreateDialog("folder")}
                          className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-white/10 hover:text-sky-200"
                        >
                          <FolderPlus className="h-3.5 w-3.5" />
                        </button>
                        {selectedFolderPath && (
                          <button
                            title="Crear desde la raiz"
                            onClick={() => setSelectedFolderPath("")}
                            className="grid h-6 w-6 place-items-center rounded text-slate-500 hover:bg-white/10 hover:text-white"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                        </div>
                      </div>
                    </div>
                    <div className="h-[calc(100%-45px)] overflow-auto px-2 py-1">
                      <div className="mb-1 flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-200">
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                        <Folder className="h-4 w-4 text-sky-300" />
                        proyecto-entrevista
                      </div>
                      <div className="mt-1 space-y-0.5 border-l border-white/10 pl-1">
                      {explorerItems.map((item) => {
                        const extStyle = item.type === "file" ? extensionStyle(item.path) : null;
                        const isActive = item.type === "file" && item.path === activeFilePath;
                        return (
                          <button
                            key={`${item.type}:${item.path}`}
                            onClick={() => item.type === "file" ? selectFile(item.path) : setSelectedFolderPath(item.path)}
                            onContextMenu={(event) => {
                              if (item.type !== "folder") return;
                              event.preventDefault();
                              event.stopPropagation();
                              setSelectedFolderPath(item.path);
                              setFolderContextMenu({ x: event.clientX, y: event.clientY, path: item.path });
                            }}
                            className={`group relative flex w-full items-center justify-between gap-2 rounded-sm py-0.5 pr-1.5 text-left text-[11px] ${
                              isActive
                                ? "bg-[#37373d] text-white"
                                : item.type === "folder" && selectedFolderPath === item.path
                                  ? "bg-sky-400/10 text-sky-100"
                                : item.type === "folder"
                                  ? "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                                  : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                            }`}
                            style={{ paddingLeft: 8 + item.level * 14 }}
                            title={item.path}
                          >
                            {item.level > 0 && (
                              <span
                                className="pointer-events-none absolute bottom-0 top-0 border-l border-white/10"
                                style={{ left: 6 + (item.level - 1) * 14 }}
                              />
                            )}
                            <span className="flex min-w-0 items-center gap-1.5">
                              {item.type === "folder" ? (
                                <>
                                  <ChevronRight className="h-3 w-3 rotate-90 text-slate-500" />
                                  <Folder className="h-3 w-3 text-sky-400" />
                                </>
                              ) : (
                                <FileCode2 className={`h-3 w-3 shrink-0 ${extStyle?.icon}`} />
                              )}
                              <span className={`truncate ${item.type === "folder" ? "font-semibold" : ""}`}>{item.name}</span>
                              {item.type === "file" && extStyle && (
                                <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${extStyle.badge}`}>{extStyle.label}</span>
                              )}
                            </span>
                            {item.type === "folder" ? (
                              <span className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100">
                                <span
                                  role="button"
                                  tabIndex={0}
                                  title={`Crear archivo en ${item.path}`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedFolderPath(item.path);
                                    setCreateDialog("file");
                                  }}
                                  className="grid h-5 w-5 place-items-center rounded text-slate-500 hover:bg-white/10 hover:text-emerald-200"
                                >
                                  <FilePlus2 className="h-3.5 w-3.5" />
                                </span>
                                <span
                                  role="button"
                                  tabIndex={0}
                                  title={`Crear carpeta dentro de ${item.path}`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedFolderPath(item.path);
                                    setCreateDialog("folder");
                                  }}
                                  className="grid h-5 w-5 place-items-center rounded text-slate-500 hover:bg-white/10 hover:text-sky-200"
                                >
                                  <FolderPlus className="h-3.5 w-3.5" />
                                </span>
                                <span
                                  role="button"
                                  tabIndex={0}
                                  title={`Eliminar carpeta ${item.path}`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    removeFolder(item.path);
                                  }}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      removeFolder(item.path);
                                    }
                                  }}
                                  className="grid h-5 w-5 place-items-center rounded text-slate-600 hover:bg-red-400/15 hover:text-red-200"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </span>
                              </span>
                            ) : codeFiles.length > 1 && (
                              <span
                                role="button"
                                tabIndex={0}
                                title={`Eliminar ${item.path}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  removeFile(item.path);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    removeFile(item.path);
                                  }
                                }}
                                className="grid h-5 w-5 shrink-0 place-items-center rounded text-slate-600 opacity-0 hover:bg-red-400/15 hover:text-red-200 group-hover:opacity-100"
                              >
                                <X className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                      </div>
                    </div>
                  </aside>
                  <div
                    className="cursor-col-resize border-r border-white/10 bg-[#202020] hover:bg-emerald-400/40"
                    onPointerDown={startExplorerResize}
                    onPointerMove={moveExplorerResize}
                    onPointerUp={stopExplorerResize}
                    onPointerCancel={stopExplorerResize}
                  />
                  <div className="flex min-h-0 flex-col">
                    {showCase && (
                      <div className="border-b border-white/10 bg-slate-900/80 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">Caso practico</p>
                        <h2 className="mt-1 text-sm font-bold text-white">{challenge?.title}</h2>
                        <p className="mt-1 text-xs leading-5 text-slate-200">{challenge?.prompt}</p>
                        {challenge?.document && <p className="mt-1 text-xs text-slate-300">{challenge.document}</p>}
                        {challenge?.expected_output && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {challenge.expected_output.map((item) => (
                              <span key={item} className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-200">
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="min-h-0 flex-1">
                    <MonacoEditor
                      height="100%"
                      language={inferEditorLanguage(codeFiles.find((file) => file.path === activeFilePath))}
                      theme="vs-dark"
                      value={code}
                      onChange={(value) => updateActiveFile(value ?? "")}
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
                    {codeOutput && (
                  <div className="grid max-h-56 grid-cols-1 overflow-hidden border-t border-white/10 lg:grid-cols-2">
                    <pre className="overflow-auto bg-black/30 p-3 text-xs text-emerald-100">
                      {codeOutput}
                    </pre>
                    {previewHtml && (
                      <iframe
                        title="Vista previa"
                        srcDoc={`<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;padding:16px;background:#f8fafc">${previewHtml}</body></html>`}
                        className="h-56 w-full bg-white"
                      />
                    )}
                  </div>
                    )}
                  </div>
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

          <section className={`${showHistory ? "flex" : "hidden"} absolute bottom-0 right-0 top-0 z-10 w-full min-h-0 flex-col border-l border-white/10 bg-slate-950 shadow-2xl lg:w-[430px]`}>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <div>
                <p className="text-xs font-semibold uppercase text-emerald-300">Historial de conversacion</p>
                <p className="text-sm text-slate-300">{interviewer?.name ?? "Agente IA"} escucha y responde por voz</p>
              </div>
              <button onClick={() => setShowHistory(false)} className="rounded-lg border border-white/10 p-2 text-white/60 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
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

            {securityEvents.length > 0 && (
              <div className="mx-5 mb-3 rounded-xl border border-red-400/25 bg-red-500/10 p-4">
                <p className="text-xs font-bold uppercase text-red-200">Alertas de monitoreo recientes</p>
                <div className="mt-2 space-y-2">
                  {securityEvents.slice(-3).map((event, index) => (
                    <div key={`${event.at}-${index}`} className="text-xs text-red-50">
                      <span className="font-semibold">{event.type}</span>: {event.detail}
                    </div>
                  ))}
                </div>
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
                <button
                  onClick={downloadReport}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-950"
                >
                  <Download className="h-4 w-4" /> Descargar informe
                </button>
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
                {renderMicIcon()}
                {fullMicLabel}
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
