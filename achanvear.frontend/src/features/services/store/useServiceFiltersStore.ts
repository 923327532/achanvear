// features/services/store/useServiceFiltersStore.ts
import { create } from "zustand";
import type { ServiceFilters, ServiceCategory } from "../types/service.types";

interface ServiceFiltersState {
  filters: ServiceFilters;
  setSearch: (search: string) => void;
  setCategory: (category: ServiceCategory | "ALL") => void;
  setPage: (page: number) => void;
  reset: () => void;
}

const DEFAULT_FILTERS: ServiceFilters = {
  search: "",
  category: "ALL",
  page: 0,
  size: 12,
};

export const useServiceFiltersStore = create<ServiceFiltersState>((set) => ({
  filters: DEFAULT_FILTERS,

  setSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search, page: 0 } })),

  setCategory: (category) =>
    set((state) => ({ filters: { ...state.filters, category, page: 0 } })),

  setPage: (page) =>
    set((state) => ({ filters: { ...state.filters, page } })),

  reset: () => set({ filters: DEFAULT_FILTERS }),
}));