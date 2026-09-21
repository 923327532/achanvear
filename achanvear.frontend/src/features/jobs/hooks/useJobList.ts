// features/jobs/hooks/useJobList.ts
import { useQuery } from "@tanstack/react-query";
import { jobApi } from "../api/jobApi";
import { useJobFiltersStore } from "../store/useJobFiltersStore";
import type { PaginatedJobs } from "../types/job.types";

export function useJobList() {
  const filters = useJobFiltersStore((state) => state.filters);

  const query = useQuery<PaginatedJobs>({
    queryKey: ["jobs", filters],
    queryFn: () => jobApi.getAll(filters),
    staleTime: 1000 * 60 * 2,
    retry: 0,              
    retryDelay: 0,
  });

  return {
    jobs: query.data?.items ?? [],
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