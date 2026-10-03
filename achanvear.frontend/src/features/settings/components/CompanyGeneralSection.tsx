// features/settings/components/CompanyGeneralSection.tsx
"use client";

import { useState } from "react";
import { Globe, Clock, CheckCircle2 } from "lucide-react";

// FIX: esta sección tenía un toggle de 2FA falso (solo cambiaba estado local,
// nunca llamaba a settingsApi) y un formulario completo de cambio de
// contraseña duplicado con el de SecuritySection.tsx (que sí es real). Ambas
// cosas se quitaron de aquí — viven únicamente en la pestaña "Seguridad".
export function CompanyGeneralSection() {
  const [language, setLanguage] = useState("es-PE");
  const [timezone, setTimezone] = useState("UTC-5");
  const [saved, setSaved] = useState(false);

  const selectClass =
    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors";

  const handleSave = () => {
    // TODO: conectar a un endpoint real de preferencias cuando exista
    // (ver pendientes de backend: "Preferencias generales" sin persistencia).
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[#1B3A6B]">Configuración General</h2>
          <p className="text-sm text-gray-500 mt-1">
            Preferencias de idioma y zona horaria
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <Globe className="w-4 h-4 inline mr-1.5 text-gray-400" />
              Idioma
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={selectClass}
            >
              <option value="es-PE">Español (Perú)</option>
              <option value="es-ES">Español (España)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1.5 text-gray-400" />
              Zona Horaria
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className={selectClass}
            >
              <option value="UTC-5">UTC-5 (Perú, Colombia, Ecuador)</option>
              <option value="UTC-4">UTC-4 (Chile, Bolivia)</option>
              <option value="UTC-3">UTC-3 (Argentina, Uruguay)</option>
              <option value="UTC-6">UTC-6 (México)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-sm font-semibold hover:bg-[#0EA5A0] transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </div>

      {saved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">Configuración guardada</span>
        </div>
      )}
    </div>
  );
}