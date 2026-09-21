// features/jobs/components/JobFilters.tsx
"use client";

import { X } from "lucide-react";
import { useJobFiltersStore } from "../store/useJobFiltersStore";
import type { JobType } from "../types/job.types";

interface JobFiltersProps {
  onClose?: () => void;
}

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
];

const LEVELS = [
  { value: "JUNIOR", label: "Junior" },
  { value: "MID", label: "Mid" },
  { value: "SENIOR", label: "Senior" },
];

const MODALITIES = [
  { value: "ON_SITE", label: "Presencial" },
  { value: "REMOTE", label: "Remoto" },
  { value: "HYBRID", label: "Híbrido" },
];

export function JobFilters({ onClose }: JobFiltersProps) {
  const { filters, setFilter, resetFilters } = useJobFiltersStore();

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <span className="text-sm font-semibold text-slate-900">Filtros</span>
        {onClose && (
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Tipo */}
        <div>
          <p className="mb-2.5 text-xs font-semibold text-slate-700">Tipo</p>
          <div className="space-y-2">
            {JOB_TYPES.map((item) => (
              <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.type === item.value}
                  onChange={(e) => setFilter("type", e.target.checked ? item.value : "")}
                  className="h-3.5 w-3.5 rounded border-slate-300 accent-[#1B3A6B]"
                />
                <span className="text-xs text-slate-600">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Experiencia */}
        <div>
          <p className="mb-2.5 text-xs font-semibold text-slate-700">Experiencia</p>
          <div className="space-y-2">
            {LEVELS.map((item) => (
              <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300 accent-[#1B3A6B]" />
                <span className="text-xs text-slate-600">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Modalidad */}
        <div>
          <p className="mb-2.5 text-xs font-semibold text-slate-700">Modalidad</p>
          <div className="space-y-2">
            {MODALITIES.map((item) => (
              <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300 accent-[#1B3A6B]" />
                <span className="text-xs text-slate-600">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Salario */}
        <div>
          <p className="mb-2.5 text-xs font-semibold text-slate-700">Salario</p>
          <div className="space-y-2">
            <input type="number" placeholder="Mínimo (S/.)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-[#1B3A6B]" />
            <input type="number" placeholder="Máximo (S/.)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-[#1B3A6B]" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        <button type="button" onClick={resetFilters}
          className="w-full rounded-lg border border-slate-300 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}