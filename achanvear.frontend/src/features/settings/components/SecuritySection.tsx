"use client";

import { useState, useEffect, useCallback } from "react";
import { Video, Mic, Check, Lock, Loader2, Eye, EyeOff, Shield, Smartphone } from "lucide-react";
import { useChangePassword } from "../hooks/useSettings";
import { settingsApi } from "../api/settingsApi";
import { getAuthToken } from "@/lib/storage";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-[#0EA5A0]" : "bg-gray-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function PasswordInput({ label, value, onChange, show, onToggleShow, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggleShow: () => void; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 pr-10 outline-none focus:border-[#0EA5A0] focus:ring-1 focus:ring-[#0EA5A0]/20 transition [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
        />
        <button type="button" onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "Minimo 8 caracteres",        ok: password.length >= 8 },
    { label: "Al menos una mayuscula",      ok: /[A-Z]/.test(password) },
    { label: "Al menos una minuscula",      ok: /[a-z]/.test(password) },
    { label: "Al menos un numero",          ok: /[0-9]/.test(password) },
    { label: "Al menos un simbolo (!@#$)", ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const passed = checks.filter((c) => c.ok).length;
  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500", "bg-emerald-600"];
  const labels = ["Muy debil", "Debil", "Regular", "Buena", "Segura"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {checks.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < passed ? colors[passed - 1] : "bg-gray-200"}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${passed < 2 ? "text-red-500" : passed < 4 ? "text-amber-500" : "text-emerald-600"}`}>
        {labels[passed - 1] ?? "Muy debil"}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {checks.map(({ label, ok }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ok ? "bg-emerald-500" : "bg-gray-300"}`} />
            <span className={`text-xs ${ok ? "text-emerald-600" : "text-gray-400"}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QRCodeDisplay({ otpAuthUrl }: { otpAuthUrl: string }) {
  // Generate QR code URL using a public API (or you can use a library)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <img src={qrUrl} alt="2FA QR Code" className="w-48 h-48 rounded-xl border border-gray-200" />
      <p className="text-xs text-gray-500 text-center">
        Escanea este codigo con Google Authenticator o cualquier app TOTP
      </p>
    </div>
  );
}

export function SecuritySection() {
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled]       = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [isLoading, setIsLoading]             = useState(false);
  const [success, setSuccess]                 = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const { changeAsync }                       = useChangePassword();

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(true);
  const [twoFASetup, setTwoFASetup] = useState<{ secret: string; otpAuthUrl: string; issuer: string; label: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  // Load 2FA status on mount - con retry para Next.js SSR hydration
  const load2FAStatus = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        // SSR o sin token - reintentar en 300ms
        setTimeout(load2FAStatus, 300);
        return;
      }
      const status = await settingsApi.get2FAStatus();
      setTwoFAEnabled(status.enabled);
      if (status.enabled) setVerifySuccess(true);
    } catch {
      setTwoFAEnabled(false);
    } finally {
      setTwoFALoading(false);
    }
  }, []);

  useEffect(() => {
    load2FAStatus();
  }, [load2FAStatus]);

  const handleChangePassword = async () => {
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Completa todos los campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("La nueva contrasena y la confirmacion no coinciden.");
      return;
    }
    if (newPassword.length < 8) {
      setError("La nueva contrasena debe tener al menos 8 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      await changeAsync({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message ?? "Error al cambiar la contrasena.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    setError(null);
    setTwoFALoading(true);
    setTwoFAEnabled(enabled);
    try {
      if (enabled) {
        const setup = await settingsApi.enable2FA();
        setTwoFASetup(setup);
        setVerifySuccess(false);
      } else {
        await settingsApi.disable2FA();
        setTwoFASetup(null);
        setVerifyCode("");
        setVerifySuccess(false);
        setError(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || (enabled ? "Error al activar 2FA" : "Error al desactivar 2FA"));
      setTwoFAEnabled(!enabled);
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setError("Ingresa un codigo de 6 digitos de tu app de autenticacion.");
      return;
    }
    setVerifyLoading(true);
    try {
      const result = await settingsApi.verify2FA(verifyCode);
      if (result.verified) {
        setVerifySuccess(true);
        setError(null);
      } else {
        setError("Codigo invalido. Asegurate de haber escaneado el QR correctamente.");
      }
    } catch (err) {
      setError("Error al verificar el codigo.");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-bold text-[#1B3A6B]">Seguridad y Autenticacion</h2>

      {/* ─── 2FA Section ─────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-gray-400" />
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Autenticacion de Dos Factores (2FA)</h3>
              <p className="text-xs text-gray-400">
                {twoFAEnabled
                  ? "2FA activada. Al iniciar sesion te pedira un codigo de Google Authenticator."
                  : "Anade una capa extra de seguridad con Google Authenticator"}
              </p>
            </div>
          </div>
          {twoFALoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          ) : (
            <Toggle enabled={twoFAEnabled} onChange={handleToggle2FA} />
          )}
        </div>

        {/* Mensaje cuando esta activado y verificado */}
        {twoFAEnabled && verifySuccess && !twoFASetup && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-700">2FA activada correctamente</p>
              <p className="text-xs text-emerald-600">Recuerda desactivarla desde aqui si ya no la necesitas</p>
            </div>
          </div>
        )}

        {/* QR Setup - solo cuando se activa por primera vez */}
        {twoFAEnabled && twoFASetup && !verifySuccess && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm font-medium text-gray-700">Paso 1: Escanea el codigo QR con Google Authenticator</p>
            <QRCodeDisplay otpAuthUrl={twoFASetup.otpAuthUrl} />

            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">O ingresa manualmente este codigo:</p>
              <code className="text-sm font-mono bg-gray-200 px-3 py-1.5 rounded-lg break-all">
                {twoFASetup.secret}
              </code>
            </div>

            <hr className="border-gray-200" />
            <p className="text-sm font-medium text-gray-700">Paso 2: Verifica el codigo de 6 digitos</p>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Ingresa el codigo que aparece en tu app de autenticacion
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-center text-gray-700 outline-none focus:border-[#0EA5A0] focus:ring-1 focus:ring-[#0EA5A0]/20 transition font-mono text-lg tracking-widest"
                  autoFocus
                />
                <button
                  onClick={handleVerify2FA}
                  disabled={verifyLoading || verifyCode.length !== 6}
                  className="flex items-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] px-5 py-2.5 rounded-xl hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
                >
                  {verifyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Verificar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600">
            {error}
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* ─── Cambiar contrasena ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Cambiar Contrasena</h3>
        </div>
        <div className="space-y-3">
          <PasswordInput
            label="Contrasena Actual"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            onToggleShow={() => setShowCurrent(!showCurrent)}
          />
          <PasswordInput
            label="Nueva Contrasena"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggleShow={() => setShowNew(!showNew)}
            hint="Usa mayusculas, numeros y simbolos para mayor seguridad"
          />
          <PasswordStrength password={newPassword} />
          <PasswordInput
            label="Confirmar Nueva Contrasena"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            onToggleShow={() => setShowConfirm(!showConfirm)}
          />
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-xs text-emerald-700">
            <Check className="w-3.5 h-3.5" />
            Contrasena actualizada correctamente.
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={handleChangePassword}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] px-5 py-2.5 rounded-xl hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Actualizando...</> : "Actualizar Contrasena"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          Cancelar
        </button>
        <button className="text-sm font-semibold text-white bg-[#1B3A6B] px-5 py-2.5 rounded-xl hover:bg-[#0EA5A0] transition-colors">
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}