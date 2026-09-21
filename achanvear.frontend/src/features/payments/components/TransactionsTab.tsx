// features/payments/components/TransactionsTab.tsx
"use client";

import { useWalletTransactions } from "../hooks/usePayments";
import {
  TRANSACTION_TYPE_COLORS,
} from "../types/payments.types";

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-50 rounded-lg mb-1" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 bg-white border-b border-gray-50" />
      ))}
    </div>
  );
}

export function TransactionsTab() {
  const { transactions, isLoading } = useWalletTransactions();

  if (isLoading) return <Skeleton />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-xs font-semibold text-gray-500 py-3 px-4">Fecha</th>
            <th className="text-left text-xs font-semibold text-gray-500 py-3 px-4">Descripción</th>
            <th className="text-left text-xs font-semibold text-gray-500 py-3 px-4">Tipo</th>
            <th className="text-right text-xs font-semibold text-gray-500 py-3 px-4">Monto</th>
            <th className="text-right text-xs font-semibold text-gray-500 py-3 px-4">Saldo anterior</th>
            <th className="text-right text-xs font-semibold text-gray-500 py-3 px-4">Saldo actual</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const typeColor = TRANSACTION_TYPE_COLORS[tx.type] ?? "bg-gray-100 text-gray-600";

            return (
              <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-4 text-xs text-gray-500 whitespace-nowrap">
                  {tx.createdAt
                    ? new Date(tx.createdAt).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </td>
                <td className="py-4 px-4 text-sm text-gray-800 max-w-[200px] truncate">
                  {tx.description}
                </td>
                <td className="py-4 px-4">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeColor}`}>
                    {tx.type === "DEPOSIT" ? "Depósito" :
                     tx.type === "PAYMENT" ? "Pago" :
                     tx.type === "REFUND" ? "Reembolso" :
                     tx.type === "WITHDRAWAL" ? "Retiro" : tx.type}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm font-medium text-right whitespace-nowrap">
                  <span className={tx.type === "DEPOSIT" || tx.type === "REFUND" ? "text-emerald-600" : "text-gray-800"}>
                    {tx.type === "DEPOSIT" || tx.type === "REFUND" ? "+" : "-"}
                    S/. {tx.amount.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500 text-right whitespace-nowrap">
                  S/. {tx.balanceBefore.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-4 text-sm font-bold text-[#0EA5A0] text-right whitespace-nowrap">
                  S/. {tx.balanceAfter.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {transactions.length === 0 && (
        <div className="text-center py-12 text-sm text-gray-400">
          No tienes transacciones aún
        </div>
      )}
    </div>
  );
}
