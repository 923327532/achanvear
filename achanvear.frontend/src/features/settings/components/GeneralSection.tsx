// features/settings/components/GeneralSection.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Clock, Loader2, Check } from "lucide-react";
import { useUpdateGeneralSettings } from "../hooks/useSettings";

const LANGUAGES = [
  { value: "es-PE", label: "Español (Perú)" },
  { value: "en-US", label: "English (US)" },
];

const TIMEZONES = [
  { value: "UTC-5", label: "(UTC-5) Lima, Perú" },
  { value: "UTC-4", label: "(UTC-4) New York" },
  { value: "UTC-7", label: "(UTC-7) Los Angeles" },
];

const ARCO_RIGHTS = [
  "Acceder a mis datos personales",
  "Rectificar información incorrecta",
  "Cancelar mi cuenta",
  "Oponerme al tratamiento de datos",
];

interface Props {
  profile: any; // idealmente tipar con SettingsProfile exportado de settingsApi
}

export function GeneralSection({ profile }: Props) {
  const [language, setLanguage] = useState(profile?.language ?? "es-PE");
  const [timezone, setTimezone] = useState(profile?.timezone ?? "UTC-5");
  const [generalSaved, setGeneralSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { updateAsync: updateGeneral, isLoading: savingGeneral } = useUpdateGeneralSettings(profile);

  // RESPONSIVE: min-w-0 para que el selector no empuje el ancho cuando una opción es larga
  const selectClass = "w-full min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors";

  const handleSaveGeneral = async () => {
    setSaveError(null);
    try {
      await updateGeneral({ language, timezone });
      setGeneralSaved(true);
      setTimeout(() => setGeneralSaved(false), 2000);
    } catch (error) { setSaveError(error instanceof Error ? error.message : "No se pudo guardar la configuración"); }
  };

  return (
    <div className="space-y-5">
      {saveError && <p role="alert" className="text-sm text-red-600">{saveError}</p>}

      {/* Configuración General */}
      {/* RESPONSIVE: p-4 en celular, p-6 desde sm */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-5">
        <h2 className="text-lg font-bold text-[#1B3A6B]">Configuración General</h2>

        {/* Idioma */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Globe className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <label className="text-sm font-semibold text-gray-700">Formato regional de fechas</label>
          </div>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectClass}>
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          {language === "es-PE" && (
            <p className="text-xs text-gray-400 mt-1">Las fechas de tus entrevistas usan el formato regional seleccionado. La interfaz está disponible en español.</p>
          )}
        </div>

        {/* Zona horaria */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <label className="text-sm font-semibold text-gray-700">Zona Horaria</label>
          </div>
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={selectClass}>
            {TIMEZONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <p className="text-xs text-gray-400 mt-1">Los horarios de tus entrevistas se muestran en la zona horaria seleccionada.</p>
        </div>
      </div>

      {/* Privacidad de Datos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">Privacidad de Datos</h2>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Derechos ARCO</h3>
          <p className="text-xs text-[#0EA5A0] mb-3">Según la ley peruana de protección de datos, tienes derecho a:</p>
          <div className="space-y-2">
            {ARCO_RIGHTS.map((right) => (
              <div
                key={right}
                className="flex items-center gap-3 w-full text-left py-2 text-sm text-gray-600"
              >
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 group-hover:border-[#0EA5A0] flex-shrink-0 transition-colors" />
                <span className="min-w-0 break-words">{right}</span>
              </div>
            ))}
          </div>
          <Link href="/privacy" className="mt-3 inline-block text-sm text-[#1B3A6B] underline">Consulta cómo ejercer tus derechos en la política de privacidad</Link>
        </div>
      </div>

      {/* Footer */}
      {/* RESPONSIVE: botones apilados a ancho completo en celular (Guardar arriba), en fila a la derecha desde sm */}
      <div className="flex flex-col-reverse gap-3 pb-4 sm:flex-row sm:items-center sm:justify-end">
        <button
          onClick={handleSaveGeneral}
          disabled={savingGeneral}
          className="flex w-full sm:w-auto items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] px-5 py-2.5 rounded-xl hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
        >
          {savingGeneral ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {generalSaved ? "Guardado" : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}
