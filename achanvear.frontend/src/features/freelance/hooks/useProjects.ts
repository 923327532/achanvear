// features/freelance/hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { freelanceApi } from "../api/freelanceApi";
import { useProjectFiltersStore } from "../store/useProjectFiltersStore";
import type { PaginatedProjects, Project, SubmitProposalPayload } from "../types/freelance.types";

export function useProjects() {
  const filters = useProjectFiltersStore((state) => state.filters);

  const query = useQuery<PaginatedProjects>({
    queryKey: ["freelance-projects", filters],
    queryFn: () => freelanceApi.getAll(filters),
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

// ─── useProjectDetail ─────────────────────────────────────────────────────────

export function useProjectDetail(projectId: string) {
  const query = useQuery({
    queryKey: ["freelance-project", projectId],
    queryFn: () => freelanceApi.getById(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    project: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

// ─── useSubmitProposal ────────────────────────────────────────────────────────

export function useSubmitProposal(projectId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: SubmitProposalPayload) =>
      freelanceApi.submitProposal(projectId, payload),
    onSuccess: () => {
      // Actualizar el proyecto en el caché de freelance-projects inmediatamente
      queryClient.setQueriesData<{ items: any[] }>({ queryKey: ["freelance-projects"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((p: any) =>
            p.id === projectId ? { ...p, hasApplied: true } : p
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["freelance-project", projectId] });
    },

  });


  return {
    submit: mutation.mutate,
    submitAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}
