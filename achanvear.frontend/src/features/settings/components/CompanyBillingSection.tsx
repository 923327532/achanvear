// features/settings/components/CompanyBillingSection.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Loader2,
  ExternalLink,
  AlertTriangle,
  X,
  CheckCircle2,
  TrendingUp,
  Check,
  Wallet,
  ArrowRight,
} from "lucide-react";
import {
  useAvailablePlans,
  useCurrentPlan,
  useSubscribeToPlan,
  useCheckoutCreditPackage,
  useCompanyPaymentMethods,
  usePaymentsOverview,
  useWallet,
  useCreditPackages,
} from "../hooks/useCompanySettings";
import { useCompanyProfile } from "../hooks/useCompanySettings";

export function CompanyBillingSection() {
  const router = useRouter();
  const { company } = useCompanyProfile();
  const { plans, isLoading: isLoadingPlans } = useAvailablePlans();
  const { creditPackages, isLoading: isLoadingCreditPackages } = useCreditPackages();
  const { currentPlan, isLoading: isLoadingCurrentPlan } = useCurrentPlan();
  const { overview, isLoading: isLoadingOverview } = usePaymentsOverview();
  const { wallet, isLoading: isLoadingWallet } = useWallet();
  const { paymentMethods, isLoading: isLoadingPaymentMethods } = useCompanyPaymentMethods(company?.id);
  const { subscribeAsync: subscribeToPlan, isLoading: isSubscribing } = useSubscribeToPlan();
  const { checkoutAsync: checkoutCreditPackage, isLoading: isCheckingOut } = useCheckoutCreditPackage();

  // Estados de selección
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [companyEmail, setCompanyEmail] = useState("");
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Determinar qué se está comprando
  const selectedPlanData = plans.find((p) => p.planType === selectedPlan);
  const selectedPackageData = creditPackages.find((p) => p.id === selectedPackage);
  const totalPrice = selectedPlanData?.monthlyPrice ?? selectedPackageData?.price ?? 0;

  const handleSubscribe = async () => {
    if (!selectedPlan || !companyEmail) return;
    setSubscribeError(null);
    try {
      const initPoint = await subscribeToPlan({ plan: selectedPlan, companyEmail });
      if (initPoint) {
        window.open(initPoint, "_blank");
      }
      setShowSubscribeModal(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setSubscribeError(err?.message || "Error al suscribirse al plan");
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    if (!companyEmail.trim()) {
      setSubscribeError("Ingresa el correo de facturación para continuar");
      return;
    }
    setSubscribeError(null);
    try {
      // Compra del paquete con el checkout del proveedor configurado.
      const initPoint = await checkoutCreditPackage({
        packageId: selectedPackage,
        clientEmail: companyEmail.trim(),
      });
      if (initPoint) {
        window.open(initPoint, "_blank");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setSubscribeError(err?.message || "Error al iniciar la compra del paquete");
    }
  };

  const isLoading = isLoadingPlans || isLoadingCreditPackages || isLoadingCurrentPlan || isLoadingOverview || isLoadingWallet;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
          Planes y Paquetes de Créditos
        </h1>
        <p className="text-[#64748B]">
          Elige un plan mensual con créditos incluidos o compra paquetes individuales y paga solo por lo que usas
        </p>
      </div>

      {/* Current Balance / Overview */}
      <div className="bg-gradient-to-br from-[#1B3A6B] to-[#0EA5A0] text-white p-8 rounded-2xl shadow-sm">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-white/80">Cargando información...</span>
          </div>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/80 mb-2">Balance Actual</p>
              <h2 className="text-4xl font-bold">
                {wallet ? `${wallet.currency === "PEN" ? "S/" : "$"}${wallet.balance}` : "—"}
              </h2>
              <p className="text-white/80 mt-2">
                {overview?.canPublishMoreProjects
                  ? `${overview.remainingFreeProjects} publicaciones gratuitas restantes`
                  : "Actualiza tu plan para publicar más proyectos"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/80 mb-2">Plan Actual</p>
              <h3 className="text-3xl font-bold">
                {currentPlan?.planType === "PREMIUM" ? "Premium" :
                 currentPlan?.planType === "ENTERPRISE" ? "Enterprise" : "Gratuito"}
              </h3>
              <p className="text-white/80 mt-2">
                {overview?.publishedProjectsCount ?? 0} proyectos publicados
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Credit Packages - desde backend */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Paquetes de Créditos</h2>
          <p className="text-[#64748B]">
            ¿No quieres un plan mensual? Compra paquetes de créditos y paga solo por lo que usas
          </p>
        </div>
        {isLoadingCreditPackages ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-8">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando paquetes de créditos...
          </div>
        ) : creditPackages.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No hay paquetes de créditos disponibles</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creditPackages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => {
                  setSelectedPackage(pkg.id);
                  setSelectedPlan(null);
                }}
                className={`bg-white rounded-2xl border-2 p-6 text-left transition-all hover:shadow-md ${
                  selectedPackage === pkg.id
                    ? "border-[#0EA5A0] shadow-lg"
                    : "border-gray-200 hover:border-gray-300"
                } ${pkg.isPopular ? "relative" : ""}`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#0EA5A0] text-white text-xs font-semibold">
                      Más Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-[#0F172A] mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-bold text-[#1B3A6B] mb-1">
                    {pkg.credits}
                  </div>
                  <p className="text-sm text-[#64748B]">créditos</p>
                </div>
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <p className="text-3xl font-bold text-[#0F172A] text-center mb-1">
                    S/. {pkg.price}
                  </p>
                  <p className="text-sm text-[#64748B] text-center">
                    S/. {pkg.pricePerCredit.toFixed(2)} por crédito
                  </p>
                </div>
                {pkg.savingsPercentage > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-4">
                    <p className="text-xs text-green-800 text-center font-semibold">
                      Ahorra {pkg.savingsPercentage}%
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-center">
                  {selectedPackage === pkg.id ? (
                    <div className="w-6 h-6 bg-[#0EA5A0] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-200 rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Monthly Plans - desde backend */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Planes Mensuales</h2>
          <p className="text-[#64748B]">
            Elige un plan con créditos mensuales incluidos y beneficios exclusivos
          </p>
        </div>
        {isLoadingPlans ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-8">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando planes...
          </div>
        ) : plans.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No hay planes disponibles</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.filter((p) => p.isActive).map((plan) => (
              <button
                key={plan.planType}
                onClick={() => {
                  setSelectedPlan(plan.planType);
                  setSelectedPackage(null);
                }}
                className={`bg-white rounded-2xl border-2 p-6 text-left transition-all hover:shadow-md ${
                  selectedPlan === plan.planType
                    ? "border-[#0EA5A0] shadow-lg"
                    : "border-gray-200 hover:border-gray-300"
                } ${plan.isPopular ? "relative" : ""}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#0EA5A0] text-white text-xs font-semibold">
                      Recomendado
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-[#0F172A] mb-2">{plan.displayName}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    {plan.monthlyPrice === 0 ? (
                      <span className="text-4xl font-bold text-[#10B981]">Gratis</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-[#1B3A6B]">S/. {plan.monthlyPrice}</span>
                        <span className="text-[#64748B]">/mes</span>
                      </>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-xs text-[#64748B] mb-4">{plan.description}</p>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {(plan.benefits ?? []).map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-[#0EA5A0] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#64748B]">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-center">
                  {selectedPlan === plan.planType ? (
                    <div className="w-6 h-6 bg-[#0EA5A0] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-200 rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Payment Method Selection */}
      {(selectedPlan || selectedPackage) && (
        <section>
          <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Método de Pago</h2>
          {isLoadingPaymentMethods ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando métodos de pago...
            </div>
          ) : paymentMethods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`bg-white rounded-2xl border-2 p-6 text-left transition-all hover:shadow-md ${
                    selectedPaymentMethod === method.id
                      ? "border-[#0EA5A0] shadow-lg"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[#EBF0F7] text-[#1B3A6B] rounded-lg">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-[#0F172A] block">
                          {method.last4 ? `${method.brand} •••• ${method.last4}` : method.brand}
                        </span>
                        <span className="text-xs text-[#64748B]">
                          {method.expMonth && method.expYear
                            ? `Expira ${method.expMonth}/${method.expYear}`
                            : method.detail}
                        </span>
                      </div>
                    </div>
                    {selectedPaymentMethod === method.id && (
                      <div className="w-6 h-6 bg-[#0EA5A0] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">No hay métodos de pago registrados</p>
              <p className="text-xs text-gray-400 mb-4">Debes registrar un método de pago antes de continuar</p>
              <button
                onClick={() => router.push("/company/payments")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B3A6B] text-white text-sm font-semibold hover:bg-[#0EA5A0] transition-colors shadow-sm"
              >
                <ArrowRight className="w-4 h-4" />
                Ir a Pagos
              </button>
            </div>
          )}
        </section>
      )}

      {/* Summary and Purchase */}
      {((selectedPlan || selectedPackage) && selectedPaymentMethod) && (
        <div className="bg-gradient-to-br from-[#1B3A6B] to-[#0EA5A0] text-white p-8 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">Resumen de Compra</h3>
              <p className="text-white/80">
                {selectedPlanData
                  ? `Plan ${selectedPlanData.displayName} - Mensual`
                  : selectedPackageData
                    ? `${selectedPackageData.name} - ${selectedPackageData.credits} créditos`
                    : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/80 mb-1">Total a Pagar</p>
              <p className="text-4xl font-bold">
                S/. {totalPrice}
              </p>
            </div>
          </div>

          {/* Correo de facturación para la compra de paquetes */}
          {selectedPackage && !selectedPlan && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white mb-1.5">
                Correo de facturación
              </label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="facturacion@empresa.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              {subscribeError && (
                <p className="mt-2 text-xs text-red-200">{subscribeError}</p>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => {
                setSelectedPlan(null);
                setSelectedPackage(null);
                setSelectedPaymentMethod(null);
              }}
              className="flex-1 px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={selectedPlan ? () => setShowSubscribeModal(true) : handlePurchase}
              disabled={isSubscribing || isCheckingOut}
              className="flex-1 px-6 py-3 rounded-xl bg-white text-[#1B3A6B] hover:bg-gray-100 font-semibold transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubscribing || isCheckingOut ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <TrendingUp className="w-5 h-5" />
              )}
              {selectedPlan
                ? "Suscribirse"
                : isCheckingOut
                  ? "Procesando..."
                  : "Pagar con Culqi"}
            </button>
          </div>
        </div>
      )}

      {/* Current Plan Info */}
      {currentPlan && currentPlan.planType !== "BASIC" && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-5 h-5 text-[#1B3A6B]" />
            <h3 className="font-bold text-[#0F172A]">Plan Actual: {currentPlan.planType}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-xs text-[#64748B]">Estado</p>
              <p className="text-sm font-semibold text-[#0F172A]">{currentPlan.status}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Inicio</p>
              <p className="text-sm font-semibold text-[#0F172A]">
                {currentPlan.startDate ? new Date(currentPlan.startDate).toLocaleDateString() : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Fin</p>
              <p className="text-sm font-semibold text-[#0F172A]">
                {currentPlan.endDate ? new Date(currentPlan.endDate).toLocaleDateString() : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Proyectos</p>
              <p className="text-sm font-semibold text-[#0F172A]">
                {overview?.publishedProjectsCount ?? 0} publicados
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="font-bold text-[#0F172A] mb-3">ℹ️ Información sobre Créditos y Planes</h3>
        <ul className="space-y-2 text-sm text-[#64748B]">
          <li>• <strong>Paquetes de Créditos:</strong> Paga solo por lo que usas, sin compromiso mensual</li>
          <li>• <strong>Planes Mensuales:</strong> Créditos recurrentes con beneficios adicionales (soporte, reportes, agentes IA)</li>
          <li>• 1 Crédito = 1 Publicación de Vacante (válida por 30 días)</li>
          <li>• Los proyectos Freelance no consumen créditos (solo comisión del 3-5%)</li>
          <li>• Los créditos de paquetes no expiran y se acumulan</li>
          <li>• Los planes mensuales se renuevan automáticamente cada mes</li>
        </ul>
      </div>

      {/* Modal Suscripción */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1B3A6B]">Confirmar Suscripción</h3>
              <button onClick={() => { setShowSubscribeModal(false); setSubscribeError(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-sm font-semibold text-gray-700">Plan seleccionado:</p>
                <p className="text-lg font-bold text-[#1B3A6B]">
                  {selectedPlanData?.displayName || selectedPlan}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  S/. {selectedPlanData?.monthlyPrice ?? 0}/mes
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Correo de facturación
                </label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0]"
                  placeholder="facturacion@empresa.com"
                />
              </div>
              {subscribeError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600">{subscribeError}</p>
                </div>
              )}
              <button
                onClick={handleSubscribe}
                disabled={isSubscribing || !companyEmail}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-sm font-semibold hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
              >
                {isSubscribing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                {isSubscribing ? "Procesando..." : "Ir a Pagar"}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Seras redirigido al checkout de pago para completar la operacion
              </p>
            </div>
          </div>
        </div>
      )}

      {saved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">Operación realizada correctamente</span>
        </div>
      )}
    </div>
  );
}
