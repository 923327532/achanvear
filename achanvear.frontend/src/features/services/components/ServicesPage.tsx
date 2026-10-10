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
    // RESPONSIVE: p-4 en celular, p-6 desde sm; min-w-0 para que nada fuerce el ancho
    <div className="min-h-full min-w-0 bg-gray-50/50 p-4 sm:p-6">
      {/* Header */}
      {/* RESPONSIVE: apilado en celular (título arriba, botón abajo); en fila desde sm */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[#1B3A6B] sm:text-2xl">Servicios</h1>
          <p className="mt-1 text-sm text-gray-500">
            Publica tus servicios o contrata a otros profesionales
          </p>
        </div>
        {/* RESPONSIVE: botón de ancho completo en celular, ancho natural desde sm; whitespace-nowrap en desktop */}
        <button
          onClick={() => router.push("/freelancer/my-services/create")}
          className="flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0EA5A0] sm:w-auto sm:whitespace-nowrap"
        >
          <Plus className="h-4 w-4 flex-shrink-0" />
          Crear Nuevo Servicio
        </button>
      </div>

      {/* Tabs */}
      {/* RESPONSIVE: en celular 3 columnas iguales (el texto se parte en 2 líneas y "Borradores" ya no queda oculta);
          desde sm vuelve a fila con separación mr-8 */}
      <div className="mb-6 grid grid-cols-3 border-b border-gray-200 sm:flex sm:items-center">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`relative min-w-0 border-b-2 px-1 pb-3 text-center text-xs font-medium leading-tight transition-colors sm:mr-8 sm:px-0 sm:text-left sm:text-sm sm:whitespace-nowrap ${
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