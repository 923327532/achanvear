// features/profile/components/SecuritySection.tsx
// Solo Privacidad del Perfil — según Figma actualizado (sin Idioma/Zona Horaria ni Anti-cheat)
"use client";

import { useState } from "react";
import { Eye, Briefcase, Check, Loader2 } from "lucide-react";

type CVVisibility     = "VERIFIED_COMPANIES" | "ALL_COMPANIES" | "PRIVATE";
type AvailabilityStatus = "LOOKING_FOR_JOB" | "FREELANCE_ONLY" | "OPEN_TO_OFFERS" | "NOT_AVAILABLE";

const CV_VISIBILITY_LABELS: Record<CVVisibility, string> = {
  VERIFIED_COMPANIES: "Solo empresas verificadas",
  ALL_COMPANIES:      "Todas las empresas",
  PRIVATE:            "Privado",
};

const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  LOOKING_FOR_JOB: "Buscando empleo",
  FREELANCE_ONLY:  "Solo proyectos freelance",
  OPEN_TO_OFFERS:  "Abierto a ofertas",
  NOT_AVAILABLE:   "No disponible",
};

export function SecuritySection() {
  const [cvVisibility, setCvVisibility] = useState<CVVisibility>("VERIFIED_COMPANIES");
  const [availability, setAvailability] = useState<AvailabilityStatus>("LOOKING_FOR_JOB");
  const [isSaving, setIsSaving]         = useState(false);
  const [saved, setSaved]               = useState(false);

  const handleCancel = () => {
    setCvVisibility("VERIFIED_COMPANIES");
    setAvailability("LOOKING_FOR_JOB");
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: conectar con endpoint cuando esté disponible en el backend
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const selectClass =
    "border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
      <h2 className="text-base font-bold text-[#1B3A6B] mb-6">
        Configuración de Privacidad y Preferencias
      </h2>

      {/* Privacidad del Perfil */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Privacidad del Perfil</h3>
        <div className="space-y-4">

          {/* Visibilidad del CV */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Visibilidad del CV</p>
                <p className="text-xs text-gray-400">¿Quién puede ver tu currículum?</p>
              </div>
            </div>
            <select
              value={cvVisibility}
              onChange={(e) => setCvVisibility(e.target.value as CVVisibility)}
              className={selectClass}
            >
              {(Object.keys(CV_VISIBILITY_LABELS) as CVVisibility[]).map((v) => (
                <option key={v} value={v}>{CV_VISIBILITY_LABELS[v]}</option>
              ))}
            </select>
          </div>

          {/* Estado de Disponibilidad */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Estado de Disponibilidad</p>
                <p className="text-xs text-gray-400">Tu situación laboral actual</p>
              </div>
            </div>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
              className={selectClass}
            >
              {(Object.keys(AVAILABILITY_LABELS) as AvailabilityStatus[]).map((v) => (
                <option key={v} value={v}>{AVAILABILITY_LABELS[v]}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
        <button
          onClick={handleCancel}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] px-5 py-2.5 rounded-xl hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saved    && <Check   className="w-4 h-4" />}
          {saved ? "Guardado" : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}