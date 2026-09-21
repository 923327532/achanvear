// app/(dashboard)/payments/failure/page.tsx
"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

function PaymentFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const milestoneId = searchParams.get("milestoneId");

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Pago no completado</h2>
        <p className="text-sm text-gray-500 mb-6">
          El pago no pudo ser procesado. Puedes intentarlo nuevamente o usar otro método de pago.
        </p>
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={() => router.push("/payments")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl px-5 py-3 hover:bg-[#0EA5A0] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <button
            onClick={() => router.push(`/payments?retry=${milestoneId}`)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B3A6B] border border-[#1B3A6B] rounded-xl px-5 py-3 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B3A6B]" /></div>}>
      <PaymentFailureContent />
    </Suspense>
  );
}