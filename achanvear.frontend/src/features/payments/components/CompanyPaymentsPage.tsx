// features/payments/components/CompanyPaymentsPage.tsx
"use client";

import { useState } from "react";
import { AddPaymentMethodModal } from "./AddPaymentMethodModal";
import {
  useLocalPaymentMethods,
  useRemoveLocalMethod,
  useSetDefaultLocalMethod,
  useSavedCards,
  useRemoveSavedCard,
  useSetDefaultSavedCard,
} from "../hooks/usePayments";
import {
  Wallet,
  Lock,
  Receipt,
  Info,
  MoreHorizontal,
  CreditCard,
  Plus,
  Trash2,
  Star,
  FileText,
  ShieldCheck,
  Landmark,
  Building2,
} from "lucide-react";

type PaymentMethodView = {
  id: string;
  kind: "CARD" | "LOCAL";
  type: string;
  label: string;
  detail: string;
  isPrimary: boolean;
  lastFourDigits?: string | null;
  cardholderName?: string | null;
  expirationDate?: string | null;
  issuerName?: string | null;
  paymentType?: string | null;
};

const bankThemes = [
  { match: ["BCP", "BANCO DE CREDITO", "BANCO DE CRÉDITO"], name: "BCP", bg: "from-[#004b8d] via-[#0066b3] to-[#f58220]", chip: "bg-orange-100/90" },
  { match: ["BBVA"], name: "BBVA", bg: "from-[#001b5f] via-[#004c99] to-[#00a3e0]", chip: "bg-sky-100/90" },
  { match: ["INTERBANK"], name: "Interbank", bg: "from-[#003d2b] via-[#00a859] to-[#7ac143]", chip: "bg-emerald-100/90" },
  { match: ["SCOTIA", "SCOTIABANK"], name: "Scotiabank", bg: "from-[#8a0014] via-[#e30613] to-[#ff6b6b]", chip: "bg-red-100/90" },
  { match: ["NACION", "NACIÓN", "BANCO DE LA NACION", "BANCO DE LA NACIÓN"], name: "Banco de la Nacion", bg: "from-[#5b0013] via-[#a0062d] to-[#d6a03d]", chip: "bg-amber-100/90" },
];

function getBankTheme(method: PaymentMethodView) {
  const source = `${method.issuerName ?? ""} ${method.label ?? ""} ${method.paymentType ?? ""}`.toUpperCase();
  return bankThemes.find((theme) => theme.match.some((term) => source.includes(term))) ?? {
    name: method.issuerName || method.paymentType || "Visa",
    bg: "from-[#003b80] via-[#0066b3] to-[#0ea5a0]",
    chip: "bg-slate-100/90",
  };
}

function formatCardNumber(lastFour?: string | null) {
  return `4000  1234  5678  ${lastFour || "****"}`;
}

