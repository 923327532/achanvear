// features/settings/components/GeneralSection.tsx
"use client";

import { useState } from "react";
import { Globe, Clock, Loader2, Check } from "lucide-react";
import { useUpdateGeneralSettings } from "../hooks/useSettings";

const LANGUAGES = [
  { value: "es-PE", label: "Español (Perú) - Aplica leyes laborales peruanas" },
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

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${enabled ? "bg-[#0EA5A0]" : "bg-gray-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

interface Props {
  profile: any; // idealmente tipar con SettingsProfile exportado de settingsApi
}

export function GeneralSection({ profile }: Props) {
  const [language, setLanguage] = useState(profile?.language ?? "es-PE");
  const [timezone, setTimezone] = useState(profile?.timezone ?? "UTC-5");
  const [twoFA, setTwoFA]       = useState(false);
  const [generalSaved, setGeneralSaved] = useState(false);

  const { updateAsync: updateGeneral, isLoading: savingGeneral } = useUpdateGeneralSettings(profile);

  const selectClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors";

  const handleSaveGeneral = async () => {
    await updateGeneral({ language, timezone });
    setGeneralSaved(true);
    setTimeout(() => setGeneralSaved(false), 2000);
  };

  return (
    <div className="space-y-5">

      {/* Configuración General */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-bold text-[#1B3A6B]">Configuración General</h2>

        {/* Idioma */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Globe className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-semibold text-gray-700">Idioma y Región</label>
          </div>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectClass}>
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          {language === "es-PE" && (
            <p className="text-xs text-gray-400 mt-1">El sistema aplicará normativas laborales peruanas (Sunat, beneficios de ley)</p>
          )}
        </div>

        {/* Zona horaria */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-semibold text-gray-700">Zona Horaria</label>
          </div>
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={selectClass}>
            {TIMEZONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <p className="text-xs text-gray-400 mt-1">Sincronización con el Scheduler para que las llamadas de Vapi no ocurran de madrugada</p>
        </div>
      </div>

      {/* Privacidad de Datos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">Privacidad de Datos</h2>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Derechos ARCO</h3>
          <p className="text-xs text-[#0EA5A0] mb-3">Según la ley peruana de protección de datos, tienes derecho a:</p>
          <div className="space-y-2">
            {ARCO_RIGHTS.map((right) => (
              <button
                key={right}
                className="flex items-center gap-3 w-full text-left py-2 text-sm text-gray-600 hover:text-[#1B3A6B] transition-colors group"
              >
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 group-hover:border-[#0EA5A0] flex-shrink-0 transition-colors" />
                {right}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <button className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          Cancelar
        </button>
        <button
          onClick={handleSaveGeneral}
          disabled={savingGeneral}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] px-5 py-2.5 rounded-xl hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
        >
          {savingGeneral ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {generalSaved ? "Guardado" : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}