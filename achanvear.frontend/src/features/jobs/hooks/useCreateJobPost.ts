// features/jobs/hooks/useCreateJobPost.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../api/jobApi";
import type { CreateJobPayload } from "../types/job.types";

export function useCreateJobPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateJobPayload) => jobApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["my-job-posts"] });
    },
  });
}
