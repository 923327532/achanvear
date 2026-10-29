// features/payments/components/PaymentsPage.tsx
"use client";

import { useState } from "react";
import {
  Wallet,
  Clock,
  Download,
  Plus,
  CreditCard,
  TrendingUp,
  Lock,
  AlertCircle,
} from "lucide-react";
import { useProtectedRoute } from "@/shared/hooks/useProtectedRoute";
import {
  useWallet,
  useFreelancerWalletSummary,
  useWalletTransactions,
  usePayoutMethods,
  usePayoutHistory,
} from "../hooks/usePayments";
import { useEscrowRecords } from "../hooks/useEscrowRecords";
import { WithdrawModal } from "./WithdrawModal";
import { AddPayoutMethodModal } from "./AddPayoutMethodModal";
import {
  PAYOUT_STATUS_CONFIG,
  MILESTONE_STATUS_CONFIG,
  ESCROW_STATUS_CONFIG,
} from "../types/payments.types";
import type { EscrowStatus, MilestoneStatus, PayoutStatus } from "../types/payments.types";

type StatusStyle = { label: string; color: string };

const NEUTRAL_COLOR = "bg-slate-100 text-slate-600";

function payoutStatus(status: string): StatusStyle {
  return PAYOUT_STATUS_CONFIG[status as PayoutStatus] ?? { label: status || "—", color: NEUTRAL_COLOR };
}

function milestoneStatus(status: string): StatusStyle {
  if (status === "RELEASED") return { label: "Pagado", color: "bg-emerald-100 text-emerald-700" };
  return MILESTONE_STATUS_CONFIG[status as MilestoneStatus] ?? { label: status || "—", color: NEUTRAL_COLOR };
}

function escrowStatus(status: string): StatusStyle {
  return ESCROW_STATUS_CONFIG[status as EscrowStatus] ?? { label: status || "—", color: NEUTRAL_COLOR };
}

function currencySymbol(currency?: string) {
  if (!currency || currency === "PEN") return "S/.";
  if (currency === "USD") return "US$";
  return currency;
}

