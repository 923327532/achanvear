// features/settings/components/FinancesSection.tsx
"use client";

import { useState } from "react";
import { CreditCard, Loader2, Plus, Trash2, Star, Check } from "lucide-react";
import { useCommissions, useUpdateFinances } from "../hooks/useSettings";
import {
  usePayoutMethods,
  useRemovePayoutMethod,
  useSetDefaultPayoutMethod,
} from "@/features/payments/hooks/usePayments";
import { AddPayoutMethodModal } from "@/features/payments/components/AddPayoutMethodModal";
import type { PreferredCurrency } from "../types/settings.types";

interface Props {
  profile: any; // idealmente tipar con SettingsProfile exportado de settingsApi
}

export function FinancesSection({ profile }: Props) {
  const [currency, setCurrency] = useState<PreferredCurrency>(
    (profile?.preferredCurrency as PreferredCurrency) ?? "PEN"
  );
  const [saved, setSaved] = useState(false);
  const [methodModalOpen, setMethodModalOpen] = useState(false);

  const { commissions, isLoading: loadingCommissions } = useCommissions();
  const { updateAsync: updateFinances, isLoading: isSaving } = useUpdateFinances(profile);
  const { methods, isLoading: loadingMethods } = usePayoutMethods();
  const { removeAsync } = useRemovePayoutMethod();
  const { setDefaultAsync } = useSetDefaultPayoutMethod();

  const handleSave = async () => {
    await updateFinances({ preferredCurrency: currency });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemove = async (id: string) => {
    await removeAsync(id);
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAsync(id);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-bold text-[#1B3A6B]">Finanzas y Pagos</h2>

      {/* Moneda preferida */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Moneda Preferida</label>
        <div className="flex items-center gap-3">
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
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Método de retiro</label>
            <p className="text-xs text-gray-400 mt-0.5">
              Configura la tarjeta donde recibirás tus ganancias cuando solicites un retiro.
            </p>
          </div>
          <button
            onClick={() => setMethodModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1B3A6B] px-3.5 py-2 rounded-xl hover:bg-[#0EA5A0] transition-colors whitespace-nowrap"
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
          <div className="space-y-3">
            {methods.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50"
              >
                <div className="p-2.5 bg-white text-[#1B3A6B] rounded-lg shadow-sm">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
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
                <div className="flex items-center gap-1">
                  {!m.isDefault && (
                    <button
                      onClick={() => handleSetDefault(m.id)}
                      title="Hacer principal"
                      className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(m.id)}
                    title="Eliminar"
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial de comisiones */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Historial de Comisiones (3%)
        </label>
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Fecha</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Proyecto</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Monto Bruto</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Comisión 3%</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Monto Neto</th>
              </tr>
            </thead>
            <tbody>
              {loadingCommissions ? (
                <tr>
                  <td colSpan={5} className="text-center py-6">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : commissions.map((c, i) => (
                <tr key={i} className="border-t border-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{c.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{c.project}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">
                    S/. {c.grossAmount.toLocaleString("es-PE")}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-500 text-right whitespace-nowrap">
                    -S/. {(c.grossAmount * c.commissionPct / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#0EA5A0] text-right whitespace-nowrap">
                    S/. {c.netAmount.toLocaleString("es-PE")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] px-5 py-2.5 rounded-xl hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
          {saved ? "Guardado" : "Guardar Cambios"}
        </button>
      </div>

      <AddPayoutMethodModal open={methodModalOpen} onClose={() => setMethodModalOpen(false)} />
    </div>
  );
}
