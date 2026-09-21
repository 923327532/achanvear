// features/settings/components/CompanyGeneralSection.tsx
"use client";

import { useState } from "react";
import {
  Globe,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useCompanyChangePassword } from "../hooks/useCompanySettings";

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

export function CompanyGeneralSection() {
  const { changeAsync: changePassword, isLoading: isChangingPassword } = useCompanyChangePassword();

  const [language, setLanguage] = useState("es-PE");
  const [timezone, setTimezone] = useState("UTC-5");
  const [twoFA, setTwoFA] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [saved, setSaved] = useState(false);

  const passwordRequirements = [
    { label: "Al menos 8 caracteres", test: (p: string) => p.length >= 8 },
    { label: "Una mayúscula", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Una minúscula", test: (p: string) => /[a-z]/.test(p) },
    { label: "Un número", test: (p: string) => /\d/.test(p) },
    { label: "Un carácter especial (@$!%*?&)", test: (p: string) => /[@$!%*?&]/.test(p) },
    { label: "Solo letras, números y @$!%*?&", test: (p: string) => /^[A-Za-z\d@$!%*?&]+$/.test(p) },
  ];

  const handleChangePassword = async () => {
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (!/[@$!%*?&]/.test(newPassword)) {
      setPasswordError("La contraseña debe contener al menos un carácter especial (@$!%*?&)");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("La contraseña debe contener al menos una mayúscula");
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setPasswordError("La contraseña debe contener al menos una minúscula");
      return;
    }
    if (!/\d/.test(newPassword)) {
      setPasswordError("La contraseña debe contener al menos un número");
      return;
    }
    if (!/^[A-Za-z\d@$!%*?&]+$/.test(newPassword)) {
      setPasswordError("La contraseña solo puede contener letras, números y @$!%*?& (sin espacios ni otros caracteres)");
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setPasswordError(apiError?.message || "Error al cambiar la contraseña. Verifica tu contraseña actual.");
    }
  };

  const selectClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors";
  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors";

  return (
    <div className="space-y-5">
      {/* Preferencias regionales */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[#1B3A6B]">Configuración General</h2>
          <p className="text-sm text-gray-500 mt-1">
            Preferencias de idioma, zona horaria y seguridad de la cuenta
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

        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Autenticación de Dos Factores (2FA)</p>
              <p className="text-xs text-gray-500">Añade una capa extra de seguridad a tu cuenta</p>
            </div>
          </div>
          <Toggle enabled={twoFA} onChange={setTwoFA} />
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Cambiar Contraseña</h3>
          <p className="text-xs text-gray-500 mt-1">Actualiza tu contraseña de acceso a la plataforma</p>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Contraseña Actual</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nueva Contraseña</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <ul className="mt-2 space-y-1">
                {passwordRequirements.map((req) => {
                  const ok = req.test(newPassword);
                  return (
                    <li key={req.label} className={`text-xs flex items-center gap-1.5 ${ok ? "text-emerald-600" : "text-gray-400"}`}>
                      <span>{ok ? "✓" : "○"}</span>
                      {req.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>

          {passwordError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-600">{passwordError}</p>
            </div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-sm font-semibold hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
          >
            {isChangingPassword ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {isChangingPassword ? "Cambiando..." : "Cambiar Contraseña"}
          </button>
        </div>
      </div>

      {passwordSaved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">Contraseña actualizada correctamente</span>
        </div>
      )}

      {saved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">Configuración guardada</span>
        </div>
      )}
    </div>
  );
}
