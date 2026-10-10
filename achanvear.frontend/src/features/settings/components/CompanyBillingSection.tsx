// features/settings/components/CompanyBillingSection.tsx
"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Check,
  CreditCard,
  Crown,
  Loader2,
  Mail,
  Package,
  Plus,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import {
  useAvailablePlans,
  useCheckoutCreditPackage,
  useCreditPackages,
  useCurrentPlan,
  usePaymentsOverview,
  useSubscribeToPlan,
  useWallet,
} from "../hooks/useCompanySettings";
import {
  useLocalPaymentMethods,
  useSavedCards,
} from "@/features/payments/hooks/usePayments";
import { CulqiCardForm } from "@/features/payments/components/CulqiCardForm";
import type { CreditPackage, PlanOption } from "../types/company-settings.types";

const FREE_JOB_LIMIT = 2;

function formatMoney(value?: number | null) {
  return `S/ ${(value ?? 0).toFixed(2)}`;
}

function planAccent(planType: string) {
  switch (planType) {
    case "FREE":
      return {
        icon: Briefcase,
        ring: "border-slate-200",
        badge: "bg-slate-100 text-slate-600",
        button: "bg-slate-100 text-slate-500",
        glow: "from-slate-100 to-white",
      };
    case "BASIC":
      return {
        icon: Rocket,
        ring: "border-blue-200",
        badge: "bg-blue-50 text-blue-700",
        button: "bg-slate-950 text-white hover:bg-slate-800",
        glow: "from-blue-50 to-white",
      };
    case "PREMIUM":
      return {
        icon: Crown,
        ring: "border-emerald-300",
        badge: "bg-emerald-50 text-emerald-700",
        button: "bg-emerald-600 text-white hover:bg-emerald-700",
        glow: "from-emerald-50 to-white",
      };
    default:
      return {
        icon: ShieldCheck,
        ring: "border-indigo-200",
        badge: "bg-indigo-50 text-indigo-700",
        button: "bg-indigo-700 text-white hover:bg-indigo-800",
        glow: "from-indigo-50 to-white",
      };
  }
}