function MethodMenu({
  open,
  onToggle,
  onSetDefault,
  onRemove,
  showDefault,
  isSettingDefault,
  isRemoving,
  light = false,
}: {
  open: boolean;
  onToggle: () => void;
  onSetDefault: () => void;
  onRemove: () => void;
  showDefault: boolean;
  isSettingDefault: boolean;
  isRemoving: boolean;
  light?: boolean;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
          light ? "bg-white/15 text-white hover:bg-white/25" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        }`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-slate-100 bg-white py-1 shadow-xl">
            {showDefault && (
              <button
                disabled={isSettingDefault}
                onClick={onSetDefault}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                <Star className="h-4 w-4 text-amber-400" />
                Establecer principal
              </button>
            )}
            <button
              disabled={isRemoving}
              onClick={onRemove}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar metodo
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function PaymentCardPreview({
  method,
  open,
  onToggleMenu,
  onSetDefault,
  onRemove,
  isSettingDefault,
  isRemoving,
}: {
  method: PaymentMethodView;
  open: boolean;
  onToggleMenu: () => void;
  onSetDefault: () => void;
  onRemove: () => void;
  isSettingDefault: boolean;
  isRemoving: boolean;
}) {
  const theme = getBankTheme(method);

  if (method.kind !== "CARD") {
    return (
      <div className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              {method.type === "YAPE" || method.type === "PLIN" ? <Wallet className="h-5 w-5" /> : <Landmark className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{method.label}</p>
              <p className="truncate text-xs text-slate-500">{method.detail}</p>
              {method.isPrimary && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  <Star className="h-3 w-3" /> Principal
                </span>
              )}
            </div>
          </div>
          <MethodMenu open={open} onToggle={onToggleMenu} onSetDefault={onSetDefault} onRemove={onRemove} showDefault={!method.isPrimary} isSettingDefault={isSettingDefault} isRemoving={isRemoving} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`relative aspect-[1.586/1] overflow-hidden rounded-xl bg-gradient-to-br ${theme.bg} p-5 text-white shadow-lg shadow-slate-200`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-1/2 top-0 h-full w-1/2 bg-white/20" />
          <div className="absolute bottom-0 left-0 h-1/3 w-full bg-black/15" />
          <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        </div>
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xl font-semibold tracking-wide">Visa Empresarial</p>
              <p className="mt-1 text-xs text-white/75">{theme.name}</p>
            </div>
            {method.isPrimary && <span className="rounded-full bg-white/18 px-2.5 py-1 text-[11px] font-medium backdrop-blur">Principal</span>}
          </div>
          <div className="space-y-3">
            <div className={`h-9 w-11 rounded-md ${theme.chip} shadow-inner`}>
              <div className="grid h-full grid-cols-2 grid-rows-2 gap-px p-1">
                <span className="rounded-sm bg-slate-300/80" />
                <span className="rounded-sm bg-slate-400/70" />
                <span className="rounded-sm bg-slate-400/70" />
                <span className="rounded-sm bg-slate-300/80" />
              </div>
            </div>
            <p className="font-mono text-lg tracking-[0.14em] text-white drop-shadow-sm">{formatCardNumber(method.lastFourDigits)}</p>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/65">Titular</p>
              <p className="truncate font-mono text-sm uppercase tracking-[0.14em]">{method.cardholderName || "Empresa"}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/65">Vence</p>
              <p className="font-mono text-sm tracking-[0.12em]">{method.expirationDate || "--/--"}</p>
            </div>
            <p className="text-2xl font-black italic tracking-tight">VISA</p>
          </div>
        </div>
      </div>
      <div className="absolute right-3 top-3">
        <MethodMenu open={open} onToggle={onToggleMenu} onSetDefault={onSetDefault} onRemove={onRemove} showDefault={!method.isPrimary} isSettingDefault={isSettingDefault} isRemoving={isRemoving} light />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint: string;
  tone: "blue" | "amber" | "slate";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">{hint}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

export function CompanyPaymentsPage() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const { methods: localPaymentMethods, isLoading: isLoadingMethods, refetch: refetchMethods } = useLocalPaymentMethods();
  const { removeAsync, isLoading: isRemovingMethod } = useRemoveLocalMethod();
  const { setDefaultAsync, isLoading: isSettingDefault } = useSetDefaultLocalMethod();
  const { cards: savedCards, isLoading: isLoadingCards, refetch: refetchCards } = useSavedCards();
  const { removeAsync: removeCardAsync } = useRemoveSavedCard();
  const { setDefaultAsync: setDefaultCardAsync } = useSetDefaultSavedCard();

  const paymentMethods: PaymentMethodView[] = [
    ...savedCards.map((card) => ({
      id: card.id,
      kind: "CARD" as const,
      type: "CARD",
      label: `Tarjeta ${card.issuerName ? card.issuerName.toUpperCase() : card.paymentType}`,
      detail: `**** **** **** ${card.lastFourDigits ?? "****"}${card.expirationDate ? ` · Vence ${card.expirationDate}` : ""}`,
      isPrimary: card.isDefault,
      lastFourDigits: card.lastFourDigits,
      cardholderName: card.cardholderName,
      expirationDate: card.expirationDate,
      issuerName: card.issuerName,
      paymentType: card.paymentType,
    })),
    ...localPaymentMethods.map((method) => ({
      id: method.id,
      kind: method.type === "CARD" ? ("CARD" as const) : ("LOCAL" as const),
      type: method.type,
      label: method.label,
      detail: method.detail,
      isPrimary: method.isPrimary,
      paymentType: method.type,
    })),
  ];

  const isLoadingAllMethods = isLoadingMethods || isLoadingCards;

  const refetchAllMethods = async () => {
    await refetchMethods();
    await refetchCards();
  };

  const handleRemoveMethod = async (id: string, kind: "CARD" | "LOCAL") => {
    if (!window.confirm("Estas seguro de eliminar este metodo de pago?")) return;
    if (kind === "CARD") await removeCardAsync(id);
    else await removeAsync(id);
    await refetchAllMethods();
    setOpenMenuId(null);
  };

  const handleSetDefaultMethod = async (id: string, kind: "CARD" | "LOCAL") => {
    if (kind === "CARD") await setDefaultCardAsync(id);
    else await setDefaultAsync(id);
    await refetchAllMethods();
    setOpenMenuId(null);
  };

  return (
    <div className="min-h-full bg-[#f5f7fb] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Finanzas de empresa
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Gestion financiera</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Controla metodos de pago, fondos retenidos y facturacion desde una vista operativa.
              </p>
            </div>
            <button onClick={() => setShowAddMethodModal(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
              <Plus className="h-4 w-4" />
              Agregar metodo
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <MetricCard icon={Wallet} label="Creditos disponibles" value="S/ 0.00" hint="Saldo operativo" tone="blue" />
          <MetricCard icon={Lock} label="Fondos retenidos" value="S/ 0.00" hint="0 proyectos en escrow" tone="amber" />
          <MetricCard icon={Receipt} label="Comisiones pagadas" value="S/ 0.00" hint="Mes actual" tone="slate" />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Metodos de pago</h2>
                <p className="mt-1 text-sm text-slate-500">Tarjetas y cuentas disponibles para operaciones de empresa.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {paymentMethods.length} registrados
              </span>
            </div>

            {isLoadingAllMethods ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[0, 1].map((item) => <div key={item} className="aspect-[1.586/1] animate-pulse rounded-xl bg-slate-100" />)}
              </div>
            ) : paymentMethods.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {paymentMethods.map((method) => (
                  <PaymentCardPreview
                    key={method.id}
                    method={method}
                    open={openMenuId === method.id}
                    onToggleMenu={() => setOpenMenuId(openMenuId === method.id ? null : method.id)}
                    onSetDefault={() => handleSetDefaultMethod(method.id, method.kind)}
                    onRemove={() => handleRemoveMethod(method.id, method.kind)}
                    isSettingDefault={isSettingDefault}
                    isRemoving={isRemovingMethod}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
                <CreditCard className="mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">Aun no hay metodos de pago</p>
                <p className="mt-1 max-w-sm text-xs text-slate-500">Agrega una tarjeta con Culqi o un metodo local para futuras operaciones.</p>
                <button onClick={() => setShowAddMethodModal(true)} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                  <Plus className="h-4 w-4" />
                  Agregar metodo
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-950">Escrow freelance</h2>
                  <p className="mt-1 text-sm text-slate-500">Fondos retenidos hasta aprobar entregables.</p>
                </div>
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <p className="text-sm leading-relaxed text-blue-700">
                    Cuando contratas un freelancer, el presupuesto queda retenido y se libera cuando apruebas el proyecto.
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-lg bg-slate-50 p-5 text-center">
                <p className="text-sm font-medium text-slate-600">No hay proyectos en escrow</p>
                <p className="mt-1 text-xs text-slate-400">Apareceran cuando contrates freelancers.</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-950">Facturacion</h2>
                  <p className="mt-1 text-sm text-slate-500">Historial de comisiones y comprobantes.</p>
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">Comisiones del Agente IA</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Achanvear cobra entre 3% y 5% sobre proyectos freelance completados. Las vacantes tradicionales tienen un costo fijo.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-lg border border-dashed border-slate-200 p-4">
                <Building2 className="h-5 w-5 text-slate-300" />
                <div>
                  <p className="text-sm font-medium text-slate-600">Sin facturas registradas</p>
                  <p className="text-xs text-slate-400">Las facturas apareceran cuando realices pagos.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <AddPaymentMethodModal
        open={showAddMethodModal}
        onClose={() => setShowAddMethodModal(false)}
        onSuccess={() => {
          refetchAllMethods();
          setShowAddMethodModal(false);
        }}
      />
    </div>
  );
}
