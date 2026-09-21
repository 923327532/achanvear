// app/(dashboard)/payments/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";

/**
 * Ruta genérica de pagos (destino post-pago Mercado Pago).
 * Redirige según el rol del usuario a su sección de pagos correspondiente.
 */
export default function PaymentsRoute() {
  const router = useRouter();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status === "PENDING") return;
    if (status === "UNAUTHENTICATED" || !user) {
      router.replace("/login");
      return;
    }
    const role = (user.role ?? "").toUpperCase();
    if (role === "FREELANCER" || role === "CANDIDATE") {
      router.replace("/freelancer/payments");
    } else if (role === "COMPANY" || role === "COMPANY_COLLABORATOR") {
      router.replace("/company/payments");
    } else {
      router.replace("/dashboard");
    }
  }, [status, user, router]);

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-[#1B3A6B] animate-spin" />
        <p className="text-sm text-slate-500">Redirigiendo a tus pagos...</p>
      </div>
    </div>
  );
}

