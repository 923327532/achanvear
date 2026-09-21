// features/services/components/ExploreServicesTab.tsx
// Reutilizable: usado en /freelancer/my-services y en /company/services
"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useExploreServices } from "../hooks/useExploreServices";
import { useServiceFiltersStore } from "../store/useServiceFiltersStore";
import { ExploreServiceCard } from "./ExploreServiceCard";
import { ExploreDetailModal } from "./ExploreDetailModal";
import { HireChatModal } from "./HireChatModal";
import type { ExploreService, ServiceCategory } from "../types/service.types";
import { CATEGORY_LABELS } from "../types/service.types";

const ALL_CATEGORIES: { value: ServiceCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "TECHNOLOGY", label: "Tecnología" },
  { value: "MARKETING", label: "Marketing" },
  { value: "DESIGN", label: "Diseño" },
  { value: "LEGAL", label: "Legal" },
  { value: "ACCOUNTING", label: "Contabilidad" },
  { value: "CONSULTING", label: "Consultoría" },
  { value: "HEALTH", label: "Salud y Bienestar" },
  { value: "EDUCATION", label: "Educación" },
  { value: "CONSTRUCTION", label: "Construcción" },
  { value: "LOGISTICS", label: "Logística" },
];

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 bg-gray-100 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-100 rounded w-24 mb-1" />
          <div className="h-3 bg-gray-100 rounded w-32" />
        </div>
      </div>
      <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-full mb-1" />
      <div className="h-4 bg-gray-100 rounded w-5/6 mb-4" />
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((s) => <div key={s} className="w-3.5 h-3.5 bg-gray-100 rounded" />)}
      </div>
      <div className="h-px bg-gray-100 mb-4" />
      <div className="flex justify-between mb-4">
        <div className="h-7 bg-gray-100 rounded w-20" />
        <div className="h-5 bg-gray-100 rounded w-16" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-gray-100 rounded-xl" />
        <div className="flex-1 h-9 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

export function ExploreServicesTab() {
  const { services, total, isLoading } = useExploreServices();
  const { filters, setSearch, setCategory } = useServiceFiltersStore();

  const [detailModal, setDetailModal] = useState<{ open: boolean; service: ExploreService | null }>({
    open: false,
    service: null,
  });

  const [hireModal, setHireModal] = useState<{ open: boolean; service: ExploreService | null }>({
    open: false,
    service: null,
  });

  const handleHire = (service: ExploreService) => {
    setHireModal({ open: true, service });
  };

  return (
    <>
      {/* Search + select */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar servicios por nombre o descripción..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] bg-white transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={filters.category}
            onChange={(e) => setCategory(e.target.value as ServiceCategory | "ALL")}
            className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] cursor-pointer transition-colors"
          >
            {ALL_CATEGORIES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {ALL_CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setCategory(value)}
            className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-colors ${
              filters.category === value
                ? "bg-[#1B3A6B] text-white border-[#1B3A6B]"
                : "text-gray-600 border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Count */}
      {!isLoading && (
        <p className="text-sm text-gray-500 mb-4">{total} servicios disponibles</p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
        ) : services.length > 0 ? (
          services.map((service) => (
            <ExploreServiceCard
              key={service.id}
              service={service}
              onViewDetail={(s) => setDetailModal({ open: true, service: s })}
              onHire={handleHire}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <p className="text-gray-400 text-sm">No se encontraron servicios con esos criterios.</p>
          </div>
        )}
      </div>

      <ExploreDetailModal
        open={detailModal.open}
        service={detailModal.service}
        onClose={() => setDetailModal({ open: false, service: null })}
        onHire={(s) => {
          setDetailModal({ open: false, service: null });
          handleHire(s);
        }}
      />

      <HireChatModal
        open={hireModal.open}
        service={hireModal.service}
        onClose={() => setHireModal({ open: false, service: null })}
      />
    </>
  );
}