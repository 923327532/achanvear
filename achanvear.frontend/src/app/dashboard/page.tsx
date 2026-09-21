// app/dashboard/page.tsx
// Ruta de respaldo "/dashboard": redirige al usuario a la sección que le
// corresponde según su rol. Ningún perfil debe quedar en una ruta equivocada.
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { homeRouteForRole } from "@/lib/constants";

export default function DashboardRedirectPage() {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "UNAUTHENTICATED") {
      router.replace("/login");
    } else if (user) {
      router.replace(homeRouteForRole(user.role));
    }
  }, [status, user, router]);

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3A6B] border-t-transparent" />
    </div>
  );
}
