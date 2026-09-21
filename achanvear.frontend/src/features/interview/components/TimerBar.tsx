// features/interview/components/TimerBar.tsx
"use client";

import { useEffect, useState, useRef } from "react";

interface TimerBarProps {
  /** Duración en segundos para la pregunta actual */
  durationSeconds: number;
  /** Cuando el tiempo se agota */
  onTimeUp: () => void;
  /** Si el timer está activo */
  isActive: boolean;
}

export function TimerBar({ durationSeconds, onTimeUp, isActive }: TimerBarProps) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const calledRef = useRef(false);

  useEffect(() => {
    setRemaining(durationSeconds);
    calledRef.current = false;
  }, [durationSeconds]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!calledRef.current) {
            calledRef.current = true;
            onTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp]);

  const progress = durationSeconds > 0 ? (remaining / durationSeconds) * 100 : 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getColor = () => {
    if (progress > 50) return "bg-emerald-500";
    if (progress > 25) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-500">Tiempo restante</span>
        <span className={`text-xs font-bold tabular-nums ${
          progress <= 25 ? "text-red-600" : "text-slate-600"
        }`}>
          {formatTime(remaining)}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${getColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}