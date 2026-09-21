"use client";

import { useState, useEffect } from "react";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";

interface StepSpecialtyProps {
  industry: string;
  selected: string;
  onSelect: (value: string) => void;
  onContinue: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

export function StepSpecialty({
  industry,
  selected,
  onSelect,
  onContinue,
  onBack,
  isLoading,
  error,
}: StepSpecialtyProps) {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);

  useEffect(() => {
    if (!industry) return;
    setLoadingSpecialties(true);
    onboardingService
      .getSpecialtiesByIndustry(industry)
      .then((data) => {
        setSpecialties(data);
        setLoadingSpecialties(false);
      })
      .catch(() => {
        setSpecialties([]);
        setLoadingSpecialties(false);
      });
  }, [industry]);

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          Cual es tu especialidad?
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Especialidades disponibles para {industry}
        </p>
      </div>

      {loadingSpecialties ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-2">
          {specialties.map((specialty) => (
            <button
              key={specialty}
              type="button"
              onClick={() => onSelect(specialty)}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                selected === specialty
                  ? "border-slate-900 bg-slate-900/5 font-semibold text-slate-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          Atras
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!selected || isLoading || loadingSpecialties}
          className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Guardando..." : "Continuar"}
        </button>
      </div>
    </div>
  );
}
