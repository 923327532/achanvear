// features/settings/components/FinancesSection.tsx
"use client";

import { useState } from "react";
import { AlertCircle, CreditCard, Loader2, Plus, Trash2, Star, Check, MoreHorizontal } from "lucide-react";
import { useUpdateFinances } from "../hooks/useSettings";
import {
  usePayoutMethods,
  useRemovePayoutMethod,
  useSetDefaultPayoutMethod,
  useFreelancerWalletSummary,
} from "@/features/payments/hooks/usePayments";
import { AddPayoutMethodModal } from "@/features/payments/components/AddPayoutMethodModal";
import { ConfirmModal } from "@/shared/components/ui/ConfirmModal";
import type { PreferredCurrency } from "../types/settings.types";
import type { PayoutMethod } from "@/features/payments/types/payments.types";

interface Props {
  profile: any;
}

const cardThemes = [
  { match: ["VISA"], bg: "from-[#003b80] via-[#0066b3] to-[#0ea5a0]", chip: "bg-slate-100/90", brand: "VISA" },
  { match: ["MASTERCARD"], bg: "from-[#151515] via-[#313131] to-[#d97706]", chip: "bg-amber-100/90", brand: "MC" },
  { match: ["AMEX", "AMERICAN"], bg: "from-[#0f766e] via-[#0891b2] to-[#67e8f9]", chip: "bg-cyan-100/90", brand: "AMEX" },
];

const neutralTheme = { bg: "from-slate-700 via-slate-800 to-slate-900", chip: "bg-slate-100/90", brand: "" };

function getCardTheme(method: PayoutMethod) {
  const source = `${method.cardBrand ?? ""} ${method.maskedCard ?? ""}`.toUpperCase();
  return cardThemes.find((theme) => theme.match.some((term) => source.includes(term))) ?? neutralTheme;
}

function currencySymbol(currency?: string) {
  if (!currency || currency === "PEN") return "S/";
  if (currency === "USD") return "US$";
  return currency;
}

