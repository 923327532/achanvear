"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ApiError } from "@/lib/errors";
import { Alert } from "@/components/ui/Alert";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";
import type { CompanyOnboardingData } from "@/features/onboarding/types/onboarding.types";

interface CreateCompanyAccountStepProps {
  data: CompanyOnboardingData;
  onUpdate: (updates: Partial<CompanyOnboardingData>) => void;
  onNext: (fromStep?: number) => void;
}

export function CreateCompanyAccountStep({ data, onUpdate, onNext }: CreateCompanyAccountStepProps) {
  const { login: loginUser, user, status } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validatingDni, setValidatingDni] = useState(false);

  const isAuthenticated = status === "AUTHENTICATED" && user;

  const validateDniWithApi = async (dni: string): Promise<string | null> => {
    try {
      setValidatingDni(true);
      const response = await fetch(`/api/dni/${dni}`);
      if (!response.ok) {
        return "El DNI no es válido o no se encontró en registros oficiales";
      }
      return null;
    } catch {
      return "Error al validar el DNI";
    } finally {
      setValidatingDni(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (isAuthenticated) {
      // Cuando está autenticado, validar RUC, Razón Social y Representante Legal
      if (!data.razonSocial.trim()) newErrors.razonSocial = "La razón social es requerida";
      if (!data.representanteLegal.trim()) newErrors.representanteLegal = "El nombre del representante legal es requerido";
      if (!data.representanteLegalDni.trim()) newErrors.representanteLegalDni = "El DNI del representante legal es requerido";
      else if (!/^\d{8}$/.test(data.representanteLegalDni)) newErrors.representanteLegalDni = "El DNI debe tener 8 dígitos";
      if (!data.ruc.trim()) newErrors.ruc = "El RUC es requerido";
      else if (!/^\d{11}$/.test(data.ruc)) newErrors.ruc = "El RUC debe tener 11 dígitos";
    } else {
      // Cuando NO está autenticado, validar todo
      if (!data.razonSocial.trim()) newErrors.razonSocial = "La razón social es requerida";
      if (!data.ruc.trim()) newErrors.ruc = "El RUC es requerido";
      else if (!/^\d{11}$/.test(data.ruc)) newErrors.ruc = "El RUC debe tener 11 dígitos";
      if (!data.representanteLegal.trim()) newErrors.representanteLegal = "El nombre del representante legal es requerido";
      if (!data.representanteLegalDni.trim()) newErrors.representanteLegalDni = "El DNI del representante legal es requerido";
      else if (!/^\d{8}$/.test(data.representanteLegalDni)) newErrors.representanteLegalDni = "El DNI debe tener 8 dígitos";
      if (data.phone && !/^\d{9,15}$/.test(data.phone)) newErrors.phone = "El teléfono debe tener entre 9 y 15 dígitos";
      if (!data.email.trim()) newErrors.email = "El correo es requerido";
      else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = "Correo inválido";
      if (!data.password) newErrors.password = "La contraseña es requerida";
      else if (data.password.length < 8) newErrors.password = "Mínimo 8 caracteres";
      if (data.password !== data.passwordConfirmation) newErrors.passwordConfirmation = "Las contraseñas no coinciden";
      if (!data.acceptTerms) newErrors.acceptTerms = "Debes aceptar los términos";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (!isAuthenticated) {
        localStorage.removeItem('achanvear_auth_token');
        await onboardingService.registerCompany({
          email: data.email,
          fullName: data.representanteLegal || "Representante",
          dni: data.representanteLegalDni,
          phone: data.phone || undefined,
          password: data.password,
          role: "COMPANY",
          representanteDni: data.representanteLegalDni,
          representanteLegal: data.representanteLegal,
          ruc: data.ruc || undefined,
        });
        await loginUser({ email: data.email, password: data.password });
      }
      // Guardar TODOS los datos en sessionStorage para el wizard
      sessionStorage.setItem("company_onboarding_data", JSON.stringify({
        ruc: data.ruc,
        razonSocial: data.razonSocial,
        representanteLegal: data.representanteLegal,
        representanteLegalDni: data.representanteLegalDni,
        email: data.email,
      }));
      // Avanzar al siguiente paso (sin crear compañía aún)
      onNext();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error inesperado al registrar";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          {isAuthenticated ? "Datos de tu empresa" : "Crea tu cuenta"}
        </h1>
        <p className="text-slate-600">
          {isAuthenticated ? "Ingresa los datos de tu empresa" : "Comienza tu camino profesional hoy"}
        </p>
      </div>

      {formError && <Alert message={formError} />}

      {isAuthenticated && user && (
        <div className="mb-6 p-4 bg-teal-50 rounded-2xl border border-teal-200">
          <p className="text-sm text-teal-800"><strong>Email:</strong> {user.email}</p>
          <p className="text-sm text-teal-800"><strong>Representante Legal:</strong> {data.representanteLegal}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isAuthenticated ? (
          <>
            {/* RUC, Razón Social y Representante Legal cuando ya está autenticado */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Razón Social</label>
              <input
                type="text"
                value={data.razonSocial}
                onChange={(e) => onUpdate({ razonSocial: e.target.value })}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${
                  errors.razonSocial ? "border-red-500" : "border-slate-300 focus:border-teal-600"
                }`}
                placeholder="Razón social de tu empresa"
              />
              {errors.razonSocial && <p className="text-red-500 text-sm mt-1">{errors.razonSocial}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Representante Legal</label>
              <input
                type="text"
                value={data.representanteLegal}
                onChange={(e) => onUpdate({ representanteLegal: e.target.value })}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${
                  errors.representanteLegal ? "border-red-500" : "border-slate-300 focus:border-teal-600"
                }`}
                placeholder="Nombre completo del representante"
              />
              {errors.representanteLegal && <p className="text-red-500 text-sm mt-1">{errors.representanteLegal}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">DNI del Representante Legal</label>
              <input
                type="text"
                value={data.representanteLegalDni}
                onChange={(e) => onUpdate({ representanteLegalDni: e.target.value })}
                maxLength={8}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${
                  errors.representanteLegalDni ? "border-red-500" : "border-slate-300 focus:border-teal-600"
                }`}
                placeholder="DNI del representante (8 dígitos)"
              />
              {errors.representanteLegalDni && <p className="text-red-500 text-sm mt-1">{errors.representanteLegalDni}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">RUC de la Empresa</label>
              <input
                type="text"
                value={data.ruc}
                onChange={(e) => onUpdate({ ruc: e.target.value })}
                maxLength={11}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${
                  errors.ruc ? "border-red-500" : "border-slate-300 focus:border-teal-600"
                }`}
                placeholder="Tu RUC (11 dígitos)"
              />
              {errors.ruc && <p className="text-red-500 text-sm mt-1">{errors.ruc}</p>}
            </div>
          </>
        ) : (
          <>
            {/* Formulario de registro */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Razón Social</label>
              <input
                type="text"
                value={data.razonSocial}
                onChange={(e) => onUpdate({ razonSocial: e.target.value })}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${
                  errors.razonSocial ? "border-red-500" : "border-slate-300 focus:border-teal-600"
                }`}
                placeholder="Razón social de tu empresa"
              />
              {errors.razonSocial && <p className="text-red-500 text-sm mt-1">{errors.razonSocial}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">RUC de la Empresa</label>
              <input
                type="text"
                value={data.ruc}
                onChange={(e) => onUpdate({ ruc: e.target.value })}
                maxLength={11}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${
                  errors.ruc ? "border-red-500" : "border-slate-300 focus:border-teal-600"
                }`}
                placeholder="Tu RUC (11 dígitos)"
              />
              {errors.ruc && <p className="text-red-500 text-sm mt-1">{errors.ruc}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Representante Legal</label>
              <input
                type="text"
                value={data.representanteLegal}
                onChange={(e) => onUpdate({ representanteLegal: e.target.value })}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${
                  errors.representanteLegal ? "border-red-500" : "border-slate-300 focus:border-teal-600"
                }`}
                placeholder="Nombre completo del representante"
              />
              {errors.representanteLegal && <p className="text-red-500 text-sm mt-1">{errors.representanteLegal}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">DNI del Representante Legal</label>
              <input
                type="text"
                value={data.representanteLegalDni}
                onChange={(e) => onUpdate({ representanteLegalDni: e.target.value })}
                maxLength={8}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${
                  errors.representanteLegalDni ? "border-red-500" : "border-slate-300 focus:border-teal-600"
                }`}
                placeholder="DNI del representante (8 dígitos)"
              />
              {errors.representanteLegalDni && <p className="text-red-500 text-sm mt-1">{errors.representanteLegalDni}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono</label>
              <input
                type="tel"
                value={data.phone || ""}
                onChange={(e) => onUpdate({ phone: e.target.value })}
                maxLength={15}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${
                  errors.phone ? "border-red-500" : "border-slate-300 focus:border-teal-600"
                }`}
                placeholder="Teléfono de contacto"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Correo corporativo</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => onUpdate({ email: e.target.value })}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${
                  errors.email ? "border-red-500" : "border-slate-300 focus:border-teal-600"
                }`}
                placeholder="correo@empresa.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
              <input
                type="password"
                value={data.password}
                onChange={(e) => onUpdate({ password: e.target.value })}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${
                  errors.password ? "border-red-500" : "border-slate-300 focus:border-teal-600"
                }`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirmar contraseña</label>
              <input
                type="password"
                value={data.passwordConfirmation}
                onChange={(e) => onUpdate({ passwordConfirmation: e.target.value })}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${
                  errors.passwordConfirmation ? "border-red-500" : "border-slate-300 focus:border-teal-600"
                }`}
                placeholder="••••••••"
              />
              {errors.passwordConfirmation && <p className="text-red-500 text-sm mt-1">{errors.passwordConfirmation}</p>}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={data.acceptTerms}
                onChange={(e) => onUpdate({ acceptTerms: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-600"
              />
              <label className="ml-2 text-sm text-slate-700">Acepto los términos y condiciones</label>
            </div>
            {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms}</p>}
          </>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-900 to-teal-600 text-white font-semibold py-3 rounded-2xl hover:from-blue-800 hover:to-teal-500 transition-all disabled:opacity-50"
        >
          {isSubmitting ? "Procesando..." : isAuthenticated ? "Continuar" : "Crear cuenta"}
        </button>

        {!isAuthenticated && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">o continua con</span></div>
            </div>
            <button type="button" className="w-full border border-slate-300 rounded-2xl py-3 flex items-center justify-center gap-2 hover:bg-slate-50 transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <p className="text-center text-sm text-slate-600">
              ¿Ya tienes cuenta?{" "}
              <a href="/login" className="font-semibold text-teal-600 hover:underline">Inicia sesión</a>
            </p>
          </>
        )}
      </form>
    </div>
  );
}
