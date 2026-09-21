// app/(dashboard)/company/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCompanyDashboard } from "@/features/jobs/hooks/useCompanyDashboard";
import { CompanyDashboardHome } from "@/features/dashboard/components/CompanyDashboardHome";

export default function Page() {
  const router = useRouter();
  const { hasCompany, isLoading } = useCompanyDashboard();

  useEffect(() => {
    // Si el usuario llega aquí sin haber completado el wizard de onboarding
    // (por ejemplo, escribiendo la URL directo), lo mandamos al wizard real
    // en vez de mostrar un formulario alternativo.
    if (!isLoading && !hasCompany) {
      router.replace("/onboarding/company");
    }
  }, [isLoading, hasCompany, router]);

  if (isLoading || !hasCompany) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a8a]" />
      </div>
    );
  }

  return <CompanyDashboardHome />;
}