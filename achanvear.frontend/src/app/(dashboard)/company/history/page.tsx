// app/(dashboard)/company/history/page.tsx
"use client";

import { useCompanyDashboard } from "@/features/jobs/hooks/useCompanyDashboard";
import { HistoryPage } from "@/features/history/components/HistoryPage";

export default function Page() {
  // Mismo hook que ya usa el layout — React Query reutiliza el cache.
  const { data: dashboard } = useCompanyDashboard();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Historial de la Empresa</h1>
          <p className="text-sm text-gray-500 mt-1">
            Registro de todas las actividades, proyectos y contrataciones realizadas
          </p>
        </div>
        <HistoryPage companyId={dashboard?.companyId || ""} />
      </div>
    </div>
  );
}
