// features/jobs/hooks/useCandidateDrawerDetail.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { candidateDrawerApi } from "../api/candidateDrawerApi";
import type {
  CandidateDrawerDetail,
  AdvanceCandidatePayload,
} from "../types/candidate-drawer.types";

/**
 * Hook que obtiene el detalle completo de un candidato para el drawer lateral.
 * El endpoint /jobs/{jobId}/applicants/{applicationId}/detail es un agregador
 * que junta datos de jobs/freelance, hiring, interview y S3.
 *
 * Solo se activa cuando jobId y applicationId son válidos.
 */
export function useCandidateDrawerDetail(
  jobId: string | undefined,
  applicationId: string | undefined
) {
  const query = useQuery<CandidateDrawerDetail>({
    queryKey: ["candidate-drawer-detail", jobId, applicationId],
    queryFn: () => candidateDrawerApi.getDetail(jobId!, applicationId!),
    enabled: !!jobId && !!applicationId,
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: 1,
  });

  return {
    detail: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para avanzar o descartar un candidato en el pipeline.
 * Invalida la query del detalle y la lista de postulantes.
 */
export function useAdvanceCandidate(jobId: string | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      applicationId,
      payload,
    }: {
      applicationId: string;
      payload: AdvanceCandidatePayload;
    }) => candidateDrawerApi.advanceCandidate(jobId!, applicationId, payload),
    onSuccess: () => {
      // Invalidar detalle del drawer y lista de postulantes
      queryClient.invalidateQueries({
        queryKey: ["candidate-drawer-detail", jobId],
      });
      queryClient.invalidateQueries({
        queryKey: ["job-applicants", jobId],
      });
    },
  });

  return {
    advance: mutation.mutate,
    advanceAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}
