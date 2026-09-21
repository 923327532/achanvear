// features/interview/hooks/useAntiCheat.ts
// Detecta cuando el candidato cambia de pestana o minimiza la ventana
"use client";

import { useEffect, useRef, useCallback } from "react";
import { interviewApi } from "../api/interviewApi";

interface UseAntiCheatOptions {
  interviewId: string;
  onViolation: (count: number) => void;
  maxViolations?: number;
}

export function useAntiCheat({ interviewId, onViolation, maxViolations = 3 }: UseAntiCheatOptions) {
  const violationCount = useRef(0);
  const isAborted = useRef(false);

  const reportViolation = useCallback(async (count: number) => {
    try {
      await interviewApi.reportViolation(interviewId, {
        type: "TAB_SWITCH",
        count,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Silenciar error de red, no bloquear la UI
    }
  }, [interviewId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !isAborted.current) {
        violationCount.current += 1;
        const currentCount = violationCount.current;

        reportViolation(currentCount);
        onViolation(currentCount);

        if (currentCount >= maxViolations) {
          isAborted.current = true;
          interviewApi.abort(interviewId, "MAX_VIOLATIONS_REACHED").catch(() => {});
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [interviewId, onViolation, maxViolations, reportViolation]);

  return { violationCount: violationCount.current };
}
