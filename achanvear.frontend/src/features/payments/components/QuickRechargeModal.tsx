// features/payments/components/QuickRechargeModal.tsx
"use client";

import { useState } from "react";
import { X, CheckCircle, Loader2, Zap } from "lucide-react";
import { useInitiateRecharge } from "../hooks/usePayments";

interface Props {
  open: boolean;
  onClose: () => void;
}

const RECHARGE_METHODS = [
  { id: "YAPE", label: "Yape", color: "bg-purple-600 text-white" },
  { id: "PLIN", label: "Plin", color: "bg-blue-600 text-white" },
  { id: "DEBIT_CARD", label: "Tarjeta Débito", color: "bg-slate-700 text-white" },
  { id: "CREDIT_CARD", label: "Tarjeta Crédito", color: "bg-slate-700 text-white" },
];

const QUICK_AMOUNTS = [20, 50, 100, 200, 500];

export function QuickRechargeModal({ open, onClose }: Props) {
  const [method, setMethod] = useState("YAPE");
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [success, setSuccess] = useState(false);
  const { initiateAsync, isLoading } = useInitiateRecharge();

  if (!open) return null;

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  const handleSubmit = async () => {
    if (!amount || !method) return;
    await initiateAsync({
      amount: Number(amount),
      method,
      phoneNumber: phoneNumber || undefined,
    });
    setSuccess(true);
  };

  const handleClose = () => {
    setAmount("");
    setMethod("YAPE");
    setPhoneNumber("");
    setSuccess(false);
    onClose();
  };

  const fmt = (n: number) =>
    n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── Success ──
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Recarga iniciada</h3>
          <p className="text-sm text-gray-500 mb-1">
            Se ha registrado tu solicitud de recarga por{" "}
            <span className="font-semibold text-gray-700">S/. {fmt(Number(amount))}</span>
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Sigue las instrucciones en tu app de {method === "YAPE" ? "Yape" : method === "PLIN" ? "Plin" : "banco"} para completar el pago.
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

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-[#1B3A6B]">Recarga Rápida</h2>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Método de recarga */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Método de recarga</label>
            <div className="grid grid-cols-2 gap-2">
              {RECHARGE_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                    method === m.id
                      ? m.color
                      : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Monto a recargar</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">S/.</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min={5}
                max={5000}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
              />
            </div>
            {/* Quick amounts */}
            <div className="flex items-center gap-2 mt-2">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  onClick={() => handleQuickAmount(val)}
                  className={`flex-1 text-xs font-medium rounded-lg py-1.5 transition-colors ${
                    Number(amount) === val
                      ? "bg-[#1B3A6B] text-white"
                      : "text-gray-500 border border-gray-200 hover:border-[#0EA5A0] hover:text-[#0EA5A0]"
                  }`}
                >
                  S/. {val}
                </button>
              ))}
            </div>
          </div>

          {/* Número de celular (solo para Yape/Plin) */}
          {(method === "YAPE" || method === "PLIN") && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Número de celular vinculado
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50">+51</span>
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="987 654 321"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-700">
              <span className="font-semibold">Monto mínimo:</span> S/. 5.00 &nbsp;|&nbsp;
              <span className="font-semibold">Monto máximo:</span> S/. 5,000.00
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="flex-1 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!amount || isLoading || Number(amount) < 5 || Number(amount) > 5000}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl py-2.5 hover:bg-[#0EA5A0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Recargar S/. {amount ? fmt(Number(amount)) : "0.00"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
