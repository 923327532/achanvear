// features/freelance/store/useProjectFiltersStore.ts
import { create } from "zustand";
import type { ProjectFilters } from "../types/freelance.types";
import { DEFAULT_PROJECT_FILTERS } from "../types/freelance.types";

interface ProjectFiltersStore {
  filters: ProjectFilters;
  setFilter: <K extends keyof ProjectFilters>(key: K, value: ProjectFilters[K]) => void;
  setFilters: (filters: Partial<ProjectFilters>) => void;
  resetFilters: () => void;
}

export const useProjectFiltersStore = create<ProjectFiltersStore>((set) => ({
  filters: DEFAULT_PROJECT_FILTERS,

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value, page: 0 },
    })),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 0 },
    })),

  resetFilters: () => set({ filters: DEFAULT_PROJECT_FILTERS }),
}));