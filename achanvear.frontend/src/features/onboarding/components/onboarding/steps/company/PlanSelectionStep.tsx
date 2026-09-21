"use client";

import { useState, useEffect } from "react";
import { FileText, Building, Rocket, Crown, Zap, Shield, Lock, Headphones, CheckCircle2, X, ChevronDown } from "lucide-react";
import { ApiError } from "@/lib/errors";
import { Alert } from "@/components/ui/Alert";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";
import type { CompanyOnboardingData, Plan } from "@/features/onboarding/types/onboarding.types";

interface PlanSelectionStepProps {
  data: CompanyOnboardingData;
  onUpdate: (updates: Partial<CompanyOnboardingData>) => void;
  onNext: (fromStep?: number) => void;
  onBack: () => void;
}

export function PlanSelectionStep({ data, onUpdate, onNext, onBack }: PlanSelectionStepProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanForConfirm, setSelectedPlanForConfirm] = useState<Plan | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    try {
      const loadedPlans = await onboardingService.getPlans();
      setPlans(loadedPlans);
    } catch (err) {
      setError("Error al cargar planes");
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "FREE": return { from: "#64748B", to: "#475569" };
      case "BASIC": return { from: "#3B82F6", to: "#1D4ED8" };
      case "PREMIUM": return { from: "#0EA5A0", to: "#0d928d" };
      case "ENTERPRISE": return { from: "#F59E0B", to: "#D97706" };
      default: return { from: "#64748B", to: "#475569" };
    }
  };

  const getPlanIcon = (planId: string, className: string = "w-6 h-6") => {
    switch (planId) {
      case "FREE": return <FileText className={className} />;
      case "BASIC": return <Building className={className} />;
      case "PREMIUM": return <Rocket className={className} />;
      case "ENTERPRISE": return <Crown className={className} />;
      default: return <FileText className={className} />;
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === "FREE") {
      onUpdate({ selectedPlan: plan.id, billingCycle: "monthly" });
      onNext();
    } else {
      setSelectedPlanId(plan.id);
      setShowDetails(true);
      setTimeout(() => {
        document.getElementById("plan-details-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleContinueFromDetails = () => {
    const plan = plans.find(p => p.id === selectedPlanId);
    if (plan) {
      setSelectedPlanForConfirm(plan);
    }
  };

  const confirmSelection = () => {
    if (!selectedPlanForConfirm) return;
    onUpdate({
      selectedPlan: selectedPlanForConfirm.id,
      billingCycle: data.billingCycle,
      planConfirmed: true,
    });
    setSelectedPlanForConfirm(null);
    onNext();
  };

  const getSavings = (plan: Plan) => {
    if (plan.price <= 0) return 0;
    return (plan.price * 12) - Math.round(plan.price * 12 * 0.8);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando planes...</p>
        </div>
      </div>
    );
  }

  if (error && plans.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <Alert message={error} />
      </div>
    );
  }

  return (
    <div className="bg-[#0A0E1A] rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-8 pb-4 text-center">
        <div className="inline-block bg-[#0EA5A0]/20 text-[#0EA5A0] text-xs font-bold px-3 py-1 rounded-full mb-4">
          <Zap className="w-3 h-3 inline mr-1" />Último paso
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Impulsa tu reclutamiento con el plan ideal
        </h1>
        <p className="text-gray-400 text-lg">
          Elige el plan que se ajuste a tus necesidades. Puedes cambiar o cancelar en cualquier momento.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="px-8 pb-6">
        <div className="inline-flex items-center justify-center gap-2 p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-full">
          <button
            onClick={() => onUpdate({ billingCycle: "monthly" })}
            className={`flex-1 px-6 py-3 rounded-xl transition-all text-sm font-bold ${
              data.billingCycle === "monthly"
                ? "bg-gradient-to-r from-[#1B3A6B] to-[#0EA5A0] text-white shadow-lg"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Facturación Mensual
          </button>
          <button
            onClick={() => onUpdate({ billingCycle: "yearly" })}
            className={`flex-1 px-6 py-3 rounded-xl transition-all text-sm font-bold relative ${
              data.billingCycle === "yearly"
                ? "bg-gradient-to-r from-[#1B3A6B] to-[#0EA5A0] text-white shadow-lg"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Facturación Anual
            <span className="absolute -top-2 -right-2 bg-[#10B981] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid — 4 planes: Free, Basic, Premium, Enterprise */}
      <div className="px-8 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const colors = getPlanColor(plan.id);
            const price = data.billingCycle === "yearly" && plan.price > 0
              ? Math.round(plan.price * 12 * 0.8 / 12)
              : plan.price;
            const savings = getSavings(plan);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl overflow-hidden transition-all hover:shadow-xl ${
                  plan.isPopular
                    ? "border-2 border-[#0EA5A0] shadow-lg shadow-[#0EA5A0]/20 scale-[1.02] z-10"
                    : "border border-white/10"
                } bg-white`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-[#0EA5A0] to-[#0d928d] text-white text-xs font-bold px-4 py-1 rounded-bl-lg z-20">
                    RECOMENDADO
                  </div>
                )}
                {plan.id === "FREE" && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-[#64748B] to-[#475569] text-white text-xs font-bold px-4 py-1 rounded-bl-lg z-20">
                    PLAN INICIAL
                  </div>
                )}

                <div className="p-6 space-y-5">
                  <div>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `linear-gradient(to bottom right, ${colors.from}, ${colors.to})`, color: "white" }}
                    >
                      {getPlanIcon(plan.id)}
                    </div>
                    <h3 className="text-xl font-bold text-[#0F172A]">{plan.name}</h3>
                    <p className="text-sm text-[#64748B] mt-1">{plan.description}</p>
                  </div>

                  <div>
                    {price === 0 ? (
                      <span className="text-3xl font-extrabold text-[#0F172A]">Gratis</span>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-[#64748B]">S/.</span>
                        <span className="text-4xl font-extrabold text-[#0F172A]">{Math.round(price)}</span>
                        <span className="text-[#64748B] font-bold">/mes</span>
                      </div>
                    )}
                    {data.billingCycle === "yearly" && price > 0 && (
                      <div className="mt-1 space-y-1">
                        <p className="text-xs text-[#64748B]">
                          Facturado S/. {Math.round(plan.price * 12 * 0.8)} al año
                        </p>
                        {savings > 0 && (
                          <span className="inline-block bg-[#10B981]/20 text-[#10B981] text-xs font-bold px-2 py-0.5 rounded-full">
                            Ahorras S/. {savings} al año
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full font-bold text-sm py-3 rounded-xl transition-all ${
                      plan.isPopular
                        ? "bg-gradient-to-r from-[#0EA5A0] to-[#0d928d] hover:from-[#0d928d] hover:to-[#0c8682] text-white shadow-lg shadow-[#0EA5A0]/30"
                        : "bg-[#1B3A6B] hover:bg-[#0F172A] text-white"
                    }`}
                  >
                    Elegir Plan
                  </button>

                  <div className="space-y-2.5 pt-4 border-t border-[#E2E8F0]">
                    {plan.features.slice(0, 6).map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-[#0F172A]">{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 6 && (
                      <p className="text-xs text-[#0EA5A0] font-semibold">+{plan.features.length - 6} más</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Plan Details - shows when a plan is clicked */}
      {showDetails && selectedPlanId && (
        <div id="plan-details-section" className="border-t border-white/10">
          {/* Selected Plan Banner */}
          <div className="px-8 pt-6 pb-4">
            <div className="bg-gradient-to-r from-[#1B3A6B] to-[#0EA5A0] rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    {getPlanIcon(selectedPlanId, "w-8 h-8")}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{plans.find(p => p.id === selectedPlanId)?.name}</h3>
                    <p className="text-white/80 text-sm">
                      {data.billingCycle === "yearly" ? "Facturación Anual - Ahorras 20%" : "Facturación Mensual"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleContinueFromDetails}
                  className="bg-white text-[#0F172A] font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition whitespace-nowrap"
                >
                  Continuar al pago
                </button>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="px-8 pb-4">
            <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Comparación detallada de características
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-white/20">
                      <th className="text-left py-3 px-4 text-gray-300 font-bold">Característica</th>
                      {plans.map(plan => (
                        <th key={plan.id} className="text-center py-3 px-3 font-bold text-gray-300">{plan.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Publicaciones activas", get: (p: Plan) => p.maxActiveJobs === -1 ? "Ilimitado" : p.maxActiveJobs.toString() },
                      { label: "Entrevistas con IA", get: (p: Plan) => p.maxInterviews === -1 ? "Ilimitadas" : p.maxInterviews === 0 ? "—" : `${p.maxInterviews}/mes` },
                      { label: "Agentes IA disponibles", get: (p: Plan) => p.availableAgents.length === 0 ? "—" : `${p.availableAgents.length} (Todos)` },
                      { label: "Proctoring anti-fraude", get: (p: Plan) => p.proctoringLevel === "none" ? "—" : "✓" },
                      { label: "Reportes ejecutivos IA", get: (p: Plan) => p.hasExecutiveReports ? "✓" : "—" },
                      { label: "Pipeline Kanban visual", get: (p: Plan) => p.hasKanbanPipeline ? "✓" : "—" },
                      { label: "White-label (marca propia)", get: (p: Plan) => p.hasWhiteLabel ? "✓" : "—" },
                      { label: "API de reportes", get: (p: Plan) => p.hasReportsApi ? "✓" : "—" },
                      { label: "Account Manager", get: (p: Plan) => p.hasAccountManager ? "✓" : "—" },
                      { label: "Soporte", get: (p: Plan) => p.supportLevel === "email" ? "Email" : p.supportLevel === "chat" ? "Chat + Email" : p.supportLevel === "24/7" ? "24/7 Prioritario" : "—" },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-gray-200 font-semibold">{row.label}</td>
                        {plans.map(plan => (
                          <td key={plan.id} className={`text-center py-3 px-3 ${plan.isPopular ? "bg-[#0EA5A0]/5" : ""}`}>
                            {row.get(plan) === "✓" ? (
                              <CheckCircle2 className="w-5 h-5 text-[#10B981] mx-auto" />
                            ) : row.get(plan) === "—" ? (
                              <X className="w-5 h-5 text-gray-600 mx-auto" />
                            ) : (
                              <span className={`${plan.isPopular ? "text-white font-bold" : "text-gray-300 font-semibold"}`}>
                                {row.get(plan)}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="px-8 pb-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <Shield className="w-6 h-6 text-[#10B981]" />, title: "Pago Seguro", desc: "Procesamiento encriptado SSL" },
                { icon: <Lock className="w-6 h-6 text-[#3B82F6]" />, title: "Cancela cuando quieras", desc: "Sin compromisos" },
                { icon: <Headphones className="w-6 h-6 text-[#F59E0B]" />, title: "Soporte dedicado", desc: "Equipo listo para ti" },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-center">
                  <div className="mb-2 flex justify-center">{item.icon}</div>
                  <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Back Button */}
          <div className="px-8 pb-8">
            <div className="flex gap-4">
              <button
                onClick={() => { setShowDetails(false); setSelectedPlanId(null); }}
                className="flex-1 border border-gray-600 text-gray-300 font-semibold py-3 rounded-2xl hover:bg-white/5 transition"
              >
                Volver a planes
              </button>
              <button
                onClick={handleContinueFromDetails}
                className="flex-1 bg-gradient-to-r from-[#0EA5A0] to-[#0d928d] hover:from-[#0d928d] hover:to-[#0c8682] text-white font-semibold py-3 rounded-2xl transition"
              >
                Continuar al pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show back button only when no details are shown */}
      {!showDetails && (
        <div className="px-8 pb-8">
          <button
            onClick={onBack}
            className="w-full border border-gray-600 text-gray-300 font-semibold py-3 rounded-2xl hover:bg-white/5 transition"
          >
            Atras
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedPlanForConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0F172A] to-[#1B3A6B]/80 border border-white/20 rounded-3xl p-8 max-w-lg w-full">
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(to bottom right, ${getPlanColor(selectedPlanForConfirm.id).from}, ${getPlanColor(selectedPlanForConfirm.id).to})`, color: "white" }}
              >
                {getPlanIcon(selectedPlanForConfirm.id, "w-8 h-8")}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Confirmar Plan {selectedPlanForConfirm.name}
              </h2>
              <p className="text-gray-300">{selectedPlanForConfirm.description}</p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300">Ciclo de facturación:</span>
                <span className="text-white font-bold">
                  {data.billingCycle === "monthly" ? "Mensual" : "Anual"}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-300">Total:</span>
                <span className="text-[#0EA5A0] font-bold">
                  {selectedPlanForConfirm.price === 0 ? "Gratis" : `S/. ${
                    data.billingCycle === "yearly" && selectedPlanForConfirm.price > 0
                      ? Math.round(selectedPlanForConfirm.price * 12 * 0.8)
                      : selectedPlanForConfirm.price
                  } ${data.billingCycle === "monthly" ? "/mes" : "/año"}`}
                </span>
              </div>
              {data.billingCycle === "yearly" && selectedPlanForConfirm.price > 0 && (
                <p className="text-sm text-[#10B981] mt-2 text-center font-semibold">
                  ✓ Ahorras 20% con facturación anual
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPlanForConfirm(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl border border-white/20 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSelection}
                className="flex-1 bg-gradient-to-r from-[#0EA5A0] to-[#0d928d] hover:from-[#0d928d] hover:to-[#0c8682] text-white font-semibold py-3 rounded-xl transition"
              >
                Continuar al pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}