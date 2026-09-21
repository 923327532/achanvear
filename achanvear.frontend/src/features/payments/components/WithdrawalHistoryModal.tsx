// features/payments/components/WithdrawalHistoryModal.tsx
"use client";

import { X, History, Clock, CheckCircle, XCircle } from "lucide-react";
import { useRechargeHistory } from "../hooks/usePayments";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function WithdrawalHistoryModal({ open, onClose }: Props) {
  const { recharges, isLoading } = useRechargeHistory();

  if (!open) return null;

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: {
      label: "Pendiente",
      color: "text-amber-600 bg-amber-50",
      icon: <Clock className="w-3 h-3" />,
    },
    COMPLETED: {
      label: "Completado",
      color: "text-emerald-600 bg-emerald-50",
      icon: <CheckCircle className="w-3 h-3" />,
    },
    FAILED: {
      label: "Fallido",
      color: "text-red-600 bg-red-50",
      icon: <XCircle className="w-3 h-3" />,
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#1B3A6B]" />
            <h2 className="text-base font-bold text-[#1B3A6B]">Historial de recargas</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          {isLoading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : recharges.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No hay recargas registradas</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {recharges.map((r) => {
                const cfg = statusConfig[r.status] ?? statusConfig.PENDING;
                return (
                  <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        S/. {r.amount.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {r.method} {r.completedAt ? `· ${new Date(r.completedAt).toLocaleDateString("es-PE")}` : ""}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
