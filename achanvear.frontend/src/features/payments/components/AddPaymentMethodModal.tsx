// features/payments/components/AddPaymentMethodModal.tsx
"use client";

import { useState } from "react";
import { X, Lock, CheckCircle, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAddLocalMethod } from "../hooks/usePayments";
import type { AddMethodTab, YapePlinSubtype, AccountType } from "../types/payments.types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const BANKS = ["BCP", "Interbank", "BBVA", "Scotiabank", "Banco Pichincha", "Otro"];

type CardBrand = "visa" | "mastercard" | "amex" | "unknown";

function detectCardBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return "visa";
  if (/^5[1-5]/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  return "unknown";
}

function validateCardNumber(v: string): string | null {
  const digits = v.replace(/\s/g, "");
  if (!/^\d+$/.test(digits)) return "Solo se permiten números";
  const brand = detectCardBrand(digits);
  if (brand === "amex") {
    if (digits.length !== 15) return "American Express debe tener 15 dígitos";
  } else if (brand === "visa" || brand === "mastercard") {
    if (digits.length !== 16) return "Visa/Mastercard deben tener 16 dígitos";
  } else {
    if (digits.length < 13 || digits.length > 19) return "Número de tarjeta inválido";
  }
  return null;
}

function validateExpiry(v: string): string | null {
  const cleaned = v.replace("/", "").replace(/\s/g, "");
  if (cleaned.length !== 4) return "Debe tener 4 dígitos (MMAA)";
  if (!/^\d{4}$/.test(cleaned)) return "Solo se permiten números";
  const month = parseInt(cleaned.slice(0, 2), 10);
  if (month < 1 || month > 12) return "Mes inválido (01-12)";
  return null;
}

function validateCvv(v: string, brand: CardBrand): string | null {
  const expected = brand === "amex" ? 4 : 3;
  if (v.length !== expected) return `El CVV debe tener exactamente ${expected} dígitos`;
  if (!/^\d+$/.test(v)) return "Solo se permiten números";
  return null;
}

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

function formatCardNumber(v: string): string {
  const digits = v.replace(/\D/g, "");
  const brand = detectCardBrand(digits);
  if (brand === "amex") {
    const d = digits.slice(0, 15);
    if (d.length > 4) return d.slice(0, 4) + " " + d.slice(4, 10) + (d.length > 10 ? " " + d.slice(10) : "");
    return d;
  }
  const d = digits.slice(0, 16);
  return d.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

function formatPhone(v: string): string {
  return v.replace(/\D/g, "").slice(0, 9);
}

export function AddPaymentMethodModal({ open, onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<AddMethodTab>("TARJETA");
  const [showCvv, setShowCvv] = useState(false);
  const [yapePlinSub, setYapePlinSub] = useState<YapePlinSubtype>("YAPE");
  const [accountType, setAccountType] = useState<AccountType>("AHORRO");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ✅ FIX 1: solo mostrar errores después de intentar enviar
  const [submitted, setSubmitted] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  const [bank, setBank] = useState("");
  const [cci, setCci] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const [phone, setPhone] = useState("");

  const { addAsync, isLoading } = useAddLocalMethod();

  if (!open) return null;

  const cardDigits = cardNumber.replace(/\s/g, "");
  const cardBrand = cardDigits ? detectCardBrand(cardDigits) : "unknown";

  const getValidationErrors = (): string[] => {
    const errors: string[] = [];
    if (tab === "TARJETA") {
      const e1 = validateCardNumber(cardNumber);
      if (e1) errors.push(e1);
      if (!cardHolder.trim()) errors.push("El titular es obligatorio");
      const e2 = validateExpiry(expiry);
      if (e2) errors.push(e2);
      const e3 = validateCvv(cvv, cardBrand);
      if (e3) errors.push(e3);
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
        await new Promise((r) => setTimeout(r, 800));
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
    setCardNumber("");
    setCardHolder("");
    setExpiry("");
    setCvv("");
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
          {(["TARJETA", "CUENTA_BANCARIA", "YAPE_PLIN"] as AddMethodTab[]).map((t) => (
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

          {/* ── TARJETA ── */}
          {tab === "TARJETA" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Número de tarjeta</label>
                <div className="relative">
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    // ✅ FIX 1: solo borde rojo si submitted
                    className={submitted && validateCardNumber(cardNumber) ? inputErrorClass : inputClass}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    Visa/Mastercard
                  </span>
                </div>
                {fieldError(() => validateCardNumber(cardNumber)) && (
                  <p className="text-xs text-red-500 mt-1">{fieldError(() => validateCardNumber(cardNumber))}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Titular de la tarjeta</label>
                <input
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Nombre como aparece en la tarjeta"
                  className={submitted && !cardHolder.trim() ? inputErrorClass : inputClass}
                />
                {submitted && !cardHolder.trim() && (
                  <p className="text-xs text-red-500 mt-1">El titular es obligatorio</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Vencimiento</label>
                  <input
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/AA"
                    maxLength={5}
                    className={submitted && validateExpiry(expiry) ? inputErrorClass : inputClass}
                  />
                  {fieldError(() => validateExpiry(expiry)) && (
                    <p className="text-xs text-red-500 mt-1">{fieldError(() => validateExpiry(expiry))}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">CVV</label>
                  <div className="relative">
                    <input
                      value={cvv}
                      onChange={(e) => {
                        const max = cardBrand === "amex" ? 4 : 3;
                        setCvv(e.target.value.replace(/\D/g, "").slice(0, max));
                      }}
                      type={showCvv ? "text" : "password"}
                      placeholder={cardBrand === "amex" ? "1234" : "123"}
                      maxLength={cardBrand === "amex" ? 4 : 3}
                      className={submitted && validateCvv(cvv, cardBrand) ? inputErrorClass : inputClass}
                    />
                    <button
                      onClick={() => setShowCvv((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldError(() => validateCvv(cvv, cardBrand)) && (
                    <p className="text-xs text-red-500 mt-1">{fieldError(() => validateCvv(cvv, cardBrand))}</p>
                  )}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="rounded"
                />
                <span className="text-xs text-gray-600">Guardar tarjeta de forma segura</span>
              </label>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="text-xs text-emerald-700 font-medium">Datos encriptados con SSL</span>
              </div>
            </>
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
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl py-2.5 hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {tab === "TARJETA" ? "Agregar tarjeta" : tab === "CUENTA_BANCARIA" ? "Guardar cuenta" : "Vincular"}
          </button>
        </div>
      </div>
    </div>
  );
}