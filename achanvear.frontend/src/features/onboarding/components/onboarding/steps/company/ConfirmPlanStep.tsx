"use client";

import { useState, useEffect } from "react";
import { ApiError } from "@/lib/errors";
import { Alert } from "@/components/ui/Alert";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";                        // ← actualizado
import type { CompanyOnboardingData, Plan } from "@/features/onboarding/types/onboarding.types";   // ← actualizado

interface ConfirmPlanStepProps {
  data: CompanyOnboardingData;
  onUpdate: (updates: Partial<CompanyOnboardingData>) => void;
  onNext: (fromStep?: number) => void;
  onBack: () => void;
}

export function ConfirmPlanStep({ data, onUpdate, onNext, onBack }: ConfirmPlanStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSelectedPlan();
  }, []);

  const loadSelectedPlan = async () => {
    try {
      const plans = await onboardingService.getPlans(); // ← antes: companyService.getPlans
      const mappedPlans: Plan[] = plans.map((p: any) => ({
        id: p.planType || p.id,
        name: p.displayName || p.name,
        description: p.description || "",
        price: p.monthlyPrice ?? p.price ?? 0,
        yearlyPrice: p.yearlyPrice ?? Math.round((p.monthlyPrice ?? 0) * 12 * 0.8),
        currency: p.currency || "PEN",
        billingCycle: p.billingCycle || "monthly",
        features: p.benefits || p.features || [],
        isActive: p.isActive ?? true,
        isPopular: p.isPopular ?? false,
        maxActiveJobs: p.maxProjects ?? p.maxActiveJobs ?? 1,
        maxInterviews: p.maxInterviews ?? 5,
        availableAgents: p.availableAgents || [],
        proctoringLevel: p.proctoringLevel || "basic",
        videoStorageDays: p.videoStorageDays ?? 7,
        hasExecutiveReports: p.hasExecutiveReports ?? false,
        hasKanbanPipeline: p.hasKanbanPipeline ?? false,
        hasWhiteLabel: p.hasWhiteLabel ?? false,
        hasReportsApi: p.hasReportsApi ?? false,
        hasAccountManager: p.hasAccountManager ?? false,
        supportLevel: p.supportLevel || "email",
      }));
      const plan = mappedPlans.find(p => p.id === data.selectedPlan);
      setSelectedPlan(plan || null);
    } catch (err) {
      console.error("Error loading plans:", err);
      setSelectedPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onUpdate({ planConfirmed: true });
    onNext();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Cargando plan...</p>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
        <p className="text-slate-600">Plan no encontrado</p>
        <button onClick={onBack} className="mt-4 text-teal-600 font-semibold">Volver</button>
      </div>
    );
  }

  const price = data.billingCycle === "yearly" && selectedPlan.price > 0
    ? selectedPlan.price * 0.8
    : selectedPlan.price;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Confirmar Plan {selectedPlan.name}</h1>
        <p className="text-slate-600">{selectedPlan.description}</p>
      </div>

      {error && <Alert message={error} />}

      <div className="bg-slate-50 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-slate-700">Ciclo de facturacion:</span>
          <span className="font-semibold text-slate-900">
            {data.billingCycle === "monthly" ? "Mensual" : "Anual"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-700">Total:</span>
          <span className="text-3xl font-bold text-blue-900">
            {price === 0 ? "Gratis" : `S/. ${price} /mes`}
          </span>
        </div>
      </div>

      {selectedPlan.price > 0 && (
        <div className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Tu plan se activara inmediatamente despues de completar la configuracion de pago.
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-2xl hover:bg-slate-50 transition"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-blue-900 to-teal-600 text-white font-semibold py-3 rounded-2xl hover:from-blue-800 hover:to-teal-500 transition-all disabled:opacity-50"
        >
          {isSubmitting ? "Procesando..." : "Continuar al pago"}
        </button>
      </div>
    </div>
  );
}