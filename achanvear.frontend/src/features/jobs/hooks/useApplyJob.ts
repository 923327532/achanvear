// features/jobs/hooks/useApplyJob.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../api/jobApi";
import type { ApplyJobPayload } from "../types/job.types";

export function useApplyJob(jobId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: ApplyJobPayload) => jobApi.apply(jobId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-detail", jobId] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      // Actualizar el caché de applied-job-ids inmediatamente
      const currentIds = queryClient.getQueryData<string[]>(["applied-job-ids"]) ?? [];
      if (!currentIds.includes(jobId)) {
        queryClient.setQueryData(["applied-job-ids"], [...currentIds, jobId]);
      }
    },

  });



  return {
    apply: mutation.mutate,
    applyAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}