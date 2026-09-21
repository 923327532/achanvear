"use client";

import { useState } from "react";
import { Loader2, Check, Eye, EyeOff, Building2 } from "lucide-react";
import { useUpdateWorkPreferences } from "../hooks/useSettings";
import { AVAILABILITY_CONFIG, type AvailabilityStatus } from "../types/settings.types";

const STATUSES = Object.keys(AVAILABILITY_CONFIG) as AvailabilityStatus[];

type CVVisibility = "VERIFIED_COMPANIES" | "ALL_COMPANIES" | "PRIVATE";

const CV_VISIBILITY_CONFIG: Record<CVVisibility, { label: string; description: string; icon: any }> = {
  VERIFIED_COMPANIES: {
    label: "Solo empresas verificadas",
    description: "Solo empresas con cuenta verificada en Achanvear",
    icon: Building2,
  },
  ALL_COMPANIES: {
    label: "Todas las empresas",
    description: "Cualquier empresa registrada puede ver tu CV",
    icon: Eye,
  },
  PRIVATE: {
    label: "Privado",
    description: "Nadie puede ver tu CV sin tu autorización",
    icon: EyeOff,
  },
};

const CV_STATUSES = Object.keys(CV_VISIBILITY_CONFIG) as CVVisibility[];

interface Props {
  profile: any; // idealmente tipar con SettingsProfile exportado de settingsApi
}

export function WorkPreferencesSection({ profile }: Props) {
  const [selected, setSelected] = useState<AvailabilityStatus>(
    (profile?.availabilityStatus as AvailabilityStatus) ?? "LOOKING_FOR_JOB"
  );
  const [cvVisibility, setCvVisibility] = useState<CVVisibility>(
    (profile?.cvVisibility as CVVisibility) ?? "VERIFIED_COMPANIES"
  );
  const [saved, setSaved] = useState(false);

  const { updateAsync: updateWorkPreferences, isLoading: isSaving } = useUpdateWorkPreferences(profile);

  const handleSave = async () => {
    await updateWorkPreferences({ availabilityStatus: selected, cvVisibility });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-[#1B3A6B] mb-6">Preferencias de Trabajo</h2>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Estado de Disponibilidad
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STATUSES.map((status) => {
            const { label, description } = AVAILABILITY_CONFIG[status];
            const isActive = selected === status;
            return (
              <button
                key={status}
                onClick={() => setSelected(status)}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  isActive ? "border-[#0EA5A0] bg-teal-50" : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${isActive ? "bg-[#0EA5A0]" : "bg-gray-300"}`} />
                <div>
                  <p className={`text-sm font-semibold ${isActive ? "text-[#1B3A6B]" : "text-gray-700"}`}>{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Visibilidad del CV</label>
        <p className="text-xs text-gray-400 mb-3">¿Quién puede ver tu currículum?</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CV_STATUSES.map((status) => {
            const { label, description, icon: Icon } = CV_VISIBILITY_CONFIG[status];
            const isActive = cvVisibility === status;
            return (
              <button
                key={status}
                onClick={() => setCvVisibility(status)}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  isActive ? "border-[#0EA5A0] bg-teal-50" : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? "text-[#0EA5A0]" : "text-gray-400"}`} strokeWidth={1.75} />
                <div>
                  <p className={`text-sm font-semibold ${isActive ? "text-[#1B3A6B]" : "text-gray-700"}`}>{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] px-5 py-2.5 rounded-xl hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
          {saved ? "Guardado" : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}