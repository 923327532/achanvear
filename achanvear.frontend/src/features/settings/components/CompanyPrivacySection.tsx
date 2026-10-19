// features/settings/components/CompanyPrivacySection.tsx
"use client";

import { useState } from "react";
import { Eye, EyeOff, Shield, Monitor, Smartphone, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { usePrivacySettings } from "../hooks/useCompanySettings";
import type { PrivacySettings } from "../types/company-settings.types";

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

export function CompanyPrivacySection() {
  const { settings, isLoading, updateAsync } = usePrivacySettings();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando configuración de privacidad...
        </div>
      </div>
    );
  }

  return <PrivacyForm initial={settings} onSave={updateAsync} />;
}

function PrivacyForm({
  initial,
  onSave,
}: {
  initial: PrivacySettings;
  onSave: (data: PrivacySettings) => Promise<unknown>;
}) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [incognitoMode, setIncognitoMode] = useState(initial.incognitoMode);
  const [showContactInfo, setShowContactInfo] = useState(initial.showContactInfo);
  const [showInDirectory, setShowInDirectory] = useState(initial.showInDirectory);
  const [visibilityNotifications, setVisibilityNotifications] = useState(initial.visibilityNotifications);

  const handleToggle = async (key: keyof PrivacySettings, value: boolean) => {
    setError(null);
    if (key === "incognitoMode") setIncognitoMode(value);
    if (key === "showContactInfo") setShowContactInfo(value);
    if (key === "showInDirectory") setShowInDirectory(value);
    if (key === "visibilityNotifications") setVisibilityNotifications(value);

    try {
      await onSave({
        incognitoMode,
        showContactInfo,
        showInDirectory,
        visibilityNotifications,
        [key]: value,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      if (key === "incognitoMode") setIncognitoMode(!value);
      if (key === "showContactInfo") setShowContactInfo(!value);
      if (key === "showInDirectory") setShowInDirectory(!value);
      if (key === "visibilityNotifications") setVisibilityNotifications(!value);
      // FIX: antes el interruptor volvía a su sitio sin decir nada.
      setError("No se pudo guardar el cambio de privacidad. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-[#1B3A6B]">Privacidad de la Empresa</h2>
        <p className="text-sm text-gray-500 mt-1">
          Controla la visibilidad de tu empresa en la plataforma
        </p>
      </div>

      {/* Modo Incógnito */}
      <div className="flex items-start justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
            {incognitoMode ? (
              <EyeOff className="w-5 h-5 text-[#1B3A6B]" />
            ) : (
              <Eye className="w-5 h-5 text-[#1B3A6B]" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Modo Incógnito</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {incognitoMode
                ? "Tu empresa no aparecerá en búsquedas públicas de freelancers"
                : "Tu empresa es visible para freelancers en la plataforma"}
            </p>
          </div>
        </div>
        <Toggle enabled={incognitoMode} onChange={(v) => handleToggle("incognitoMode", v)} />
      </div>

      {/* Visibilidad de datos */}
      <div className="space-y-4 pt-2">
        <p className="text-sm font-semibold text-gray-700">Visibilidad de Datos</p>

        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Mostrar información de contacto</p>
              <p className="text-xs text-gray-400">Freelancers pueden ver tu email y teléfono</p>
            </div>
          </div>
          <Toggle enabled={showContactInfo} onChange={(v) => handleToggle("showContactInfo", v)} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Mostrar en directorio público</p>
              <p className="text-xs text-gray-400">Aparecer en el listado de empresas</p>
            </div>
          </div>
          <Toggle enabled={showInDirectory} onChange={(v) => handleToggle("showInDirectory", v)} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Notificaciones de visibilidad</p>
              <p className="text-xs text-gray-400">Recibir alertas cuando vean tu perfil</p>
            </div>
          </div>
          <Toggle enabled={visibilityNotifications} onChange={(v) => handleToggle("visibilityNotifications", v)} />
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {saved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">Configuración de privacidad actualizada</span>
        </div>
      )}
    </div>
  );
}