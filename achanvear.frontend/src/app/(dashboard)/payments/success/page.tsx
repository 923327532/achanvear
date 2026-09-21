// app/(dashboard)/payments/success/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { useProcessPayment } from "@/features/payments/hooks/usePayments";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const milestoneId = searchParams.get("milestoneId");
  const paymentId = searchParams.get("payment_id");
  const preferenceId = searchParams.get("preference_id");
  const { processAsync, isLoading } = useProcessPayment();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (milestoneId && paymentId && preferenceId) {
      processAsync({ milestoneId, mpPaymentId: paymentId, mpPreferenceId: preferenceId })
        .then(() => setStatus("success"))
        .catch((err) => {
          setStatus("error");
          setErrorMsg(err?.message || "Error al procesar el pago");
        });
    } else {
      setStatus("success");
    }
  }, [milestoneId, paymentId, preferenceId, processAsync]);

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md text-center">
        {status === "processing" && (
          <>
            <Loader2 className="w-12 h-12 text-[#1B3A6B] animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-800 mb-2">Procesando tu pago...</h2>
            <p className="text-sm text-gray-500">Estamos verificando la transacción con Mercado Pago</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">¡Pago exitoso!</h2>
            <p className="text-sm text-gray-500 mb-6">
              El dinero ha sido retenido de forma segura. Se liberará al freelancer cuando confirmes la entrega.
            </p>
            <button
              onClick={() => router.push("/payments")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl px-6 py-3 hover:bg-[#0EA5A0] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Ir a mis pagos
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Error al procesar el pago</h2>
            <p className="text-sm text-red-500 mb-6">{errorMsg || "Ocurrió un error inesperado"}</p>
            <button
              onClick={() => router.push("/payments")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl px-6 py-3 hover:bg-[#0EA5A0] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a pagos
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-4"><Loader2 className="w-8 h-8 text-[#1B3A6B] animate-spin" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}