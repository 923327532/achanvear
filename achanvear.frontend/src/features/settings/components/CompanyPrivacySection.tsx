// features/settings/components/CompanyPrivacySection.tsx
"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Shield, Monitor, Smartphone, CheckCircle2, Loader2 } from "lucide-react";
import { usePrivacySettings } from "../hooks/useCompanySettings";

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
  const { settings, isLoading, updateAsync, isUpdating } = usePrivacySettings();
  const [saved, setSaved] = useState(false);

  // Estado local sincronizado con el servidor
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(true);
  const [showInDirectory, setShowInDirectory] = useState(true);
  const [visibilityNotifications, setVisibilityNotifications] = useState(false);

  // Sincronizar cuando se cargan los datos del servidor
  useEffect(() => {
    if (settings) {
      setIncognitoMode(settings.incognitoMode);
      setShowContactInfo(settings.showContactInfo);
      setShowInDirectory(settings.showInDirectory);
      setVisibilityNotifications(settings.visibilityNotifications);
    }
  }, [settings]);

  const handleToggle = async (key: keyof typeof settings, value: boolean) => {
    // Actualizar estado local inmediatamente
    if (key === "incognitoMode") setIncognitoMode(value);
    if (key === "showContactInfo") setShowContactInfo(value);
    if (key === "showInDirectory") setShowInDirectory(value);
    if (key === "visibilityNotifications") setVisibilityNotifications(value);

    // Persistir en el backend/localStorage
    try {
      await updateAsync({
        ...settings,
        [key]: value,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Revertir en caso de error
      if (key === "incognitoMode") setIncognitoMode(!value);
      if (key === "showContactInfo") setShowContactInfo(!value);
      if (key === "showInDirectory") setShowInDirectory(!value);
      if (key === "visibilityNotifications") setVisibilityNotifications(!value);
    }
  };

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

      {saved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">Configuración de privacidad actualizada</span>
        </div>
      )}
    </div>
  );
}
