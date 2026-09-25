// features/payments/components/MercadoPagoCheckout.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard, Loader2, Shield } from "lucide-react";
import { useCreateDepositIntent, useProcessCulqiPayment } from "../hooks/usePayments";
import type { PaymentIntent } from "../types/payments.types";

// La declaracion global de window.Culqi / window.culqi vive en
// ../types/culqi.d.ts para evitar conflictos de tipos duplicados.

interface Props {
  milestoneId: string;
  projectId: string;
  freelancerUserId: string;
  amount: number;
  projectName: string;
  description?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function MercadoPagoCheckout({
  milestoneId,
  projectId,
  freelancerUserId,
  amount,
  projectName,
  description,
  onSuccess,
  onError,
}: Props) {
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [email, setEmail] = useState("");
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeMilestoneIdRef = useRef(milestoneId);
  const emailRef = useRef(email);

  const { createAsync, isLoading: isCreatingIntent } = useCreateDepositIntent();
  const { processCulqiAsync, isLoading: isProcessing } = useProcessCulqiPayment();

  useEffect(() => {
    emailRef.current = email;
  }, [email]);

  useEffect(() => {
    if (window.Culqi) {
      setIsSdkReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.culqi.com/js/v4";
    script.async = true;
    script.onload = () => setIsSdkReady(true);
    script.onerror = () => setError("No se pudo cargar Culqi Checkout");
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    window.culqi = async () => {
      const token = window.Culqi?.token?.id;
      if (!token) {
        const msg = window.Culqi?.error?.user_message || "No se pudo generar el token de Culqi";
        setError(msg);
        onError?.(msg);
        return;
      }

      try {
        await processCulqiAsync({
          milestoneId: activeMilestoneIdRef.current,
          token,
          email: emailRef.current,
        });
        onSuccess?.();
      } catch (err: any) {
        const msg = err?.message || "Error al procesar el pago con Culqi";
        setError(msg);
        onError?.(msg);
      }
    };

    return () => {
      delete window.culqi;
    };
  }, [onError, onSuccess, processCulqiAsync]);

  const handlePayWithCulqi = async () => {
    setIsCreating(true);
    setError(null);

    try {
      if (!email.trim()) {
        throw new Error("Ingresa el correo del pagador");
      }

      if (!window.Culqi || !isSdkReady) {
        throw new Error("Culqi Checkout aun no esta listo");
      }

      const intent = await createAsync({
        milestoneId,
        projectId,
        freelancerUserId,
        title: projectName,
        description,
        amount,
        clientEmail: email.trim(),
      });

      setPaymentIntent(intent);
      activeMilestoneIdRef.current = intent.milestoneId || milestoneId;

      window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || "";
      window.Culqi.settings({
        title: "Achanvear",
        currency: "PEN",
        amount: Math.round(amount * 100),
        order: intent.preference?.preferenceId || intent.milestoneId,
      });
      window.Culqi.options({
        lang: "es",
        installments: false,
        paymentMethods: {
          tarjeta: true,
          yape: true,
          bancaMovil: false,
          agente: false,
          billetera: false,
          cuotealo: false,
        },
      });
      window.Culqi.open();
    } catch (err: any) {
      const msg = err?.message || "Error al iniciar el pago con Culqi";
      setError(msg);
      onError?.(msg);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">Pago seguro con Culqi</p>
            <p className="mt-1 text-xs text-emerald-700">
              El dinero queda retenido en garantia hasta la aprobacion de la entrega.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="mb-1 text-sm text-gray-500">Monto a pagar</p>
        <p className="text-3xl font-bold text-[#1B3A6B]">
          S/. {amount.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
        </p>
        <p className="mt-1 text-xs text-gray-400">{projectName}</p>
      </div>

      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="correo@empresa.com"
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
      />

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-3">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handlePayWithCulqi}
        disabled={isCreating || isCreatingIntent || isProcessing || !isSdkReady}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A19B] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#087F79] disabled:opacity-50"
      >
        {isCreating || isCreatingIntent || isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Procesando pago...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Pagar con Culqi
          </>
        )}
      </button>

      {paymentIntent && (
        <p className="text-center text-xs text-gray-400">Intento creado: {paymentIntent.milestoneId}</p>
      )}
    </div>
  );
}
