// features/interview/hooks/useScreenRecording.ts
// Graba la pantalla del candidato durante toda la sesion
"use client";

import { useRef, useState, useCallback } from "react";
import { interviewApi } from "../api/interviewApi";

interface UseScreenRecordingOptions {
  interviewId: string;
  onError?: (error: string) => void;
}

export function useScreenRecording({ interviewId, onError }: UseScreenRecordingOptions) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Solicitar permiso para grabar pantalla
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 15,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        } as MediaTrackConstraints,
      });

      streamRef.current = stream;

      // Determinar el mejor MIME type soportado
      const mimeTypes = [
        "video/webm; codecs=vp9,opus",
        "video/webm; codecs=vp8,opus",
        "video/webm; codecs=h264,opus",
        "video/webm",
        "video/mp4",
      ];

      let mimeType = "";
      for (const mt of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mt)) {
          mimeType = mt;
          break;
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        // Detener el timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Detener tracks del stream
        stream.getTracks().forEach((track) => track.stop());

        // Subir grabacion a backend (luego Java la sube a S3)
        if (chunksRef.current.length > 0) {
          try {
            const blob = new Blob(chunksRef.current, { type: mimeType || "video/webm" });
            const file = new File([blob], `interview-${interviewId}-${Date.now()}.webm`, {
              type: mimeType || "video/webm",
            });

            // Leer como base64 y enviar al backend
            const reader = new FileReader();
            reader.onload = async () => {
              const base64 = (reader.result as string).split(",")[1];
              try {
                // Guardar en S3 via backend
                await interviewApi.saveRecording(interviewId, { fileKey: base64 });
              } catch {
                // Silenciar error
              }
            };
            reader.readAsDataURL(file);
          } catch {
            // Silenciar error
          }
        }
      };

      recorder.onerror = () => {
        setRecordingError("Error en la grabacion de pantalla");
        onError?.("Error en la grabacion de pantalla");
      };

      mediaRecorderRef.current = recorder;
      recorder.start(5000); // Chunks cada 5 segundos
      setIsRecording(true);
      setRecordingError(null);

      // Iniciar timer de duracion
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      const msg = err?.message || "No se pudo iniciar la grabacion de pantalla";
      setRecordingError(msg);
      onError?.(msg);
    }
  }, [interviewId, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    startRecording,
    stopRecording,
    isRecording,
    recordingError,
    recordingDuration: formatDuration(recordingDuration),
    rawSeconds: recordingDuration,
  };
}