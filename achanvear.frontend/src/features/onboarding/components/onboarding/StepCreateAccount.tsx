"use client";

import { useState } from "react";
import { RegisterFormData } from "@/features/onboarding/types/onboarding.types";
import Link from "next/link";

interface StepCreateAccountProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

export function StepCreateAccount({
  onSubmit,
  isLoading,
  error,
  onClearError,
}: StepCreateAccountProps) {
  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) errors.fullName = "Nombre completo requerido";
    else if (fullName.trim().length < 3)
      errors.fullName = "Minimo 3 caracteres";

    if (!dni.trim()) errors.dni = "DNI requerido";
    else if (!/^\d{8}$/.test(dni.trim()))
      errors.dni = "DNI debe tener 8 digitos";

    if (!email.trim()) errors.email = "Correo requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Correo invalido";

    if (!password) errors.password = "Contrasena requerida";
    else if (password.length < 8)
      errors.password = "Minimo 8 caracteres";

    if (!passwordConfirmation)
      errors.passwordConfirmation = "Confirmar contrasena";
    else if (password !== passwordConfirmation)
      errors.passwordConfirmation = "Las contrasenas no coinciden";

    if (!acceptedTerms)
      errors.acceptedTerms = "Debes aceptar los terminos";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClearError();
    if (!validate()) return;

    await onSubmit({
      fullName: fullName.trim(),
      dni: dni.trim(),
      email: email.trim(),
      password,
      passwordConfirmation,
      acceptedTerms,
    });
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          Crea tu cuenta
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Comienza tu camino profesional hoy
        </p>
      </div>

      {/* Profile selector */}
      <div className="mb-6 space-y-3">
        <div className="rounded-xl border-2 border-slate-900 bg-slate-900/5 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-slate-900 bg-slate-900" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Soy Profesional
              </p>
              <p className="text-xs text-slate-500">
                Busca empleo, proyectos u ofrece servicios
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 opacity-60">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-slate-300" />
            <div>
              <p className="text-sm font-semibold text-slate-400">
                Soy Empresa
              </p>
              <p className="text-xs text-slate-400">
                Publica empleos y encuentra talento
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nombre completo
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (fieldErrors.fullName) {
                setFieldErrors((prev) => ({ ...prev, fullName: "" }));
              }
            }}
            className={`mt-1 w-full rounded-lg border ${
              fieldErrors.fullName ? "border-rose-400" : "border-slate-300"
            } bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900`}
            placeholder="Carlos Mendoza"
          />
          {fieldErrors.fullName && (
            <p className="mt-1 text-xs text-rose-500">{fieldErrors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            DNI
          </label>
          <input
            type="text"
            value={dni}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 8);
              setDni(val);
              if (fieldErrors.dni) {
                setFieldErrors((prev) => ({ ...prev, dni: "" }));
              }
            }}
            className={`mt-1 w-full rounded-lg border ${
              fieldErrors.dni ? "border-rose-400" : "border-slate-300"
            } bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900`}
            placeholder="12345678"
          />
          {fieldErrors.dni && (
            <p className="mt-1 text-xs text-rose-500">{fieldErrors.dni}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Correo electronico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }
            }}
            className={`mt-1 w-full rounded-lg border ${
              fieldErrors.email ? "border-rose-400" : "border-slate-300"
            } bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900`}
            placeholder="carlos@email.com"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-rose-500">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Contrasena
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: "" }));
              }
            }}
            className={`mt-1 w-full rounded-lg border ${
              fieldErrors.password ? "border-rose-400" : "border-slate-300"
            } bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900`}
            placeholder="Minimo 8 caracteres"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-rose-500">{fieldErrors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Confirmar contrasena
          </label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => {
              setPasswordConfirmation(e.target.value);
              if (fieldErrors.passwordConfirmation) {
                setFieldErrors((prev) => ({
                  ...prev,
                  passwordConfirmation: "",
                }));
              }
            }}
            className={`mt-1 w-full rounded-lg border ${
              fieldErrors.passwordConfirmation
                ? "border-rose-400"
                : "border-slate-300"
            } bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900`}
            placeholder="Repite la contrasena"
          />
          {fieldErrors.passwordConfirmation && (
            <p className="mt-1 text-xs text-rose-500">
              {fieldErrors.passwordConfirmation}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => {
              setAcceptedTerms(e.target.checked);
              if (fieldErrors.acceptedTerms) {
                setFieldErrors((prev) => ({ ...prev, acceptedTerms: "" }));
              }
            }}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <label htmlFor="terms" className="text-xs text-slate-600">
            Acepto los terminos y condiciones
          </label>
        </div>
        {fieldErrors.acceptedTerms && (
          <p className="text-xs text-rose-500">{fieldErrors.acceptedTerms}</p>
        )}

        {error && (
          <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative text-center text-xs uppercase tracking-wider text-slate-400">
          <span className="relative bg-slate-50 px-3">o continua con</span>
        </div>
        <button
          type="button"
          className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Google
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-slate-900 hover:underline"
        >
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}