export function PaymentsPage() {
  useProtectedRoute();

  const { wallet, isError: walletError, refetch: refetchWallet } = useWallet();
  const {
    summary,
    isLoading: loadingSummary,
    isError: summaryError,
    refetch: refetchSummary,
  } = useFreelancerWalletSummary();
  const { transactions, isError: transactionsError } = useWalletTransactions();
  const { escrows, isError: escrowError } = useEscrowRecords();
  const { methods } = usePayoutMethods();
  const { payouts } = usePayoutHistory();

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [addMethodOpen, setAddMethodOpen] = useState(false);

  const currency = summary?.currency ?? wallet.currency;

  const fmt = (n: number) =>
    n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money = (n: number) => `${currencySymbol(currency)} ${fmt(n)}`;

  const available = summary?.availableForWithdrawal ?? wallet.balance ?? 0;
  const pending = summary?.pendingRelease ?? 0;
  const withdrawalsInProcess = payouts
    .filter((p) => p.status === "REQUESTED" || p.status === "PROCESSING")
    .reduce((acc, p) => acc + p.amount, 0);
  const totalWithdrawn = wallet.totalWithdrawn ?? 0;

  type HistoryRow = {
    key: string;
    id: string;
    title: string;
    detail: string;
    date: string | null;
    gross: number;
    commission: number;
    net: number;
    status: StatusStyle;
    method: string;
    sign: string;
  };

  const rows: HistoryRow[] = [];

  (summary?.recentPayments ?? []).forEach((p, i) => {
    rows.push({
      key: `pay-${p.milestoneId}-${i}`,
      id: (p.milestoneId ?? "").slice(0, 8),
      title: p.milestoneTitle,
      detail: p.projectTitle,
      date: p.date,
      gross: p.grossAmount,
      commission: p.platformCommission + p.mpCommission,
      net: p.netAmount,
      status: milestoneStatus(p.status),
      method: "Mercado Pago",
      sign: "+",
    });
  });

  escrows
    .filter((e) => e.status !== "RELEASED" && e.status !== "REFUNDED")
    .forEach((e, i) => {
      rows.push({
        key: `esc-${e.escrowId}-${i}`,
        id: (e.milestoneId ?? "").slice(0, 8),
        title: "Fondos retenidos",
        detail: `Proyecto #${(e.projectId ?? "").slice(0, 8)}`,
        date: e.disputedAt ?? e.heldAt,
        gross: e.amount,
        commission: (e.platformCommission ?? 0) + (e.mpCommission ?? 0),
        net: e.freelancerAmount ?? e.amount,
        status: escrowStatus(e.status),
        method: "Mercado Pago",
        sign: "+",
      });
    });

  transactions.forEach((t) => {
    if (t.type === "WITHDRAWAL") return;
    const statusMap: Record<string, StatusStyle> = {
      DEPOSIT: { label: "Depósito", color: "bg-emerald-100 text-emerald-700" },
      PAYMENT: { label: "Pago", color: "bg-blue-100 text-blue-700" },
      REFUND: { label: "Reembolso", color: "bg-purple-100 text-purple-700" },
    };
    rows.push({
      key: `tx-${t.id}`,
      id: t.id.slice(0, 8),
      title: t.description || t.referenceType,
      detail: t.type,
      date: t.createdAt,
      gross: t.amount,
      commission: 0,
      net: t.amount,
      status: statusMap[t.type] ?? { label: t.type, color: NEUTRAL_COLOR },
      method: "Wallet",
      sign: "+",
    });
  });

  payouts.forEach((p) => {
    const method = methods.find((m) => m.id === p.payoutMethodId);
    rows.push({
      key: `po-${p.id}`,
      id: p.id.slice(0, 8),
      title:
        "Retiro a " +
        (method
          ? `${method.cardBrand ?? "tarjeta"} ${method.maskedCard}`
          : "método de retiro"),
      detail: p.status,
      date: p.completedAt ?? p.requestedAt ?? p.createdAt,
      gross: p.amount,
      commission: 0,
      net: p.amount,
      status: payoutStatus(p.status),
      method: method ? `${method.cardBrand ?? "Tarjeta"} ${method.maskedCard}` : "Izipay",
      sign: "-",
    });
  });

  rows.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
  };

  const partialError = transactionsError || escrowError;

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0a1628] tracking-tight">Pagos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Saldo disponible, dinero pendiente e historial de pagos de tus trabajos.
          </p>
        </div>

        {loadingSummary ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : summaryError ? (
          <div
            role="alert"
            className="mb-8 flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-8 text-center"
          >
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm font-medium text-red-700">No se pudo cargar tu resumen de pagos.</p>
            <button
              onClick={() => {
                refetchSummary();
                refetchWallet();
              }}
              className="rounded-xl bg-[#1B3A6B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#16305a] transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-[#1B3A6B] to-[#0EA5A0] rounded-2xl p-5 text-white shadow-sm">
              <p className="text-xs font-medium text-white/80 mb-2">Disponible para retirar</p>
              <p className="text-3xl font-bold mb-4">{money(available)}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWithdrawOpen(true)}
                  className="flex items-center gap-1.5 bg-white text-[#1B3A6B] text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-white/90 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Retirar
                </button>
                <button
                  onClick={() => setAddMethodOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Método
                </button>
              </div>
            </div>

            <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500">Pendiente por recibir</p>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-3xl font-bold text-amber-600 mb-1">{money(pending)}</p>
              <p className="text-xs text-gray-400">Trabajos en revisión / por liberar</p>
            </div>

            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500">Retiros en proceso</p>
                <Lock className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-1">{money(withdrawalsInProcess)}</p>
              <p className="text-xs text-gray-400">Desembolsos en curso a tu tarjeta</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500">Total retirado</p>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-emerald-600 mb-1">
                {walletError ? "—" : money(totalWithdrawn)}
              </p>
              <p className="text-xs text-gray-400">Fondos enviados a tu tarjeta</p>
            </div>
          </div>
        )}

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0F172A]">Historial de movimientos</h2>
            <span className="text-xs text-slate-400">{rows.length} movimientos</span>
          </div>
          {partialError && rows.length > 0 && (
            <p role="alert" className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              Algunos movimientos no se pudieron cargar. Recarga la página para intentarlo de nuevo.
            </p>
          )}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {rows.length === 0 ? (
              partialError ? (
                <div role="alert" className="p-10 text-center">
                  <AlertCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No se pudieron cargar tus movimientos.</p>
                  <p className="text-xs text-gray-400">Recarga la página para intentarlo de nuevo.</p>
                </div>
              ) : (
                <div className="p-10 text-center">
                  <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Aún no tienes movimientos</p>
                  <p className="text-xs text-gray-400">
                    Tus pagos aparecerán aquí cuando completes trabajos.
                  </p>
                </div>
              )
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Trabajo</th>
                      <th className="px-4 py-3">Detalle</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3 text-right">Bruto</th>
                      <th className="px-4 py-3 text-right">Comisión</th>
                      <th className="px-4 py-3 text-right">Neto</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Método</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rows.map((r) => (
                      <tr key={r.key} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800">{r.title}</p>
                          <p className="text-xs text-gray-400 font-mono">#{r.id}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{r.detail}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{formatDate(r.date)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                          {fmt(r.gross)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-red-500">
                          -{fmt(r.commission)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold tabular-nums ${
                            r.sign === "-" ? "text-red-600" : "text-emerald-600"
                          }`}
                        >
                          {r.sign} {money(r.net)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${r.status.color}`}
                          >
                            {r.status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{r.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0F172A]">Métodos de retiro</h2>
            <button
              onClick={() => setAddMethodOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1B3A6B] bg-white border border-gray-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar tarjeta
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            {methods.length === 0 ? (
              <div className="flex items-center gap-3 p-4 text-sm text-slate-500">
                <Wallet className="w-5 h-5 text-gray-300" />
                <span>
                  No tienes métodos de retiro.{" "}
                  <button
                    onClick={() => setAddMethodOpen(true)}
                    className="font-semibold text-[#1B3A6B] hover:underline"
                  >
                    Agrega una tarjeta
                  </button>{" "}
                  para recibir tus ganancias.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {methods.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-slate-50"
                  >
                    <div className="p-2.5 bg-white text-[#1B3A6B] rounded-lg shadow-sm">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {m.cardBrand ?? "Tarjeta"} {m.maskedCard}
                      </p>
                      {m.accountHolderName && (
                        <p className="text-xs text-gray-500 truncate">{m.accountHolderName}</p>
                      )}
                    </div>
                    {m.isDefault && (
                      <span className="text-[10px] font-semibold bg-[#0EA5A0] text-white px-2 py-0.5 rounded-full">
                        Principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <WithdrawModal
          open={withdrawOpen}
          availableBalance={available}
          paymentMethods={methods.map((m) => ({
            id: m.id,
            label: `${m.cardBrand ?? "Tarjeta"} ${m.maskedCard}`,
            detail: m.isDefault ? "Principal" : "Izipay",
          }))}
          onClose={() => setWithdrawOpen(false)}
        />
        <AddPayoutMethodModal open={addMethodOpen} onClose={() => setAddMethodOpen(false)} />
      </div>
    </div>
  );
}