"use client";

// src/features/auth/components/RegisterForm.tsx
import Link from "next/link";
import { Input } from "@/shared/components/ui/Input";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { useGoogleLogin } from "@/features/auth/hooks/useGoogleLogin";
import { UserRound, Building2 } from "lucide-react";

// ─── Password strength indicator ──────────────────────────────────────────────

function PasswordStrengthIndicator({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: "8 caracteres mínimo",   ok: password.length >= 8 },
    { label: "Una mayúscula",          ok: /[A-Z]/.test(password) },
    { label: "Una minúscula",          ok: /[a-z]/.test(password) },
    { label: "Un número",              ok: /[0-9]/.test(password) },
    { label: "Un carácter especial",   ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const passed   = checks.filter((c) => c.ok).length;
  const strength = passed <= 2 ? "weak" : passed <= 4 ? "medium" : "strong";

  const barColor = { weak: "bg-red-400", medium: "bg-amber-400", strong: "bg-emerald-500" }[strength];
  const barWidth = { weak: "w-1/3",      medium: "w-2/3",        strong: "w-full"         }[strength];
  const label    = { weak: "Débil",       medium: "Media",         strong: "Fuerte"         }[strength];
  const labelColor = {
    weak:   "text-red-500",
    medium: "text-amber-500",
    strong: "text-emerald-600",
  }[strength];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${barColor} ${barWidth}`} />
        </div>
        <span className={`text-xs font-medium ${labelColor}`}>{label}</span>
      </div>
      <ul className="space-y-1">
        {checks.map(({ label, ok }) => (
          <li
            key={label}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              ok ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            <span>{ok ? "✓" : "○"}</span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Password fields — reutilizable para ambas secciones ──────────────────────

function PasswordFields({
  register,
  errors,
  passwordValue,
  emailLabel = "Correo electrónico",
}: {
  register: any;
  errors: any;
  passwordValue: string;
  emailLabel?: string;
}) {
  return (
    <>
      <div>
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          error={errors.password?.message as string | undefined}
        />
        <PasswordStrengthIndicator password={passwordValue} />
      </div>
      <Input
        label="Confirmar contraseña"
        type="password"
        placeholder="••••••••"
        {...register("passwordConfirmation")}
        error={errors.passwordConfirmation?.message as string | undefined}
      />
    </>
  );
}

// COMPONENT

export function RegisterForm() {
  const {
    form,
    selectedRole,
    isCompany,
    formError,
    isValidatingDni,
    isValidatingRepDni,
    isSubmitting,
    canSubmit,
    errors,
    handleRoleChange,
    handleDniBlur,
    handleRepDniBlur,
    onSubmit,
    dniValue,
    repDniValue,
    isGoogleSignUp,
    isHydrated,
    validatedDni,
    validatedRepDni,
  } = useRegister();

  const { signInWithGoogle, isLoading: googleLoading, error: googleError } = useGoogleLogin();
  const { register } = form;

  // Watch del campo password para el indicador de fortaleza
  const passwordValue = form.watch("password") ?? "";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">

      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: "#1B3A6B" }}
        >
          A
        </div>
        <span className="text-xl font-bold" style={{ color: "#1B3A6B" }}>Achanvear</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Crea tu cuenta</h1>
          <p className="mt-1 text-sm text-slate-500">Comienza tu camino profesional hoy</p>
        </div>

        {formError && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {formError}
          </div>
        )}
        {googleError && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {googleError}
          </div>
        )}

        {/* Selector de rol */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleRoleChange("FREELANCER")}
            className="flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all"
            style={{
              borderColor: !isCompany ? "#1B3A6B" : "#E2E8F0",
              backgroundColor: !isCompany ? "#EEF2FF" : "#FFFFFF",
            }}
          >
            <UserRound className="h-6 w-6" style={{ color: !isCompany ? "#1B3A6B" : "#94A3B8" }} />
            <div>
              <p className="text-sm font-semibold text-slate-900">Soy Profesional</p>
              <p className="text-xs text-slate-500">Busca empleo, proyectos u ofrece servicios</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("COMPANY")}
            className="flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all"
            style={{
              borderColor: isCompany ? "#1B3A6B" : "#E2E8F0",
              backgroundColor: isCompany ? "#EEF2FF" : "#FFFFFF",
            }}
          >
            <Building2 className="h-6 w-6" style={{ color: isCompany ? "#1B3A6B" : "#94A3B8" }} />
            <div>
              <p className="text-sm font-semibold text-slate-900">Soy Empresa</p>
              <p className="text-xs text-slate-500">Publica empleos y encuentra talento</p>
            </div>
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <input type="hidden" {...register("role")} />

          {/* ── PROFESIONAL ── */}
          {!isCompany && (
            <>
              <div>
                <Input
                  label="DNI"
                  type="text"
                  maxLength={8}
                  placeholder="12345678"
                  {...register("dni" as any, {
                    onBlur: (e: any) => handleDniBlur(e.target.value),
                  })}
                  error={(errors as any).dni?.message}
                />
                {isValidatingDni && (
                  <p className="mt-1 text-xs text-slate-400">Validando DNI...</p>
                )}
                {validatedDni === dniValue && (
                  <p className="mt-1 text-xs text-emerald-600">DNI validado correctamente.</p>
                )}
              </div>

              <Input
                label="Nombre completo"
                type="text"
                placeholder="Juan Pérez García"
                {...register("fullName" as any)}
                error={(errors as any).fullName?.message}
                readOnly={validatedDni === dniValue}
              />

              {isHydrated && isGoogleSignUp ? (
                <>
                  <input type="hidden" {...register("email")} />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Correo electrónico
                    </label>
                    <div className="w-full rounded-2xl border border-slate-300 bg-gray-100 px-4 py-3 text-sm text-slate-500">
                      {form.getValues("email") || "Cargando..."}
                    </div>
                  </div>
                  <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    Te registraste con Google. Solo completa los datos faltantes.
                  </div>
                </>
              ) : (
                <>
                  <Input
                    label="Teléfono"
                    type="tel"
                    maxLength={9}
                    placeholder="987654321"
                    {...register("phone" as any)}
                    error={(errors as any).phone?.message}
                  />
                  <Input
                    label="Correo electrónico"
                    type="email"
                    placeholder="tu@email.com"
                    {...register("email")}
                    error={errors.email?.message as string | undefined}
                  />
                  <PasswordFields
                    register={register}
                    errors={errors}
                    passwordValue={passwordValue}
                  />
                </>
              )}
            </>
          )}

          {/* ── EMPRESA ── */}
          {isCompany && (
            <>
              <Input
                label="RUC de la Empresa"
                type="text"
                maxLength={11}
                placeholder="20123456789"
                {...register("ruc" as any)}
                error={(errors as any).ruc?.message}
              />

              <Input
                label="Razón Social"
                type="text"
                placeholder="Tech Solutions Peru S.A.C."
                {...register("fullName" as any)}
                error={(errors as any).fullName?.message}
              />

              <div>
                <Input
                  label="DNI del Representante Legal"
                  type="text"
                  maxLength={8}
                  placeholder="12345678"
                  {...register("representanteDni" as any, {
                    onBlur: (e: any) => handleRepDniBlur(e.target.value),
                  })}
                  error={(errors as any).representanteDni?.message}
                />
                {isValidatingRepDni && (
                  <p className="mt-1 text-xs text-slate-400">Validando representante...</p>
                )}
                {validatedRepDni === repDniValue && (
                  <p className="mt-1 text-xs text-emerald-600">Representante validado correctamente.</p>
                )}
              </div>

              <Input
                label="Nombre del Representante Legal"
                type="text"
                placeholder="María Torres Rojas"
                {...register("representanteLegal" as any)}
                error={(errors as any).representanteLegal?.message}
                readOnly={validatedRepDni === repDniValue}
              />

              {isHydrated && isGoogleSignUp ? (
                <>
                  <input type="hidden" {...register("email")} />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Correo corporativo
                    </label>
                    <div className="w-full rounded-2xl border border-slate-300 bg-gray-100 px-4 py-3 text-sm text-slate-500">
                      {form.getValues("email") || "Cargando..."}
                    </div>
                  </div>
                  <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    Te registraste con Google. Solo completa los datos faltantes.
                  </div>
                </>
              ) : (
                <>
                  <Input
                    label="Teléfono"
                    type="tel"
                    maxLength={9}
                    placeholder="987654321"
                    {...register("phone" as any)}
                    error={(errors as any).phone?.message}
                  />
                  <Input
                    label="Correo corporativo"
                    type="email"
                    placeholder="contacto@empresa.com"
                    {...register("email")}
                    error={errors.email?.message as string | undefined}
                  />
                  <PasswordFields
                    register={register}
                    errors={errors}
                    passwordValue={passwordValue}
                  />
                </>
              )}
            </>
          )}

          {/* Términos */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                {...register("acceptTerms")}
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                style={{ accentColor: "#1B3A6B" }}
              />
              <span className="text-sm text-slate-600">
                Acepto los{" "}
                <Link href="/terms" className="font-medium underline" style={{ color: "#1B3A6B" }}>
                  términos y condiciones
                </Link>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="mt-1 text-xs text-red-500">
                {errors.acceptTerms.message as string}
              </p>
            )}
          </div>

          {/* Política de Privacidad */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                {...register("acceptPrivacy")}
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                style={{ accentColor: "#1B3A6B" }}
              />
              <span className="text-sm text-slate-600">
                He leído y acepto la{" "}
                <Link href="/privacy" className="font-medium underline" style={{ color: "#1B3A6B" }}>
                  Política de Privacidad
                </Link>
              </span>
            </label>
            {errors.acceptPrivacy && (
              <p className="mt-1 text-xs text-red-500">
                {errors.acceptPrivacy.message as string}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: "#1B3A6B" }}
            onMouseEnter={(e) => {
              if (!isSubmitting && canSubmit) e.currentTarget.style.backgroundColor = "#0EA5A0";
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting && canSubmit) e.currentTarget.style.backgroundColor = "#1B3A6B";
            }}
          >
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        {/* Google */}
        {(!isHydrated || !isGoogleSignUp) && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-400">o continúa con</span>
              </div>
            </div>

            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {googleLoading ? "Conectando..." : "Google"}
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "#1B3A6B" }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
