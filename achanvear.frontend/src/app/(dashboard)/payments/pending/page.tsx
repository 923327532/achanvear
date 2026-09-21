// app/(dashboard)/payments/pending/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Clock, ArrowLeft } from "lucide-react";

export default function PaymentPendingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Pago pendiente</h2>
        <p className="text-sm text-gray-500 mb-6">
          El pago está siendo procesado. Te notificaremos cuando se complete.
        </p>
        <button
          onClick={() => router.push("/payments")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl px-6 py-3 hover:bg-[#0EA5A0] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Ir a mis pagos
        </button>
      </div>
    </div>
  );
}
