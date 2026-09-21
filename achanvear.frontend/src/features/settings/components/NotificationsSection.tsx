// features/settings/components/NotificationsSection.tsx
"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

interface NotificationPref {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const DEFAULT_PREFS: NotificationPref[] = [
  { id: "new_job",    label: 'Nueva vacante en mi industria',           description: "Recibir alertas cuando se publiquen vacantes en mi industria", enabled: true },
  { id: "interview",  label: "Recordatorios de entrevistas programadas", description: "Notificación 15 minutos antes de cada entrevista",              enabled: true },
  { id: "payment",    label: 'Avisos de "Pago recibido en Escrow"',      description: "Notificación cuando se liberan fondos de proyectos completados",  enabled: true },
  { id: "match",      label: "Proyectos similares a mi perfil",         description: "Notificarme cuando haya empleos o proyectos que coincidan con mis habilidades y experiencia", enabled: true },
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

export function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotificationPref[]>(DEFAULT_PREFS);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (id: string, value: boolean) => {
    setPrefs((prev) => prev.map((p) => p.id === id ? { ...p, enabled: value } : p));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: conectar con endpoint de preferencias de notificaciones
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-bold text-[#1B3A6B]">Notificaciones</h2>

      <div className="space-y-5">
        {prefs.map((pref) => (
          <div key={pref.id} className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">{pref.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{pref.description}</p>
            </div>
            <Toggle enabled={pref.enabled} onChange={(v) => toggle(pref.id, v)} />
          </div>
        ))}
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