function PlanCard({
  plan,
  isCurrent,
  selected,
  locked,
  onSelect,
}: {
  plan: PlanOption;
  isCurrent: boolean;
  selected: boolean;
  locked?: boolean;
  onSelect: () => void;
}) {
  const accent = planAccent(plan.planType);
  const Icon = accent.icon;
  const isFree = plan.planType === "FREE";
  const publicationLimit = isFree ? FREE_JOB_LIMIT : plan.maxProjects;
  const publicationLabel = plan.maxProjects >= 999999 ? "Ilimitadas" : publicationLimit.toLocaleString("es-PE");

  // El plan gratuito queda bloqueado para siempre una vez que la empresa
  // se suscribe a un plan de pago: no se puede volver a FREE.
  const isLocked = Boolean(locked) && isFree;
  const isDisabled = isFree;

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onSelect}
      disabled={isDisabled}
      aria-current={isCurrent ? "true" : undefined}
      title={
        isLocked
          ? "Plan ya utilizado. Una vez que cambias a un plan de pago no puedes volver al plan Gratis."
          : undefined
      }
      className={`relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border bg-white p-4 text-left shadow-sm transition ${
        isCurrent
          ? "border-emerald-500 ring-2 ring-emerald-400/60 shadow-lg"
          : selected
            ? "border-emerald-400 shadow-md"
            : accent.ring
      } ${
        isLocked
          ? "cursor-not-allowed opacity-80 grayscale"
          : isDisabled
            ? "cursor-default opacity-95"
            : "hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${accent.glow}`} />

      {/* Sello de plan bloqueado (una vez usado, no se puede volver) */}
      {isLocked && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <span className="-rotate-[18deg] rounded-md border-[3px] border-red-500/70 bg-white/70 px-4 py-1.5 text-sm font-black uppercase tracking-[0.2em] text-red-600/90 shadow-sm backdrop-blur-[1px]">
            Ya usado
          </span>
        </div>
      )}

      <div className="relative flex flex-1 flex-col">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent.badge}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {isCurrent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                <BadgeCheck className="h-3 w-3" />
                Plan actual
              </span>
            )}
            {plan.isPopular && !isCurrent && (
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                Recomendado
              </span>
            )}
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-950">{plan.displayName}</h3>
        <p className="mt-1 line-clamp-2 min-h-[36px] text-xs leading-relaxed text-slate-500">{plan.description}</p>

        {/* RESPONSIVE: precio y caja "Empleos" en una grilla de dos columnas
            dejaban al precio ~75px cuando la caja decía "Ilimitadas" ("S/ 299"
            se partía). Con flex-wrap, si no caben juntos la caja baja a su
            propia línea. */}
        <div className="my-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-3">
          <div>
            {isFree ? (
              <p className="text-2xl font-bold text-emerald-600">Gratis</p>
            ) : (
              <div className="flex items-end gap-1 whitespace-nowrap">
                <p className="text-2xl font-bold text-slate-950">S/ {plan.monthlyPrice}</p>
                <p className="pb-0.5 text-xs text-slate-500">/mes</p>
              </div>
            )}
            <p className="mt-1 text-[11px] text-slate-400">Pago mensual</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-[#F7FAFC] px-3 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Empleos</p>
            <p className="text-lg font-bold text-[#1B3A6B]">{publicationLabel}</p>
          </div>
        </div>

        <ul className="mb-4 flex-1 space-y-1.5">
          {(plan.benefits ?? []).slice(0, 3).map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-xs text-slate-600">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>{benefit}</span>
            </li>
          ))}
          {!isFree && (
            <li className="flex items-start gap-2 text-xs text-slate-600">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>{plan.maxInvitesPerProject} invitaciones directas por proyecto</span>
            </li>
          )}
        </ul>

        <div className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${accent.button}`}>
          {isCurrent ? (
            <>
              <BadgeCheck className="h-4 w-4" />
              Plan activo
            </>
          ) : isLocked ? (
            "Ya no disponible"
          ) : isFree ? (
            "Incluido al registrarte"
          ) : selected ? (
            "Seleccionado"
          ) : (
            "Elegir plan"
          )}
        </div>
      </div>
    </button>
  );
}

function PackageCard({
  pkg,
  selected,
  onSelect,
}: {
  pkg: CreditPackage;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex h-full min-w-0 flex-col rounded-xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        selected ? "border-[#1B3A6B] shadow-md ring-2 ring-blue-100" : "border-slate-200"
      }`}
    >
      {pkg.isPopular && (
        <span className="absolute right-3 top-3 rounded-full bg-[#1B3A6B] px-2.5 py-1 text-[10px] font-semibold text-white">
          Popular
        </span>
      )}
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#1B3A6B]">
        <Briefcase className="h-4 w-4" />
      </div>
      <h3 className="text-base font-bold text-slate-950">{pkg.name}</h3>
      <p className="mt-1 line-clamp-2 min-h-[34px] text-xs leading-relaxed text-slate-500">{pkg.description}</p>

      <div className="my-4 rounded-lg border border-slate-100 bg-[#F7FAFC] p-3">
        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
          <div>
            <p className="text-3xl font-bold text-[#1B3A6B]">{pkg.credits}</p>
            <p className="text-xs font-medium text-slate-500">empleos</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-slate-950">S/ {pkg.price}</p>
            <p className="text-xs text-slate-500">S/ {pkg.pricePerCredit.toFixed(2)} por empleo</p>
          </div>
        </div>
      </div>

      {pkg.savingsPercentage > 0 && (
        <div className="mb-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700">
          Ahorra {pkg.savingsPercentage}% frente al precio base
        </div>
      )}

      <div className={`mt-auto flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold ${
        selected ? "bg-[#1B3A6B] text-white" : "bg-slate-100 text-slate-700"
      }`}>
        {selected ? "Paquete seleccionado" : "Comprar paquete"}
      </div>
    </button>
  );
}

