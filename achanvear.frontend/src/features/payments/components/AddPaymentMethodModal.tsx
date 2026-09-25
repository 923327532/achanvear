// features/payments/components/AddPaymentMethodModal.tsx
"use client";

import { useState } from "react";
import { X, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useAddLocalMethod } from "../hooks/usePayments";
import { CulqiCardForm } from "./CulqiCardForm";
import type { AddMethodTab, YapePlinSubtype, AccountType } from "../types/payments.types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const BANKS = ["BCP", "Interbank", "BBVA", "Scotiabank", "Banco Pichincha", "Otro"];

function validateCci(v: string): string | null {
  if (v.length !== 20) return "El CCI debe tener exactamente 20 dígitos";
  if (!/^\d{20}$/.test(v)) return "Solo se permiten números";
  return null;
}

function validatePhone(v: string): string | null {
  const digits = v.replace(/\s/g, "");
  if (digits.length !== 9) return "El número debe tener exactamente 9 dígitos";
  if (!/^\d{9}$/.test(digits)) return "Solo se permiten números";
  return null;
}

function formatPhone(v: string): string {
  return v.replace(/\D/g, "").slice(0, 9);
}

export function AddPaymentMethodModal({ open, onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<AddMethodTab>("TARJETA");
  const [yapePlinSub, setYapePlinSub] = useState<YapePlinSubtype>("YAPE");
  const [accountType, setAccountType] = useState<AccountType>("AHORRO");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ✅ FIX 1: solo mostrar errores después de intentar enviar
  const [submitted, setSubmitted] = useState(false);

  const [bank, setBank] = useState("");
  const [cci, setCci] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const [phone, setPhone] = useState("");

  const { addAsync, isLoading } = useAddLocalMethod();

  if (!open) return null;

  const getValidationErrors = (): string[] => {
    const errors: string[] = [];
    if (tab === "TARJETA") {
      // La tarjeta se tokeniza con Culqi Checkout; no se validan campos aqui.
      return errors;
    } else if (tab === "CUENTA_BANCARIA") {
      if (!bank) errors.push("Selecciona un banco");
      const e1 = validateCci(cci);
      if (e1) errors.push(e1);
      if (!accountHolder.trim()) errors.push("El titular es obligatorio");
    } else if (tab === "YAPE_PLIN") {
      const e1 = validatePhone(phone);
      if (e1) errors.push(e1);
    }
    return errors;
  };

  const validationErrors = getValidationErrors();
  const canSubmit = validationErrors.length === 0;

  const handleSubmit = async () => {
    // ✅ FIX 1: marcar como submitted para mostrar errores
    setSubmitted(true);
    setError(null);
    if (!canSubmit) return;

    try {
      if (tab === "YAPE_PLIN") {
        await addAsync({
          methodType: yapePlinSub,
          phoneNumber: phone.replace(/\s/g, ""),
          accountHolderName: accountHolder.trim() || undefined,
        });
      } else {
        setError("La tarjeta se guarda con Culqi. Usa el boton 'Agregar tarjeta con Culqi' para tokenizarla.");
        return;
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Error al guardar el método de pago");
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    setSubmitted(false); // ✅ FIX 1: resetear al cerrar
    setTab("TARJETA");
    setBank("");
    setCci("");
    setAccountHolder("");
    setPhone("");
    onClose();
  };

  // ✅ FIX 1: también resetear submitted al cambiar de tab
  const handleTabChange = (t: AddMethodTab) => {
    setTab(t);
    setError(null);
    setSubmitted(false);
  };

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors";
  const inputErrorClass =
    "w-full border border-red-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-colors";

  // ── Helper para mostrar error inline solo si submitted ─────────────────
  const fieldError = (fn: () => string | null) => {
    if (!submitted) return null;
    return fn();
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Método de pago agregado</h3>
          <p className="text-sm text-gray-500 mb-6">Ya puedes usarlo para tus transacciones en Achanvear</p>
          <button
            onClick={() => { onSuccess?.(); handleClose(); }}
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

      {/* ✅ FIX 2: max-h + overflow-y-auto para que el modal no crezca infinitamente */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">

        {/* Header — fijo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-[#1B3A6B]">Agregar método de pago</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs — fijo */}
        <div className="flex items-center gap-2 px-6 pt-4 pb-3 flex-shrink-0">
          {(["TARJETA", "YAPE_PLIN"] as AddMethodTab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-colors ${
                tab === t
                  ? "bg-[#1B3A6B] text-white"
                  : "text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t === "TARJETA" ? "Tarjeta" : t === "CUENTA_BANCARIA" ? "Cuenta bancaria" : "Yape / Plin"}
            </button>
          ))}
        </div>

        {/* ✅ FIX 2: contenido scrolleable */}
        <div className="overflow-y-auto flex-1 px-6 pb-4 space-y-4">

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* ── TARJETA (tokenizacion con Culqi Checkout) ── */}
          {tab === "TARJETA" && (
            <CulqiCardForm
              onSuccess={onSuccess}
              onError={(msg) => setError(msg)}
            />
          )}

          {/* ── CUENTA BANCARIA ── */}
          {tab === "CUENTA_BANCARIA" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Banco</label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className={submitted && !bank ? inputErrorClass : inputClass}
                >
                  <option value="">Seleccionar banco</option>
                  {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                {submitted && !bank && (
                  <p className="text-xs text-red-500 mt-1">Selecciona un banco</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">CCI (20 dígitos)</label>
                <input
                  value={cci}
                  onChange={(e) => setCci(e.target.value.replace(/\D/g, "").slice(0, 20))}
                  placeholder="00000000000000000000"
                  maxLength={20}
                  className={submitted && validateCci(cci) ? inputErrorClass : inputClass}
                />
                {fieldError(() => validateCci(cci)) && (
                  <p className="text-xs text-red-500 mt-1">{fieldError(() => validateCci(cci))}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Titular de la cuenta</label>
                <input
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Nombre del titular"
                  className={submitted && !accountHolder.trim() ? inputErrorClass : inputClass}
                />
                {submitted && !accountHolder.trim() && (
                  <p className="text-xs text-red-500 mt-1">El titular es obligatorio</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Tipo de cuenta</label>
                <div className="flex items-center gap-4">
                  {(["AHORRO", "CORRIENTE"] as AccountType[]).map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={accountType === t}
                        onChange={() => setAccountType(t)}
                        className="accent-[#1B3A6B]"
                      />
                      <span className="text-sm text-gray-700">{t === "AHORRO" ? "Ahorro" : "Corriente"}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── YAPE / PLIN ── */}
          {tab === "YAPE_PLIN" && (
            <>
              <div className="flex items-center gap-2">
                {(["YAPE", "PLIN"] as YapePlinSubtype[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setYapePlinSub(s)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${
                      yapePlinSub === s
                        ? s === "YAPE" ? "bg-purple-600 text-white" : "bg-blue-600 text-white"
                        : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Número de celular</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50">
                    +51
                  </span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="987 654 321"
                    maxLength={9}
                    className={`${submitted && validatePhone(phone) ? inputErrorClass : inputClass} flex-1`}
                  />
                </div>
                {fieldError(() => validatePhone(phone)) && (
                  <p className="text-xs text-red-500 mt-1">{fieldError(() => validatePhone(phone))}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">Debe tener exactamente 9 dígitos</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nombre del titular (opcional)
                </label>
                <input
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Nombre del titular"
                  className={inputClass}
                />
              </div>
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <span className="text-blue-500 text-xs mt-0.5">ℹ</span>
                <p className="text-xs text-blue-700">
                  Recibirás una notificación en tu app de{" "}
                  {yapePlinSub.charAt(0) + yapePlinSub.slice(1).toLowerCase()} para confirmar la vinculación
                </p>
              </div>
            </>
          )}

          {/* ✅ FIX 1: validation summary solo si submitted */}
          {submitted && validationErrors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-amber-800 mb-1">Corrige los siguientes errores:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {validationErrors.map((err, i) => (
                  <li key={i} className="text-xs text-amber-700">{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer — fijo en la parte inferior */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleClose}
            className="flex-1 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          {tab !== "TARJETA" && (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl py-2.5 hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {tab === "CUENTA_BANCARIA" ? "Guardar cuenta" : "Vincular"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
