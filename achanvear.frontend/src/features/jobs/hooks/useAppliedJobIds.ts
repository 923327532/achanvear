// features/jobs/hooks/useAppliedJobIds.ts
import { useQuery } from "@tanstack/react-query";
import { jobApi } from "../api/jobApi";

export function useAppliedJobIds() {
  const query = useQuery({
    queryKey: ["applied-job-ids"],
    queryFn: jobApi.getAppliedJobIds,
    staleTime: 0,
    gcTime: 1000 * 60 * 30, // Mantener en caché 30 min
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    appliedJobIds: query.data ?? [],
    isLoading: query.isLoading,
  };
}



