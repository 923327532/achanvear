// features/payments/components/WalletHeader.tsx
"use client";

import { useState } from "react";
import { Download, History, Shield, TrendingUp, Plus, Loader2 } from "lucide-react";
import { useWallet, useLocalPaymentMethods, useInitiateRecharge } from "../hooks/usePayments";
import { WithdrawModal } from "./WithdrawModal";
import { WithdrawalHistoryModal } from "./WithdrawalHistoryModal";
import { QuickRechargeModal } from "./QuickRechargeModal";

export function WalletHeader() {
  const { wallet, isLoading } = useWallet();
  const { methods } = useLocalPaymentMethods();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);

  const fmt = (n: number) =>
    n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 bg-gray-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {/* Disponible */}
        <div className="bg-gradient-to-br from-[#1B3A6B] to-[#0EA5A0] rounded-2xl p-5 text-white">
          <p className="text-xs font-medium text-white/80 mb-2">Saldo disponible</p>
          <p className="text-3xl font-bold mb-4">S/. {fmt(wallet.balance)}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRechargeOpen(true)}
              className="flex items-center gap-1.5 bg-white text-[#1B3A6B] text-xs font-semibold px-4 py-2 rounded-xl hover:bg-white/90 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Recargar
            </button>
            <button
              onClick={() => setWithdrawOpen(true)}
              className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-white/30 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Retirar
            </button>
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-white transition-colors whitespace-nowrap"
            >
              <History className="w-3.5 h-3.5" />
              Historial
            </button>
          </div>
        </div>

        {/* Total depositado */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">Total depositado</p>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-emerald-600 mb-1">S/. {fmt(wallet.totalDeposited)}</p>
          <p className="text-xs text-gray-400">Fondos ingresados a tu wallet</p>
        </div>

        {/* Total gastado */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">Total gastado</p>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-amber-500 mb-1">S/. {fmt(wallet.totalSpent)}</p>
          <p className="text-xs text-gray-400">En proyectos y servicios</p>
        </div>
      </div>

      {/* Modals */}
      <QuickRechargeModal
        open={rechargeOpen}
        onClose={() => setRechargeOpen(false)}
      />
      <WithdrawModal
        open={withdrawOpen}
        availableBalance={wallet.balance}
        paymentMethods={methods.map((m) => ({ id: m.id, label: m.label, detail: m.detail }))}
        onClose={() => setWithdrawOpen(false)}
      />
      <WithdrawalHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </>
  );
}
