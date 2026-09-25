// features/payments/components/CulqiCardForm.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard, Loader2, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { useSaveCulqiCard } from "../hooks/usePayments";

declare global {
  interface Window {
    Culqi?: {
      publicKey: string;
      settings: (settings: Record<string, unknown>) => void;
      options: (options: Record<string, unknown>) => void;
      open: () => void;
      close: () => void;
      token?: { id: string; email?: string };
      order?: unknown;
      error?: { user_message?: string; merchant_message?: string };
    };
    culqi?: () => void;
  }
}

interface Props {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Formulario que tokeniza la tarjeta usando Culqi Checkout v4.
 *
 * Flujo (segun https://docs.culqi.com/es/documentacion/checkout/v4):
 *  1. Carga el script https://checkout.culqi.com/js/v4
 *  2. Configura Culqi.publicKey + Culqi.settings + Culqi.options
 *  3. Culqi.open() -> el usuario ingresa los datos de su tarjeta
 *  4. El callback window.culqi() entrega Culqi.token.id
 *  5. El token se envia al backend para registrar el cliente y guardar la tarjeta
 */
export function CulqiCardForm({ onSuccess, onError }: Props) {
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [email, setEmail] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const emailRef = useRef(email);
  const nameRef = useRef(cardholderName);
  const phoneRef = useRef(phoneNumber);
  const isProcessingRef = useRef(false);
  const { saveAsync, isLoading } = useSaveCulqiCard();

  useEffect(() => {
    emailRef.current = email;
  }, [email]);
  useEffect(() => {
    nameRef.current = cardholderName;
  }, [cardholderName]);
  useEffect(() => {
    phoneRef.current = phoneNumber;
  }, [phoneNumber]);

  // Cargar el SDK de Culqi Checkout
  useEffect(() => {
    if (window.Culqi) {
      setIsSdkReady(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.culqi.com/js/v4"]'
    );
    if (existing) {
      existing.addEventListener("load", () => setIsSdkReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.culqi.com/js/v4";
    script.async = true;
    script.onload = () => setIsSdkReady(true);
    script.onerror = () => setError("No se pudo cargar Culqi Checkout");
    document.body.appendChild(script);
  }, []);

  // Callback que Culqi invoca tras tokenizar
  useEffect(() => {
    window.culqi = async () => {
      if (isProcessingRef.current) return;

      const token = window.Culqi?.token?.id;
      if (!token) {
        const msg =
          window.Culqi?.error?.user_message ||
          window.Culqi?.error?.merchant_message ||
          "No se pudo generar el token de Culqi";
        setError(msg);
        onError?.(msg);
        return;
      }

      window.Culqi?.close();

      isProcessingRef.current = true;
      setError(null);
      try {
        await saveAsync({
          token,
          email: emailRef.current.trim() || window.Culqi?.token?.email,
          cardholderName: nameRef.current.trim() || undefined,
          phoneNumber: phoneRef.current.trim() || undefined,
        });
        setSuccess(true);
        onSuccess?.();
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Error al guardar la tarjeta";
        setError(msg);
        onError?.(msg);
      } finally {
        isProcessingRef.current = false;
      }
    };

    return () => {
      delete window.culqi;
    };
  }, [onError, onSuccess, saveAsync]);

  const handleOpenCulqi = () => {
    setError(null);

    if (!isSdkReady || !window.Culqi) {
      setError("Culqi Checkout aun no esta listo. Intenta nuevamente.");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || "";
    if (!publicKey) {
      setError("Falta configurar NEXT_PUBLIC_CULQI_PUBLIC_KEY");
      return;
    }

    window.Culqi.publicKey = publicKey;
    window.Culqi.settings({
      title: "Achanvear",
      currency: "PEN",
      // Sin `order`: solo se muestran pagos con tarjeta (comportamiento deseado al guardar la tarjeta)
    });
    window.Culqi.options({
      lang: "es",
      installments: false,
      paymentMethods: {
        tarjeta: true,
        yape: false,
        bancaMovil: false,
        agente: false,
        billetera: false,
        cuotealo: false,
      },
      style: {
        logo: "https://culqi.com/LogoCulqi.png",
        bannerColor: "#1B3A6B",
        buttonBackground: "#00A19B",
        menuColor: "#1B3A6B",
        linksColor: "#00A19B",
        buttonText: "Guardar tarjeta",
        buttonTextColor: "#ffffff",
        priceColor: "#1B3A6B",
      },
    });
    window.Culqi.open();
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-emerald-500" />
        </div>
        <p className="text-sm font-semibold text-gray-800">Tarjeta registrada</p>
        <p className="text-xs text-gray-400">
          Ya puedes usar esta tarjeta para pagar en Achanvear.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
        <Shield className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-emerald-800">Tokenizacion segura con Culqi</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            Los datos de tu tarjeta se ingresan directamente en la pasarela de Culqi. Achanvear
            nunca almacena el numero completo de tu tarjeta.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Correo del titular (opcional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="facturacion@empresa.com"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0EA5A0]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Nombre del titular (opcional)
        </label>
        <input
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Nombre como aparece en la tarjeta"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0EA5A0]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Telefono (opcional)
        </label>
        <div className="flex gap-2">
          <span className="flex items-center px-3 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50">
            +51
          </span>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
            placeholder="987 654 321"
            maxLength={9}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0EA5A0]"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleOpenCulqi}
        disabled={!isSdkReady || isLoading}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl py-3 hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Guardando tarjeta...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            {isSdkReady ? "Agregar tarjeta con Culqi" : "Cargando Culqi..."}
          </>
        )}
      </button>
    </div>
  );
}
