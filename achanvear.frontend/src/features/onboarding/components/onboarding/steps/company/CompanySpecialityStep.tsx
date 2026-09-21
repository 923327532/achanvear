"use client";

import { useState, useEffect } from "react";
import { ApiError } from "@/lib/errors";
import { Alert } from "@/components/ui/Alert";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";
import type { CompanyOnboardingData } from "@/features/onboarding/types/onboarding.types"; // ← actualizado

interface CompanySpecialityStepProps {
  data: CompanyOnboardingData;
  onUpdate: (updates: Partial<CompanyOnboardingData>) => void;
  onNext: (fromStep?: number) => void;
  onBack: () => void;
}

export function CompanySpecialityStep({ data, onUpdate, onNext, onBack }: CompanySpecialityStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);

  useEffect(() => {
    if (!data.industry) return;
    setLoadingSpecialties(true);
    onboardingService
      .getCatalogSpecialties(data.industry)
      .then((result) => {
        setSpecialties(result);
        setLoadingSpecialties(false);
      })
      .catch(() => {
        setSpecialties([]);
        setLoadingSpecialties(false);
      });
  }, [data.industry]);

  const handleSubmit = () => {
    if (!data.speciality) {
      setError("Debes seleccionar un rubro");
      return;
    }
    onNext();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">¿Cuál es tu especialidad?</h1>
        <p className="text-slate-500">Especialidades disponibles para {data.industry}</p>
      </div>

      {error && <Alert message={error} />}

      {loadingSpecialties ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-900 border-t-transparent" />
        </div>
      ) : (
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-3">
            {specialties.map((speciality) => (
              <button
                key={speciality}
                type="button"
                onClick={() => onUpdate({ speciality })}
                className={`p-4 rounded-2xl border-2 transition-all text-center ${
                  data.speciality === speciality
                    ? "border-teal-600 bg-teal-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="font-semibold text-slate-900">{speciality}</div>
              </button>
            ))}
          </div>
        </div>
      )}

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
          disabled={isSubmitting || !data.speciality || loadingSpecialties}
          className="flex-1 bg-gradient-to-r from-blue-900 to-teal-600 text-white font-semibold py-3 rounded-2xl hover:from-blue-800 hover:to-teal-500 transition-all disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Continuar"}
        </button>
      </div>
    </div>
  );
}