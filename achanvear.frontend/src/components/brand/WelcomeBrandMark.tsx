"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, Square } from "lucide-react";
import { createSpanishUtterance } from "@/lib/browserSpeech";

const WELCOME_MESSAGE = "Bienvenido a Achanvear. Publica una oportunidad o postula al empleo de tus sue\u00f1os.";
const WELCOME_STORAGE_KEY = "achanvear:home-welcome-spoken:v2";
let playedInSession = false;

export function WelcomeBrandMark() {
  const markRef = useRef<HTMLDivElement>(null);
  const playRef = useRef<() => void>(() => {});
  const stopRef = useRef<() => void>(() => {});
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      playRef.current = () => setError("Tu navegador no tiene voz disponible. Puedes leer la bienvenida en pantalla.");
      return;
    }
    const synthesis = window.speechSynthesis;
    let completed = playedInSession;
    try { completed ||= window.localStorage.getItem(WELCOME_STORAGE_KEY) === "true"; } catch { /* Session fallback. */ }
    let disposed = false;
    let queued = false;
    let started = false;
    let generation = 0;
    let watchdog: number | undefined;
    let utterance: SpeechSynthesisUtterance | null = null;

    function stop() {
      generation += 1;
      window.clearTimeout(watchdog);
      if (queued || started) synthesis.cancel();
      queued = false;
      started = false;
      if (!disposed) setSpeaking(false);
    }

    function greet(manual = false) {
      if (disposed || (!manual && (completed || queued || started))) return;
      if (manual) stop();
      if (synthesis.speaking || synthesis.pending) return;
      const attempt = ++generation;
      queued = true;
      setError("");
      utterance = createSpanishUtterance(WELCOME_MESSAGE);
      utterance.volume = 1;
      utterance.onstart = () => {
        if (disposed || attempt !== generation) return;
        window.clearTimeout(watchdog);
        queued = false;
        started = true;
        setSpeaking(true);
      };
      utterance.onend = () => {
        if (disposed || attempt !== generation) return;
        window.clearTimeout(watchdog);
        queued = false;
        started = false;
        completed = true;
        playedInSession = true;
        setSpeaking(false);
        try { window.localStorage.setItem(WELCOME_STORAGE_KEY, "true"); } catch { /* Session fallback. */ }
      };
      utterance.onerror = event => {
        if (disposed || attempt !== generation) return;
        window.clearTimeout(watchdog);
        queued = false;
        started = false;
        setSpeaking(false);
        if (manual && event.error !== "canceled" && event.error !== "interrupted") {
          setError("No se pudo iniciar la voz. Revisa el sonido del dispositivo y pulsa Escuchar bienvenida.");
        }
      };
      // Some browsers silently leave autoplay pending instead of emitting an error.
      watchdog = window.setTimeout(() => {
        if (disposed || attempt !== generation || started) return;
        stop();
      }, 2000);
      try {
        synthesis.resume();
        synthesis.speak(utterance);
      } catch {
        stop();
        if (manual) setError("No se pudo reproducir la bienvenida. Intenta nuevamente.");
      }
    }

    function activate(event: Event) {
      if (event.target instanceof Node && markRef.current?.contains(event.target)) return;
      if (queued && !started) stop();
      greet();
    }
    function voicesReady() { greet(); }
    playRef.current = () => greet(true);
    stopRef.current = stop;
    // Welcome on first entry to the home, independently of the logo's scroll position.
    const timer = window.setTimeout(() => greet(), 300);
    window.addEventListener("pointerdown", activate);
    window.addEventListener("keydown", activate);
    synthesis.addEventListener("voiceschanged", voicesReady);
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", activate);
      window.removeEventListener("keydown", activate);
      synthesis.removeEventListener("voiceschanged", voicesReady);
      stop();
      playRef.current = () => {};
      stopRef.current = () => {};
    };
  }, []);

  return (
    <div ref={markRef} className="relative flex flex-col items-center">
      <span aria-hidden="true" className={`relative text-[9rem] font-bold leading-none tracking-tighter text-white ${speaking ? "motion-safe:animate-pulse" : ""}`}>
        a<span className="text-teal-300">.</span>
      </span>
      <button type="button" onClick={() => speaking ? stopRef.current() : playRef.current()} className="mt-4 inline-flex items-center gap-2 rounded-full border border-teal-200/30 bg-[#102c46] px-4 py-2 text-xs font-medium text-teal-100 transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300">
        {speaking ? <Square aria-hidden="true" className="h-4 w-4" /> : <Volume2 aria-hidden="true" className="h-4 w-4" />}
        {speaking ? "Detener bienvenida" : "Escuchar bienvenida"}
      </button>
      {(speaking || error) && <p role="status" className="absolute left-1/2 top-0 z-10 w-64 -translate-x-1/2 rounded-2xl border border-teal-200/30 bg-[#102c46]/95 px-4 py-3 text-center text-sm font-medium text-teal-100 shadow-lg">
        {error || WELCOME_MESSAGE}
      </p>}
    </div>
  );
}
