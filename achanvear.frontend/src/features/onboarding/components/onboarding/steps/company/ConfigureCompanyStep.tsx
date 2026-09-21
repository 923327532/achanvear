"use client";

import { useState, useEffect } from "react";
import { Alert } from "@/components/ui/Alert";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";
import type { CompanyOnboardingData } from "@/features/onboarding/types/onboarding.types";

interface ConfigureCompanyStepProps {
  data: CompanyOnboardingData;
  onUpdate: (updates: Partial<CompanyOnboardingData>) => void;
  onNext: (fromStep?: number) => void;
  onBack: () => void;
}

export function ConfigureCompanyStep({ data, onUpdate, onNext, onBack }: ConfigureCompanyStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [industries, setIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLoading(true);
    onboardingService
      .getCatalogIndustries()
      .then((result) => {
        setIndustries(result);
        setLoading(false);
      })
      .catch(() => {
        setIndustries([]);
        setLoading(false);
      });
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.industry) newErrors.industry = "Debes seleccionar un rubro";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setError(null);
    // El wizard se encarga de llamar a initCompany en el backend
    onNext();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Configura tu empresa</h1>
        <p className="text-slate-600">Selecciona el rubro de tu empresa</p>
      </div>

      {error && <Alert message={error} />}

      <div className="space-y-4 mb-8">
        {/* Datos de la empresa (solo lectura) */}
        <div className="bg-teal-50 rounded-2xl border border-teal-200 p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Razón Social:</span>
            <span className="text-sm font-semibold text-slate-900">{data.razonSocial}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Representante Legal:</span>
            <span className="text-sm font-semibold text-slate-900">{data.representanteLegal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">DNI del Representante:</span>
            <span className="text-sm font-semibold text-slate-900">{data.representanteLegalDni}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">RUC:</span>
            <span className="text-sm font-semibold text-slate-900">{data.ruc}</span>
          </div>
        </div>

        {/* Industria */}
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-900 border-t-transparent" />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4">¿Cual es el rubro de tu empresa?</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {industries.map((industry) => (
                <button
                  key={industry}
                  type="button"
                  onClick={() => onUpdate({ industry })}
                  className={`p-4 rounded-2xl border-2 transition-all text-center ${
                    data.industry === industry
                      ? "border-teal-600 bg-teal-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-semibold text-slate-900">{industry}</div>
                </button>
              ))}
            </div>
            {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-2xl hover:bg-slate-50 transition"
        >
          Atras
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || loading}
          className="flex-1 bg-gradient-to-r from-blue-900 to-teal-600 text-white font-semibold py-3 rounded-2xl hover:from-blue-800 hover:to-teal-500 transition-all disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Continuar"}
        </button>
      </div>
    </div>
  );
}
