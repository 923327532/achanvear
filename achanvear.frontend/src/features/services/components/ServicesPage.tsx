// features/services/components/ServicesPage.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { MyServicesTab } from "./MyServicesTab";
import { ExploreServicesTab } from "./ExploreServicesTab";
import { DraftsTab } from "./DraftsTab";

type Tab = "my-services" | "explore" | "drafts";

const TABS: { id: Tab; label: string }[] = [
  { id: "my-services", label: "Mis Servicios" },
  { id: "explore", label: "Explorar Servicios" },
  { id: "drafts", label: "Borradores" },
];

export function ServicesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("my-services");

  return (
    <div className="min-h-full bg-gray-50/50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Servicios</h1>
          <p className="text-sm text-gray-500 mt-1">
            Publica tus servicios o contrata a otros profesionales
          </p>
        </div>
        <button
          onClick={() => router.push("/freelancer/my-services/create")}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] px-5 py-2.5 rounded-xl hover:bg-[#0EA5A0] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Crear Nuevo Servicio
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 mb-6">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`relative pb-3 mr-8 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === id
                ? "text-[#1B3A6B] border-[#1B3A6B]"
                : "text-gray-500 hover:text-gray-700 border-transparent"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "my-services" && <MyServicesTab />}
      {activeTab === "explore" && <ExploreServicesTab />}
      {activeTab === "drafts" && <DraftsTab />}
    </div>
  );
}