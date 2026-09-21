"use client";

// src/features/auth/components/ForgotPasswordForm.tsx

import Link from "next/link";
import { Input } from "@/shared/components/ui/Input";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";

export function ForgotPasswordForm() {
  const { register, errors, isSubmitting, formError, sent, onSubmit } =
    useForgotPassword();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">

      {/* Logo */}
      <Link href="/" className="mb-6 flex items-center gap-2.5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: "#1B3A6B" }}
        >
          A
        </div>
        <span className="text-xl font-bold" style={{ color: "#1B3A6B" }}>
          Achanvear
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">

        {sent ? (
          /* Estado: correo enviado */
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Correo enviado</h2>
            <p className="mt-2 text-sm text-slate-500">
              Revisa tu bandeja de entrada y sigue las instrucciones para recuperar tu contraseña.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm font-semibold"
              style={{ color: "#1B3A6B" }}
            >
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          /* Estado: formulario */
          <>
            {/* Flecha + título */}
            <div className="mb-6 flex items-center gap-3">
              <Link
                href="/login"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-slate-900">Recuperar Contraseña</h1>
            </div>

            {/* Ícono sobre */}
            <div className="mb-5 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <svg className="h-7 w-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Descripción */}
            <p className="mb-6 text-center text-sm text-slate-500">
              Ingresa tu correo electrónico y te enviaremos un código de verificación para restablecer tu contraseña.
            </p>

            {/* Error */}
            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {formError}
              </div>
            )}

            {/* Formulario */}
            <form className="space-y-4" onSubmit={onSubmit}>
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="tu@email.com"
                {...register("email")}
                error={errors.email?.message}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                style={{ backgroundColor: "#1B3A6B" }}
              >
                {isSubmitting ? "Enviando..." : "Enviar código de verificación"}
              </button>
            </form>

            {/* Volver */}
            <p className="mt-5 text-center text-sm text-slate-500">
              Volver al{" "}
              <Link href="/login" className="font-semibold" style={{ color: "#1B3A6B" }}>
                inicio de sesión
              </Link>
            </p>
          </>
        )}
      </div>

      {/* Soporte fuera de la card */}
      <p className="mt-6 text-sm text-slate-400">
        ¿Necesitas ayuda?{" "}
        <Link href="#" className="font-medium" style={{ color: "#1B3A6B" }}>
          Contacta a soporte
        </Link>
      </p>
    </div>
  );
}