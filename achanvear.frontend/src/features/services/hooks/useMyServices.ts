// features/services/hooks/useMyServices.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceApi } from "../api/serviceApi";
import type { ServiceFormData, Service } from "../types/service.types";

// ─── Mis servicios publicados ─────────────────────────────────────────────────

export function useMyServices() {
  const query = useQuery({
    queryKey: ["services", "my"],
    queryFn: serviceApi.getMyServices,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    services: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

// ─── Borradores ───────────────────────────────────────────────────────────────

export function useMyDrafts() {
  const query = useQuery({
    queryKey: ["services", "drafts"],
    queryFn: serviceApi.getDrafts,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    drafts: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

// ─── Estadísticas ─────────────────────────────────────────────────────────────

export function useServiceStats() {
  const query = useQuery({
    queryKey: ["services", "stats"],
    queryFn: serviceApi.getMyStats,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

// ─── Crear servicio ───────────────────────────────────────────────────────────

export function useCreateService() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ data, publish }: { data: ServiceFormData; publish: boolean }) =>
      serviceApi.create(data, publish),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", "my"] });
      queryClient.invalidateQueries({ queryKey: ["services", "drafts"] });
      queryClient.invalidateQueries({ queryKey: ["services", "stats"] });
    },
  });

  return {
    createAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}

// ─── Editar servicio ──────────────────────────────────────────────────────────

export function useUpdateService() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ServiceFormData> & { status?: Service["status"] };
    }) => serviceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", "my"] });
      queryClient.invalidateQueries({ queryKey: ["services", "stats"] });
    },
  });

  return {
    updateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}

// ─── Eliminar servicio ────────────────────────────────────────────────────────

export function useDeleteService() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => serviceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", "my"] });
      queryClient.invalidateQueries({ queryKey: ["services", "drafts"] });
      queryClient.invalidateQueries({ queryKey: ["services", "stats"] });
    },
  });

  return {
    removeAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}
