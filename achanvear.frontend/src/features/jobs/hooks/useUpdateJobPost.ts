// features/jobs/hooks/useUpdateJobPost.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../api/jobApi";
import type { CreateJobPayload } from "../types/job.types";

export function useUpdateJobPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateJobPayload> }) =>
      jobApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["my-job-posts"] });
    },
  });
}
