"use client";

// src/features/auth/components/ResetPasswordForm.tsx
import Link from "next/link";
import { Input } from "@/shared/components/ui/Input";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";

export function ResetPasswordForm() {
  const { register, errors, isSubmitting, formError, onSubmit } = useResetPassword();

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

        {/* Ícono */}
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <svg className="h-7 w-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">Restablecer contraseña</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ingresa una nueva contraseña segura con mayúsculas, minúsculas, números y un carácter especial.
          </p>
        </div>

        {formError && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {formError}
          </div>
        )}

        <form className="space-y-4" onSubmit={onSubmit}>
          <input type="hidden" {...register("token")} />
          <Input
            label="Nueva contraseña"
            type="password"
            placeholder="••••••••"
            {...register("newPassword")}
            error={errors.newPassword?.message}
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "#1B3A6B" }}
          >
            {isSubmitting ? "Restableciendo..." : "Restablecer contraseña"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          <Link href="/login" className="font-semibold" style={{ color: "#1B3A6B" }}>
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}