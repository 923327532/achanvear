// features/freelance/hooks/useMyProposals.ts
import { useQuery } from "@tanstack/react-query";
import { freelanceApi } from "../api/freelanceApi";
import type { PaginatedProjects } from "../types/freelance.types";

export function useMyProposals(page: number = 0, size: number = 10) {
  const query = useQuery<PaginatedProjects>({
    queryKey: ["freelance-my-proposals", page, size],
    queryFn: async () => {
      const first = await freelanceApi.getMyProposals({
        page: 0,
        size: 100,
        sortBy: "submittedAt",
        sortDirection: "DESC",
      });
      const items = [...first.items];
      for (let nextPage = 1; nextPage < first.totalPages; nextPage++) {
        const next = await freelanceApi.getMyProposals({ page: nextPage, size: 100, sortBy: "submittedAt", sortDirection: "DESC" });
        items.push(...next.items);
      }
      return { ...first, items };
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    projects: query.data?.items ?? [],
    totalItems: query.data?.totalItems ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    currentPage: query.data?.currentPage ?? 0,
    isFirst: query.data?.first ?? true,
    isLast: query.data?.last ?? true,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
