// features/settings/components/NotificationsSection.tsx
"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useUpdateNotificationPreferences } from "../hooks/useSettings";
import type { SettingsProfile } from "../hooks/useSettings";

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

// El servidor guarda las preferencias como UN texto (campo notificationPreferences del perfil). Se guardan como JSON:
// {"new_job":true,"interview":false,...}. Si el campo está vacío o trae un texto que no es ese formato, se usan los
// valores por defecto (todas activadas) en vez de fallar.
function parseSavedPrefs(raw: string | null | undefined): Record<string, boolean> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, boolean>;
    }
  } catch {
    // texto con otro formato: se ignora
  }
  return null;
}

function buildInitialPrefs(raw: string | null | undefined): NotificationPref[] {
  const saved = parseSavedPrefs(raw);
  return DEFAULT_PREFS.map((pref) => ({
    ...pref,
    enabled: typeof saved?.[pref.id] === "boolean" ? (saved[pref.id] as boolean) : pref.enabled,
  }));
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      role="switch"
      aria-checked={enabled}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${enabled ? "bg-[#0EA5A0]" : "bg-gray-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

interface Props {
  profile: SettingsProfile | null;
}

export function NotificationsSection({ profile }: Props) {
  const [prefs, setPrefs] = useState<NotificationPref[]>(() => buildInitialPrefs(profile?.notificationPreferences));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { updateAsync: updateNotifications, isLoading: isSaving } = useUpdateNotificationPreferences(profile);

  const toggle = (id: string, value: boolean) => {
    setPrefs((prev) => prev.map((p) => p.id === id ? { ...p, enabled: value } : p));
  };

  const handleSave = async () => {
    setError(null);
    try {
      const payload = JSON.stringify(Object.fromEntries(prefs.map((p) => [p.id, p.enabled])));
      await updateNotifications({ notificationPreferences: payload });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "No se pudieron guardar las preferencias. Intenta de nuevo."
      );
    }
  };

  return (
    // RESPONSIVE: p-4 en celular, p-6 desde sm
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-6">
      <h2 className="text-lg font-bold text-[#1B3A6B]">Notificaciones</h2>

      <div className="space-y-5">
        {prefs.map((pref) => (
          <div key={pref.id} className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 break-words">{pref.label}</p>
              <p className="text-xs text-gray-400 mt-0.5 break-words">{pref.description}</p>
            </div>
            <Toggle enabled={pref.enabled} onChange={(v) => toggle(pref.id, v)} />
          </div>
        ))}
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600 break-words">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 pt-4 border-t border-gray-100 sm:flex-row sm:items-center sm:justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex w-full sm:w-auto items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] px-5 py-2.5 rounded-xl hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
          {saved ? "Guardado" : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}