// features/payments/components/PaymentMethodsTab.tsx
"use client";

import { useState } from "react";
import { CreditCard, Plus, Trash2, Star, Loader2 } from "lucide-react";
import { useLocalPaymentMethods, useRemoveLocalMethod, useSetDefaultLocalMethod } from "../hooks/usePayments";
import { AddPaymentMethodModal } from "./AddPaymentMethodModal";
import type { PaymentMethod } from "../types/payments.types";

function MethodIcon({ type }: { type: PaymentMethod["type"] }) {
  if (type === "YAPE") {
    return (
      <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-purple-600">Y</span>
      </div>
    );
  }
  if (type === "PLIN") {
    return (
      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-blue-600">P</span>
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
      <CreditCard className="w-4 h-4 text-slate-600" />
    </div>
  );
}

export function PaymentMethodsTab() {
  const { methods, isLoading, refetch } = useLocalPaymentMethods();
  const { removeAsync, isLoading: isRemoving } = useRemoveLocalMethod();
  const { setDefaultAsync, isLoading: isSettingDefault } = useSetDefaultLocalMethod();
  const [modalOpen, setModalOpen] = useState(false);

  const handleRemove = async (methodId: string) => {
    if (window.confirm("¿Estás seguro de eliminar este método de pago?")) {
      await removeAsync(methodId);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    await setDefaultAsync(methodId);
  };

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {methods.map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <MethodIcon type={method.type} />
              <div>
                <p className="text-sm font-semibold text-gray-800">{method.label}</p>
                <p className="text-xs text-gray-400">{method.detail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {method.isPrimary ? (
                <span className="text-xs font-semibold text-white bg-emerald-500 px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Principal
                </span>
              ) : (
                <button
                  onClick={() => handleSetDefault(method.id)}
                  disabled={isSettingDefault}
                  className="text-xs font-medium text-[#1B3A6B] hover:text-[#0EA5A0] transition-colors"
                >
                  {isSettingDefault ? "..." : "Hacer principal"}
                </button>
              )}
              <button
                onClick={() => handleRemove(method.id)}
                disabled={isRemoving}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}

        {/* Agregar nuevo */}
        <button
          onClick={() => setModalOpen(true)}
          className="w-full flex flex-col items-center justify-center gap-2 border border-dashed border-gray-200 rounded-2xl py-8 text-gray-400 hover:border-[#0EA5A0]/40 hover:text-[#0EA5A0] transition-all"
        >
          <CreditCard className="w-6 h-6" />
          <div className="text-center">
            <p className="text-sm font-medium">Agregar método de pago</p>
            <p className="text-xs">Vincula Yape, Plin o una tarjeta</p>
          </div>
        </button>
      </div>

      <AddPaymentMethodModal open={modalOpen} onClose={() => { setModalOpen(false); refetch(); }} />
    </>
  );
}
