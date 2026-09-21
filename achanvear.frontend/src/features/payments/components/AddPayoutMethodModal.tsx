// features/payments/components/AddPayoutMethodModal.tsx
"use client";

import { useState } from "react";
import { X, Loader2, CreditCard, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { useAddPayoutMethod } from "../hooks/usePayments";

interface Props {
  open: boolean;
  onClose: () => void;
}

type CardBrand = "Visa" | "Mastercard" | "Amex" | "Diners" | "Discover" | "Desconocida";

function detectCardBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^3(?:0[0-5]|[68])/.test(digits)) return "Diners";
  if (/^6(?:011|5)/.test(digits)) return "Discover";
  return "Desconocida";
}

function validateCardNumber(v: string): string | null {
  const digits = v.replace(/\s/g, "");
  if (!/^\d+$/.test(digits)) return "Solo se permiten números";
  if (digits.length < 13 || digits.length > 19) return "Número de tarjeta inválido";
  return null;
}

function validateExpiry(v: string): string | null {
  if (!/^\d{2}\/\d{2}$/.test(v)) return "Formato MM/AA";
  const [mm, yy] = v.split("/").map(Number);
  const now = new Date();
  const year = 2000 + yy;
  if (mm < 1 || mm > 12) return "Mes inválido";
  if (year < now.getFullYear()) return "La tarjeta está vencida";
  if (year === now.getFullYear() && mm < now.getMonth() + 1) return "La tarjeta está vencida";
  return null;
}

export function AddPayoutMethodModal({ open, onClose }: Props) {
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { addAsync, isLoading } = useAddPayoutMethod();

  if (!open) return null;

  const brand = detectCardBrand(number.replace(/\s/g, ""));
  const last4 = number.replace(/\s/g, "").slice(-4);
  const maskedCard = `•••• •••• •••• ${last4}`;

  const formatNumber = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 19)
      .replace(/(\d{4})(?=\d)/g, "$1 ");

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleClose = () => {
    setNumber("");
    setHolder("");
    setExpiry("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    const cardError = validateCardNumber(number);
    if (cardError) return setError(cardError);
    const expiryError = validateExpiry(expiry);
    if (expiryError) return setError(expiryError);
    if (holder.trim().length < 3) return setError("Ingresa el nombre del titular de la tarjeta");

    try {
      await addAsync({
        // El número de tarjeta NUNCA se envía al backend: solo datos enmascarados.
        cardToken: `izp_tok_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`,
        maskedCard,
        cardBrand: brand,
        lastFourDigits: last4,
        accountHolderName: holder.trim(),
      });
      setSuccess(true);
      setTimeout(handleClose, 1800);
    } catch (err: any) {
      setError(err?.message ?? "No se pudo registrar la tarjeta. Inténtalo de nuevo.");
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Tarjeta registrada</h3>
          <p className="text-sm text-gray-500">
            {brand} {maskedCard} quedó guardada como método de retiro.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#1B3A6B]">Agregar tarjeta de retiro</h2>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              Recibirás tus ganancias en esta tarjeta cuando solicites un retiro. Tiyuy
              no almacena el número completo ni el CVV.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Número de tarjeta</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <CreditCard className="w-4 h-4" />
              </span>
              <input
                value={number}
                onChange={(e) => setNumber(formatNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
              />
              {number && brand !== "Desconocida" && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">
                  {brand}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Titular de la tarjeta</label>
            <input
              value={holder}
              onChange={(e) => setHolder(e.target.value)}
              placeholder="Nombre completo del titular"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Vencimiento</label>
            <input
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/AA"
              inputMode="numeric"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
            />
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
              disabled={isLoading || !number || !holder || !expiry}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl py-2.5 hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar tarjeta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
