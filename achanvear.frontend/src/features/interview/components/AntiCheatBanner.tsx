// features/interview/components/AntiCheatBanner.tsx
"use client";

import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";

interface AntiCheatBannerProps {
  violationCount: number;
  maxViolations: number;
  isRecording: boolean;
}

export function AntiCheatBanner({ violationCount, maxViolations, isRecording }: AntiCheatBannerProps) {
  const remaining = maxViolations - violationCount;
  const isCritical = remaining <= 1;
  const isWarning = remaining <= 2;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 border-b transition-colors ${
        isCritical
          ? "bg-red-50 border-red-200"
          : isWarning
          ? "bg-amber-50 border-amber-200"
          : "bg-slate-50 border-slate-200"
      }`}
    >
      {/* Icono de estado */}
      <div className="shrink-0">
        {isCritical ? (
          <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={1.5} />
        ) : violationCount > 0 ? (
          <ShieldAlert className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
        ) : (
          <ShieldCheck className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
        )}
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${
          isCritical ? "text-red-700" : isWarning ? "text-amber-700" : "text-emerald-700"
        }`}>
          {isCritical
            ? "¡Alerta critica! La entrevista sera abortada al siguiente intento."
            : violationCount > 0
            ? `Se detectaron cambios de pantalla (${violationCount}/${maxViolations})`
            : "Sistema de seguridad activo"}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">
          {isRecording ? "Grabacion activa · " : ""}
          No cambies de ventana ni minimices la pantalla
        </p>
      </div>

      {/* Indicador de violaciones */}
      <div className="flex items-center gap-1.5 shrink-0">
        {Array.from({ length: maxViolations }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i < violationCount
                ? "bg-red-500"
                : "bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}