function money(amount: number, currency?: string) {
  const value = Number(amount ?? 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${currencySymbol(currency)} ${value}`;
}

function formatPaymentDate(date: string | null) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
}

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

function PayoutCard({
  method,
  menuOpen,
  onToggleMenu,
  onSetDefault,
  onRemove,
}: {
  method: PayoutMethod;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onSetDefault: () => void;
  onRemove: () => void;
}) {
  const theme = getCardTheme(method);
  const cardNumber = method.maskedCard?.trim()
    ? method.maskedCard
    : `•••• •••• •••• ${method.lastFourDigits || "••••"}`;

  return (
    <div className="relative min-w-0">
      {/* RESPONSIVE: min-h-[11.5rem]. Con overflow-hidden la proporción 1.586:1 no deja crecer la tarjeta,
          y a 284px (~147px de alto) el contenido se recortaba. */}
      <div className={`relative min-h-[11.5rem] aspect-[1.586/1] overflow-hidden rounded-xl bg-gradient-to-br ${theme.bg} p-4 text-white shadow-lg shadow-slate-200`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-1/2 top-0 h-full w-1/2 bg-white/20" />
          <div className="absolute bottom-0 left-0 h-1/3 w-full bg-black/15" />
          <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        </div>
        <div className="relative flex h-full flex-col justify-between">
          {/* RESPONSIVE: pr-10 para que "Principal" no quede debajo del botón de tres puntos */}
          <div className="flex items-start justify-between gap-3 pr-10">
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-wide">Tarjeta de retiro</p>
              {method.provider && <p className="mt-1 truncate text-xs text-white/75">{method.provider}</p>}
            </div>
            {method.isDefault && (
              <span className="flex-shrink-0 rounded-full bg-white/18 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                Principal
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className={`h-7 w-9 rounded-md ${theme.chip} shadow-inner`}>
              <div className="grid h-full grid-cols-2 grid-rows-2 gap-px p-1">
                <span className="rounded-sm bg-slate-300/80" />
                <span className="rounded-sm bg-slate-400/70" />
                <span className="rounded-sm bg-slate-400/70" />
                <span className="rounded-sm bg-slate-300/80" />
              </div>
            </div>
            {/* RESPONSIVE: más chico y con menos espaciado de letras en celular; a 284px el número
                completo (22 caracteres) no cabía en el ancho de la tarjeta */}
            <p className="whitespace-nowrap font-mono text-xs tracking-[0.08em] text-white drop-shadow-sm sm:text-sm sm:tracking-[0.12em]">
              {cardNumber}
            </p>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/65">Titular</p>
              <p className="truncate font-mono text-xs uppercase tracking-[0.12em]">
                {method.accountHolderName || "—"}
              </p>
            </div>
            {theme.brand && <p className="flex-shrink-0 text-xl font-black italic tracking-tight">{theme.brand}</p>}
          </div>
        </div>
      </div>

      <div className="absolute right-3 top-3">
        <button
          onClick={onToggleMenu}
          aria-label="Opciones de la tarjeta"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={onToggleMenu} />
            <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-slate-100 bg-white py-1 shadow-xl">
              {!method.isDefault && (
                <button
                  onClick={onSetDefault}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <Star className="h-4 w-4 text-amber-400" />
                  Establecer principal
                </button>
              )}
              <button
                onClick={onRemove}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar método
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function FinancesSection({ profile }: Props) {
  const [currency, setCurrency] = useState<PreferredCurrency>(
    (profile?.preferredCurrency as PreferredCurrency) ?? "PEN"
  );
  const [saved, setSaved] = useState(false);
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { summary, isLoading: loadingPayments, isError: paymentsError, refetch: refetchPayments } = useFreelancerWalletSummary();
  const { updateAsync: updateFinances, isLoading: isSaving } = useUpdateFinances(profile);
  const { methods, isLoading: loadingMethods } = usePayoutMethods();
  const { removeAsync } = useRemovePayoutMethod();
  const { setDefaultAsync } = useSetDefaultPayoutMethod();

  const handleSave = async () => {
    setActionError(null);
    try {
      await updateFinances({ preferredCurrency: currency });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setActionError(errorMessage(err, "No se pudieron guardar los cambios. Inténtalo de nuevo."));
    }
  };

  const handleRemove = async () => {
    if (!pendingRemoveId) return;
    const id = pendingRemoveId;
    setPendingRemoveId(null);
    setActionError(null);
    try {
      await removeAsync(id);
    } catch (err) {
      setActionError(errorMessage(err, "No se pudo eliminar el método de retiro. Inténtalo de nuevo."));
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setActionError(null);
    try {
      await setDefaultAsync(id);
    } catch (err) {
      setActionError(errorMessage(err, "No se pudo establecer la tarjeta como principal. Inténtalo de nuevo."));
    } finally {
      setOpenMenuId(null);
    }
  };

  const payments = summary?.recentPayments ?? [];
  const paymentsCurrency = summary?.currency;

  return (
    <div className="space-y-6">
      {pendingRemoveId && (
        <ConfirmModal
          title="¿Eliminar método de retiro?"
          description="Ya no podrás recibir retiros en esta tarjeta."
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={handleRemove}
          onCancel={() => setPendingRemoveId(null)}
        />
      )}

      {/* RESPONSIVE: p-4 en celular, p-6 desde sm (en las 4 tarjetas de sección) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[#1B3A6B]">Finanzas y Pagos</h2>
          <p className="mt-1 text-sm text-slate-500">
            Configura tu moneda, tus tarjetas de retiro y revisa tus comisiones.
          </p>
        </div>
      </div>

      {actionError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {actionError}
          </span>
          <button onClick={() => setActionError(null)} className="text-xs font-medium underline">
            Cerrar
          </button>
        </div>
      )}

      {/* Moneda preferida */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Moneda Preferida</label>
        <div className="flex flex-wrap items-center gap-3">
          {(["PEN", "USD"] as PreferredCurrency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                currency === c
                  ? "border-[#0EA5A0] bg-teal-50 text-[#1B3A6B]"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {c === "PEN" ? "S/. Soles" : "$ Dólares"}
            </button>
          ))}
        </div>
      </div>

      {/* Método de retiro */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {/* RESPONSIVE: flex-wrap; el botón "Agregar tarjeta" baja de línea en vez de comprimir el texto */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <label className="block text-sm font-semibold text-gray-700">Método de retiro</label>
            <p className="text-xs text-gray-400 mt-0.5">
              Configura la tarjeta donde recibirás tus ganancias cuando solicites un retiro.
            </p>
          </div>
          <button
            onClick={() => setMethodModalOpen(true)}
            className="flex flex-shrink-0 items-center gap-1.5 text-xs font-semibold text-white bg-[#1B3A6B] px-3.5 py-2 rounded-xl hover:bg-[#0EA5A0] transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar tarjeta
          </button>
        </div>

        {loadingMethods ? (
          <div className="text-center py-6">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
          </div>
        ) : methods.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
            <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aún no tienes un método de retiro.</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Agrega una tarjeta para poder retirar tus ganancias desde tu sección de Pagos.
            </p>
          </div>
        ) : (
          // RESPONSIVE: con el menú lateral de Configuración al lado (desde lg) el contenido mide ~450px, así que
          // las tarjetas pasan a 2 columnas solo desde xl y a 3 desde 2xl. Entre md y lg (pantalla completa) siguen en 2.
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
            {methods.map((m) => (
              <PayoutCard
                key={m.id}
                method={m}
                menuOpen={openMenuId === m.id}
                onToggleMenu={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                onSetDefault={() => handleSetDefault(m.id)}
                onRemove={() => {
                  setOpenMenuId(null);
                  setPendingRemoveId(m.id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagos recientes */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Pagos recientes</label>
        <div className="rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Fecha</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Proyecto</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Monto bruto</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Comisión plataforma</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Procesador</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Monto neto</th>
              </tr>
            </thead>
            <tbody>
              {loadingPayments ? (
                <tr>
                  <td colSpan={6} className="text-center py-6">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : paymentsError ? (
                <tr>
                  <td colSpan={6} className="text-center py-6">
                    <p className="text-sm text-red-600">No se pudieron cargar tus pagos recientes.</p>
                    <button
                      onClick={() => refetchPayments()}
                      className="mt-2 text-xs font-medium text-[#1B3A6B] underline"
                    >
                      Reintentar
                    </button>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-sm text-gray-400">
                    Aún no tienes pagos registrados.
                  </td>
                </tr>
              ) : (
                payments.map((row, i) => (
                  <tr key={`${row.milestoneId}-${i}`} className="border-t border-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatPaymentDate(row.date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <p>{row.projectTitle}</p>
                      {row.milestoneTitle && <p className="text-xs text-gray-400">{row.milestoneTitle}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">
                      {money(row.grossAmount, paymentsCurrency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-500 text-right whitespace-nowrap">
                      -{money(row.platformCommission, paymentsCurrency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-500 text-right whitespace-nowrap">
                      -{money(row.mpCommission, paymentsCurrency)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#0EA5A0] text-right whitespace-nowrap">
                      {money(row.netAmount, paymentsCurrency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      {/* RESPONSIVE: botones apilados a ancho completo en celular (Guardar arriba), en fila a la derecha desde sm */}
      <div className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex w-full sm:w-auto items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] px-5 py-2.5 rounded-xl hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
          {saved ? "Guardado" : "Guardar Cambios"}
        </button>
      </div>

      <AddPayoutMethodModal open={methodModalOpen} onClose={() => setMethodModalOpen(false)} />
    </div>
  );
}