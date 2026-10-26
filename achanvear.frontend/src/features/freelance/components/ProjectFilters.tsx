// features/freelance/components/ProjectFilters.tsx
"use client";

import { X } from "lucide-react";
import { useProjectFiltersStore } from "../store/useProjectFiltersStore";
import { PROJECT_CATEGORIES } from "../types/freelance.types";

interface ProjectFiltersProps {
  onClose?: () => void;
}

const DURATIONS = [
  { value: "LESS_THAN_1_WEEK", label: "Menos de 1 semana" },
  { value: "1_2_WEEKS",        label: "De 7 a 14 días" },
  { value: "2_4_WEEKS",        label: "De 15 a 30 días" },
  { value: "MORE_THAN_1_MONTH", label: "Más de 30 días" },
];

export function ProjectFilters({ onClose }: ProjectFiltersProps) {
  const { filters, setFilter, resetFilters } = useProjectFiltersStore();

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <span className="text-sm font-semibold text-slate-900">Filtros</span>
        {onClose && (
          <button type="button" aria-label="Cerrar filtros" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Presupuesto */}
        <div>
          <p className="mb-2.5 text-xs font-semibold text-slate-700">Presupuesto</p>
          <div className="space-y-2">
            <input
              type="number"
              min={0}
              aria-label="Presupuesto mínimo"
              value={filters.budgetMin ?? ""}
              onChange={e => setFilter("budgetMin", e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)))}
              placeholder="Mínimo"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-[#0EA5A0]"
            />
            <input
              type="number"
              min={0}
              aria-label="Presupuesto máximo"
              value={filters.budgetMax ?? ""}
              onChange={e => setFilter("budgetMax", e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)))}
              placeholder="Máximo"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-[#0EA5A0]"
            />
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">Importes en la moneda de cada proyecto.</p>
          {filters.budgetMin !== undefined && filters.budgetMax !== undefined && filters.budgetMin > filters.budgetMax && <p role="alert" className="mt-2 text-xs text-red-600">El máximo debe ser mayor o igual al mínimo.</p>}
        </div>

        {/* Duración */}
        <div>
          <p className="mb-2.5 text-xs font-semibold text-slate-700">Duración</p>
          <div className="space-y-2">
            {DURATIONS.map((item) => (
              <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.duration === item.value}
                  onChange={e => setFilter("duration", e.target.checked ? item.value as import("../types/freelance.types").ProjectDuration : "")}
                  className="h-3.5 w-3.5 rounded border-slate-300 accent-[#0EA5A0]"
                />
                <span className="text-xs text-slate-600">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Categoría */}
        <div>
          <p className="mb-2.5 text-xs font-semibold text-slate-700">Categoría</p>
          <div className="space-y-2">
            {PROJECT_CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.category === cat}
                  onChange={(e) => setFilter("category", e.target.checked ? cat : "")}
                  className="h-3.5 w-3.5 rounded border-slate-300 accent-[#0EA5A0]"
                />
                <span className="text-xs text-slate-600">{cat}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        <button
          type="button"
          onClick={resetFilters}
          className="w-full rounded-lg border border-slate-300 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
