// features/payments/components/WithdrawModal.tsx
"use client";

import { useState } from "react";
import { X, Loader2, Download, AlertCircle } from "lucide-react";
import { useRequestPayout } from "../hooks/usePayments";
import { getFriendlyErrorMessage } from "@/lib/friendlyErrors";

interface Props {
  open: boolean;
  availableBalance: number;
  paymentMethods: { id: string; label: string; detail: string }[];
  onClose: () => void;
}

export function WithdrawModal({ open, availableBalance, paymentMethods, onClose }: Props) {
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { requestAsync, isLoading } = useRequestPayout();

  if (!open) return null;

  const handleSubmit = async () => {
    setError(null);
    try {
      await requestAsync({
        amount: Number(amount),
        payoutMethodId: selectedMethod,
        idempotencyKey: crypto.randomUUID(),
      });
      setSuccess(true);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    }
  };

  const handleClose = () => {
    setAmount("");
    setSelectedMethod("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  const fmt = (n: number) =>
    n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Retiro solicitado</h3>
          <p className="text-sm text-gray-500 mb-6">
            Se ha registrado tu solicitud de retiro por{" "}
            <span className="font-semibold text-gray-700">S/. {fmt(Number(amount))}</span>.
            El dinero llegará en 1-3 días hábiles.
          </p>
          <button
            onClick={handleClose}
            className="w-full text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl py-3 hover:bg-[#0EA5A0] transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#1B3A6B]">Retirar fondos</h2>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-700">
              <span className="font-semibold">Saldo disponible:</span> S/. {fmt(availableBalance)}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Monto a retirar</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">S/.</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                max={availableBalance}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Método de retiro</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
            >
              <option value="">Seleccionar método</option>
              {paymentMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} - {m.detail}
                </option>
              ))}
            </select>
            {paymentMethods.length === 0 && (
              <p className="text-xs text-gray-400 mt-2">
                Registra una tarjeta en Configuración &gt; Finanzas y Pagos para poder retirar.
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleClose} className="flex-1 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!amount || !selectedMethod || isLoading || Number(amount) > availableBalance}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl py-2.5 hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Retirar S/. {amount ? fmt(Number(amount)) : "0.00"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
