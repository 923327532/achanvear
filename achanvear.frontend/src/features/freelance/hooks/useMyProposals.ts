// features/freelance/hooks/useMyProposals.ts
import { useQuery } from "@tanstack/react-query";
import { freelanceApi } from "../api/freelanceApi";
import type { PaginatedProjects } from "../types/freelance.types";

export function useMyProposals(page: number = 0, size: number = 10) {
  const query = useQuery<PaginatedProjects>({
    queryKey: ["freelance-my-proposals", page, size],
    queryFn: () =>
      freelanceApi.getMyProposals({
        page,
        size,
        sortBy: "submittedAt",
        sortDirection: "DESC",
      }),
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
