// features/jobs/store/useJobFiltersStore.ts
import { create } from "zustand";
import type { JobFilters } from "../types/job.types";
import { DEFAULT_JOB_FILTERS } from "../types/job.types";

interface JobFiltersStore {
  filters: JobFilters;
  setFilter: <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => void;
  setFilters: (filters: Partial<JobFilters>) => void;
  resetFilters: () => void;
}

export const useJobFiltersStore = create<JobFiltersStore>((set) => ({
  filters: DEFAULT_JOB_FILTERS,

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value, page: 0 }, // reset page on filter change
    })),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 0 },
    })),

  resetFilters: () => set({ filters: DEFAULT_JOB_FILTERS }),
}));