export function CompanyBillingSection() {
  const { plans, isLoading: isLoadingPlans } = useAvailablePlans();
  const { creditPackages, isLoading: isLoadingCreditPackages } = useCreditPackages();
  const { currentPlan, isLoading: isLoadingCurrentPlan } = useCurrentPlan();
  const { overview, isLoading: isLoadingOverview } = usePaymentsOverview();
  const { wallet, isLoading: isLoadingWallet } = useWallet();
  const { subscribeAsync: subscribeToPlan, isLoading: isSubscribing } = useSubscribeToPlan();
  const { checkoutAsync: checkoutCreditPackage, isLoading: isCheckingOut } = useCheckoutCreditPackage();
  const { cards: savedCards, isLoading: isLoadingCards } = useSavedCards();
  const { methods: localMethods, isLoading: isLoadingLocalMethods } = useLocalPaymentMethods();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [billingEmail, setBillingEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Método de pago elegido en la ficha: "SAVED_<id>" = método guardado, "NEW" = tokenizar con Culqi
  const [payMethod, setPayMethod] = useState<string>("NEW");
  const [showNewMethod, setShowNewMethod] = useState(false);
  // Checkout de suscripción (Culqi): se abre al confirmar el pago de un plan con tarjeta nueva
  const [showPlanCharge, setShowPlanCharge] = useState(false);

  const activePlans = useMemo(() => plans.filter((plan) => plan.isActive), [plans]);
  const activePackages = useMemo(() => creditPackages.filter((pkg) => pkg.isActive), [creditPackages]);
  const selectedPlanData = activePlans.find((plan) => plan.planType === selectedPlan) ?? null;
  const selectedPackageData = activePackages.find((pkg) => pkg.id === selectedPackage) ?? null;

  const isLoading = isLoadingPlans || isLoadingCreditPackages || isLoadingCurrentPlan || isLoadingOverview || isLoadingWallet;
  const published = overview?.publishedProjectsCount ?? 0;
  const remaining = overview?.remainingFreeProjects ?? Math.max(0, FREE_JOB_LIMIT - published);
  const currentPlanType = currentPlan?.planType ?? overview?.currentPlan ?? "FREE";

  const handleChoosePlan = (planType: string) => {
    setSelectedPlan(planType);
    setSelectedPackage(null);
    setError(null);
  };

  const handleChoosePackage = (packageId: string) => {
    setSelectedPackage(packageId);
    setSelectedPlan(null);
    setError(null);
  };

  // Métodos guardados (tarjetas Culqi + billeteras Yape/Plin) disponibles para pagar la selección.
  const savedMethods = useMemo(
    () => [
      ...savedCards.map((card) => ({
        id: `SAVED_${card.id}`,
        kind: "CARD" as const,
        label: card.issuerName || card.paymentType || "Tarjeta",
        detail: card.lastFourDigits ? `•••• ${card.lastFourDigits}` : "Tarjeta guardada",
        isDefault: card.isDefault,
      })),
      ...localMethods.map((method) => ({
        id: `SAVED_${method.id}`,
        kind: "LOCAL" as const,
        label: method.label,
        detail: method.detail,
        isDefault: method.isPrimary,
      })),
    ],
    [savedCards, localMethods]
  );

  const isLoadingMethods = isLoadingCards || isLoadingLocalMethods;
  const isNewMethod = payMethod === "NEW";
  const selectedSavedMethod = savedMethods.find((method) => method.id === payMethod) ?? null;

  const payMethodLabel = isNewMethod
    ? "Nuevo método (Culqi)"
    : selectedSavedMethod
      ? `${selectedSavedMethod.label} ${selectedSavedMethod.detail}`
      : "Elige un método";

  const handleCheckout = async () => {
    if (!billingEmail.trim()) {
      setError("Ingresa un correo de facturacion para continuar.");
      return;
    }

    setError(null);

    // Suscripción a un plan: requiere tokenizar la tarjeta con Culqi
    if (selectedPlanData) {
      setShowPlanCharge(true);
      return;
    }

    try {
      const initPoint = selectedPackageData
        ? await checkoutCreditPackage({ packageId: selectedPackageData.id, clientEmail: billingEmail.trim() })
        : null;

      if (!initPoint) {
        throw new Error("No se recibio la URL de checkout. Intenta nuevamente en unos minutos.");
      }

      window.location.href = initPoint;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar el pago.");
    }
  };

  // Culqi tokeniza la tarjeta de la suscripción y aquí cobramos el plan
  const handlePlanTokenized = async ({ token, email }: { token: string; email: string }) => {
    if (!selectedPlanData) return;
    setError(null);
    try {
      await subscribeToPlan({
        plan: selectedPlanData.planType,
        companyEmail: email || billingEmail.trim(),
        token,
      });
      setShowPlanCharge(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: any) {
      setError(err?.message || "No se pudo procesar el pago del plan.");
      throw err;
    }
  };

  const selectedLabel = selectedPlanData
    ? `Plan ${selectedPlanData.displayName}`
    : selectedPackageData
      ? selectedPackageData.name
      : "Selecciona un plan o paquete";

  const selectedPrice = selectedPlanData?.monthlyPrice ?? selectedPackageData?.price ?? 0;

  return (
    <div className="space-y-6">
      {showPlanCharge && selectedPlanData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:p-6">
            <h3 className="text-lg font-bold text-slate-950">
              Pago de tu plan {selectedPlanData.displayName}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Se cobrará {formatMoney(selectedPrice)}. El pago se procesa de forma segura con Culqi.
            </p>

            <div className="mt-4">
              <CulqiCardForm
                mode="charge"
                buttonLabel="Pagar suscripción con Culqi"
                submitLabel="Procesando pago..."
                onTokenized={handlePlanTokenized}
                onError={(msg) => setError(msg)}
              />
            </div>

            {error && <p className="mt-3 text-xs font-medium text-red-600">{error}</p>}

            <button
              type="button"
              onClick={() => { setShowPlanCharge(false); setError(null); }}
              className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* RESPONSIVE (causa raíz del contenido cortado): esta grilla y las
          siguientes solo definían columnas desde lg (o md/xl). En celular la
          columna implícita toma el ancho de su contenido más ancho, y textos
          con `truncate` (que no se parten) la hacían más ancha que la pantalla;
          el overflow-hidden de la tarjeta recortaba lo que sobraba. Con
          grid-cols-1 la columna es minmax(0,1fr) y puede encogerse. */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <div className="min-w-0 p-4 sm:p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Planes, publicaciones y beneficios
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Escala tu operacion de contratacion</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              Empiezas gratis con {FREE_JOB_LIMIT} empleos. Cuando necesites publicar mas, compra paquetes de empleos sin mensualidad
              o activa un plan mensual con mas capacidad e invitaciones directas.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Plan actual</p>
                <p className="mt-1 text-lg font-bold text-slate-950">{currentPlanType}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Publicados</p>
                <p className="mt-1 text-lg font-bold text-slate-950">{published}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Gratis restantes</p>
                <p className="mt-1 text-lg font-bold text-slate-950">{remaining}</p>
              </div>
            </div>
          </div>
          <div className="min-w-0 border-t border-slate-200 bg-slate-950 p-4 text-white sm:p-6 lg:border-l lg:border-t-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white/60">Balance operativo</p>
                <p className="text-2xl font-bold">{isLoadingWallet ? "..." : formatMoney(wallet?.balance)}</p>
              </div>
            </div>
            <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold">Regla de uso</p>
              <p className="mt-1 text-sm leading-relaxed text-white/65">
                No es obligatorio pagar al registrarte. El pago se vuelve necesario al superar el limite gratis
                o al querer beneficios como mas empleos, invitaciones y soporte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando planes y paquetes...
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Planes mensuales</h2>
                <p className="text-sm text-slate-500">Activan beneficios recurrentes al completar el pago.</p>
              </div>
              <span className="text-xs font-medium text-slate-400">Pago mensual via checkout</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {activePlans.map((plan) => (
                <PlanCard
                  key={plan.planType}
                  plan={plan}
                  isCurrent={currentPlanType === plan.planType}
                  selected={selectedPlan === plan.planType}
                  locked={plan.planType === "FREE" && currentPlanType !== "FREE"}
                  onSelect={() => handleChoosePlan(plan.planType)}
                />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Paquetes de publicaciones</h2>
                <p className="text-sm text-slate-500">Compra empleos puntuales para publicar sin suscripcion mensual.</p>
              </div>
              <span className="text-xs font-medium text-slate-400">Las publicaciones se activan tras confirmar el pago</span>
            </div>
            {activePackages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                No hay paquetes activos disponibles.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {activePackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    selected={selectedPackage === pkg.id}
                    onSelect={() => handleChoosePackage(pkg.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <section
            className={`overflow-hidden rounded-2xl border shadow-sm transition ${
              selectedPlanData || selectedPackageData
                ? "border-emerald-300 ring-1 ring-emerald-100"
                : "border-slate-200"
            }`}
          >
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
              {/* Resumen de la seleccion */}
              <div className="min-w-0 bg-white p-4 sm:p-6">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedPlanData || selectedPackageData
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {selectedPlanData || selectedPackageData ? (
                    <>
                      <BadgeCheck className="h-3.5 w-3.5" /> Seleccionado
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" /> Selecciona un plan o paquete
                    </>
                  )}
                </span>

                <h2 className="mt-4 text-lg font-bold text-slate-950">Ficha de pago</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Confirma tu seleccion y paga con un metodo guardado o con uno nuevo a traves de Culqi.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">Seleccion</p>
                    <p className="mt-1 truncate text-sm font-bold text-slate-950">{selectedLabel}</p>
                  </div>
                  <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">Total a pagar</p>
                    <p className="mt-1 text-lg font-bold text-[#1B3A6B]">{formatMoney(selectedPrice)}</p>
                  </div>
                </div>

                <div className="mt-4 min-w-0 rounded-lg border border-slate-100 bg-[#F7FAFC] p-4">
                  <p className="text-xs font-medium text-slate-500">Método de pago</p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-950">{payMethodLabel}</p>
                </div>
              </div>

              <div className="min-w-0 border-t border-slate-200 bg-slate-50 p-4 sm:p-6 lg:border-l lg:border-t-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1B3A6B] text-white">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-950">Metodo de pago</p>
                    <p className="text-xs text-slate-500">Elige como quieres pagar</p>
                  </div>
                </div>

                {isLoadingMethods ? (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Cargando metodos de pago...
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    {savedMethods.map((method) => {
                      const active = payMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPayMethod(method.id)}
                          className={`flex w-full items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 text-left transition ${
                            active
                              ? "border-[#0EA5A0] ring-2 ring-[#0EA5A0]/20"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#1B3A6B]">
                              {method.kind === "CARD" ? <CreditCard className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{method.label}</p>
                              <p className="truncate text-xs text-slate-500">{method.detail}</p>
                            </div>
                          </div>
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              active ? "border-[#0EA5A0] bg-[#0EA5A0] text-white" : "border-slate-300"
                            }`}
                          >
                            {active && <Check className="h-3 w-3" />}
                          </span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setPayMethod("NEW");
                        setShowNewMethod(true);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg border bg-white px-4 py-3 text-left transition ${
                        isNewMethod
                          ? "border-[#0EA5A0] ring-2 ring-[#0EA5A0]/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0EA5A0]/10 text-[#0EA5A0]">
                        <Plus className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">Nuevo metodo de pago</p>
                        <p className="text-xs text-slate-500">Tarjeta con Culqi o Yape/Plin</p>
                      </div>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          isNewMethod ? "border-[#0EA5A0] bg-[#0EA5A0] text-white" : "border-slate-300"
                        }`}
                      >
                        {isNewMethod && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  </div>
                )}

                {isNewMethod && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
                    {showNewMethod ? (
                      <CulqiCardForm
                        onSuccess={() => setShowNewMethod(false)}
                        onError={(msg) => setError(msg)}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowNewMethod(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#0EA5A0] px-4 py-2.5 text-center text-sm font-semibold text-[#0EA5A0] transition hover:bg-[#0EA5A0]/5"
                      >
                        <Plus className="h-4 w-4 shrink-0" />
                        Agregar tarjeta con Culqi
                      </button>
                    )}
                  </div>
                )}

                <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    Correo de facturacion
                  </label>
                  <input
                    value={billingEmail}
                    onChange={(event) => setBillingEmail(event.target.value)}
                    type="email"
                    placeholder="facturacion@empresa.com"
                    className="mt-2 w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#0EA5A0] focus:ring-2 focus:ring-[#0EA5A0]/20"
                  />
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Enviaremos la ficha de pago a este correo por Brevo.
                  </p>

                  {error && <p className="mt-2 break-words text-xs font-medium text-red-600">{error}</p>}

                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={(!selectedPlanData && !selectedPackageData) || isSubscribing || isCheckingOut}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1B3A6B] via-[#135e7a] to-[#0EA5A0] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubscribing || isCheckingOut ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4 shrink-0" />
                    )}
                    {isSubscribing || isCheckingOut
                      ? "Preparando checkout..."
                      : !selectedPlanData && !selectedPackageData
                        ? "Selecciona una opcion"
                        : selectedPlanData
                          ? `Pagar ${formatMoney(selectedPrice)} y activar plan`
                          : `Pagar paquete ${formatMoney(selectedPrice)}`}
                  </button>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">
                    Se abrira el checkout seguro. Los beneficios se activan cuando el pago queda confirmado por el proveedor.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {success && (
        <div className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg">
          <BadgeCheck className="h-4 w-4" />
          Checkout iniciado correctamente
        </div>
      )}

      <section className="rounded-xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
        <div className="flex gap-3">
          <Zap className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
          <div className="min-w-0">
            <h3 className="font-bold text-blue-950">Como funciona la version gratis</h3>
            <p className="mt-1 text-sm leading-relaxed text-blue-800">
              Una empresa puede registrarse gratis y usar el plan FREE. Actualmente el backend permite {FREE_JOB_LIMIT}
              empleos gratuitos por 30 dias. Si compra un paquete, cada empleo publicado consume 1 publicacion del saldo.
              Para publicar mas vacantes o activar beneficios avanzados, debe comprar publicaciones o pagar un plan.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}