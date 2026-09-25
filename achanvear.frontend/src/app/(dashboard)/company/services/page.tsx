// app/(dashboard)/company/services/page.tsx
import { ExploreServicesTab } from "@/features/services/components/ExploreServicesTab";

export default function Page() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B3A6B]">Servicios de Freelancers</h1>
        <p className="text-sm text-gray-500 mt-1">
          Explora servicios profesionales ofrecidos por freelancers verificados
        </p>
      </div>
      <ExploreServicesTab />
    </div>
  );
}
