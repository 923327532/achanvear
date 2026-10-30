"use client";

import { CommissionPolicyNotice } from "@/components/payments/CommissionPolicyNotice";
import { useState } from "react";
import { Shield, CheckCircle2, CreditCard, Landmark, Info, ArrowRight } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import type { CompanyOnboardingData } from "@/features/onboarding/types/onboarding.types";

interface PaymentEscrowStepProps {
  data: CompanyOnboardingData;
  onUpdate: (updates: Partial<CompanyOnboardingData>) => void;
  onNext: (fromStep?: number) => void;
  onBack: () => void;
}

export function PaymentEscrowStep({ data, onUpdate, onNext, onBack }: PaymentEscrowStepProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    if (!data.paymentMethod) {
      setError("Debes seleccionar un método de pago");
      return;
    }
    if (!data.acceptEscrowTerms) {
      setError("Debes aceptar los términos del sistema de Escrow");
      return;
    }
    onNext();
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl p-8 md:p-10">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-[#1B3A6B] to-[#0EA5A0] rounded-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Configuración de Pago y Escrow</h1>
        <p className="text-slate-600">Protegemos tus pagos mediante fideicomiso</p>
      </div>

      {error && <Alert message={error} />}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Escrow Info */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-900" />
            <h3 className="text-lg font-bold text-blue-900">¿Cómo funciona el Escrow?</h3>
          </div>
          <ul className="space-y-3 text-blue-800">
            {[
              "Al crear un proyecto freelance, depositas el monto en fideicomiso",
              "El dinero está protegido hasta que el profesional complete los hitos",
              "Solo liberas el pago cuando apruebes el trabajo entregado",
              "En caso de disputa, nuestro sistema de arbitraje protege a ambas partes",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Platform Commissions */}
        <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-slate-900" />
            <h3 className="text-lg font-bold text-slate-900">Comisiones de la Plataforma</h3>
          </div>
          <CommissionPolicyNotice />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Métodos de Pago</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { value: "credit_card", label: "Tarjeta de Crédito/Débito", desc: "Visa, Mastercard, American Express", icon: <CreditCard className="w-8 h-8" /> },
            { value: "bank_transfer", label: "Transferencia Bancaria", desc: "Depósito directo desde tu banco", icon: <Landmark className="w-8 h-8" /> },
          ].map(({ value, label, desc, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => { onUpdate({ paymentMethod: value }); setError(null); }}
              className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
                data.paymentMethod === value
                  ? "border-teal-600 bg-teal-50 ring-2 ring-teal-200"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${data.paymentMethod === value ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                  {icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 mb-1">{label}</div>
                  <div className="text-sm text-slate-600">{desc}</div>
                </div>
                {data.paymentMethod === value && (
                  <CheckCircle2 className="w-6 h-6 text-teal-600 flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-3">
          Podrás agregar más métodos de pago después en tu panel de empresa
        </p>
      </div>

      <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.acceptEscrowTerms}
            onChange={(e) => { onUpdate({ acceptEscrowTerms: e.target.checked }); setError(null); }}
            className="w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-600 mt-0.5"
          />
          <span className="text-sm text-amber-800">
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline">Consultar términos vigentes</a>. Acepto los términos y condiciones del sistema de Escrow, así como la política de comisiones de la plataforma
          </span>
        </label>
      </div>

      <div className="flex gap-4">
        <button type="button" onClick={onBack} className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-2xl hover:bg-slate-50 transition">
          Atrás
        </button>
        <button type="button" onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-blue-900 to-teal-600 text-white font-semibold py-3 rounded-2xl hover:from-blue-800 hover:to-teal-500 transition-all flex items-center justify-center gap-2">
          Continuar
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}