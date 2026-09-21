"use client";

import { useState, useEffect } from "react";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";

interface StepIndustryProps {
  selected: string;
  onSelect: (value: string) => void;
  onContinue: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

export function StepIndustry({
  selected,
  onSelect,
  onContinue,
  onBack,
  isLoading,
  error,
}: StepIndustryProps) {
  const [industries, setIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    onboardingService
      .getIndustries()
      .then((data) => {
        setIndustries(data);
        setLoading(false);
      })
      .catch(() => {
        setIndustries([]);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          Personaliza tu experiencia
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Cuentanos sobre tu industria para mostrarte contenido relevante
        </p>
      </div>

      <p className="mb-4 text-sm font-medium text-slate-700">
        A que industria perteneces?
      </p>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-2">
          {industries.map((industry) => (
            <button
              key={industry}
              type="button"
              onClick={() => onSelect(industry)}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                selected === industry
                  ? "border-slate-900 bg-slate-900/5 font-semibold text-slate-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              {industry}
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
          disabled={!selected || isLoading || loading}
          className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Guardando..." : "Continuar"}
        </button>
      </div>
    </div>
  );
}
