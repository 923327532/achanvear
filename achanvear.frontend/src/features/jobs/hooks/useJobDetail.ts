// features/jobs/hooks/useJobDetail.ts
import { useQuery } from "@tanstack/react-query";
import { jobApi } from "../api/jobApi";
import type { Job } from "../types/job.types";

export function useJobDetail(id: string) {
  const query = useQuery<Job>({
    queryKey: ["job-detail", id],  // ← separado de ["jobs"] para evitar colisión
    queryFn: () => jobApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    job: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}