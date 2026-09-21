// features/profile/hooks/useCv.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cvApi } from "../api/cvApi";
import type { CvInfo, CvGeneratedResponse, CvEditSectionRequest } from "../types/cv.types";

// ─── Query keys ───────────────────────────────────────────────────────────────

const CV_QUERY_KEY = ["cv", "info"];
const CV_GENERATED_KEY = ["cv", "generated"];


// ─── useCvInfo ────────────────────────────────────────────────────────────────

/**
 * Hook que devuelve el estado actual del CV del usuario.
 * Se actualiza automáticamente cada 5 minutos y al hacer mutate.
 */
export function useCvInfo() {
  const query = useQuery<CvInfo>({
    queryKey: CV_QUERY_KEY,
    queryFn: () => cvApi.getCvInfo(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  });

  return {
    cvInfo: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ─── useUploadCv ──────────────────────────────────────────────────────────────

/**
 * Hook mutation para subir un archivo CV.
 * Invalida la query de CV al completar para refrescar los datos.
 */
export function useUploadCv() {
  const queryClient = useQueryClient();

  const mutation = useMutation<CvInfo, Error, File>({
    mutationFn: (file: File) => cvApi.uploadCv(file),
    onSuccess: (newCvInfo) => {
      // Actualizar cache con los nuevos datos
      queryClient.setQueryData<CvInfo>(CV_QUERY_KEY, newCvInfo);
      // Invalidar también el perfil para que se refresque
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
    onError: (_error) => {
      // En caso de error, invalidar para forzar refetch
      queryClient.invalidateQueries({ queryKey: CV_QUERY_KEY });
    },
  });

  return {
    uploadAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ─── useRemoveCv ──────────────────────────────────────────────────────────────

/**
 * Hook mutation para eliminar el CV del perfil.
 */
export function useRemoveCv() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, void>({
    mutationFn: () => cvApi.removeCv(),
    onSuccess: () => {
      // Actualizar cache local con estado "none"
      queryClient.setQueryData<CvInfo>(CV_QUERY_KEY, {
        status: "none",
        source: "unknown",
        lastUpdated: null,
        url: null,
        fileName: null,
        cvData: null,
      });

      // Invalidar perfil
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });

  return {
    removeAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  };
}

// ─── useGenerateCvWithAi ─────────────────────────────────────────────────────

/**
 * Hook mutation para generar un CV con IA usando los datos del perfil.
 */
export function useGenerateCvWithAi() {
  const queryClient = useQueryClient();

  const mutation = useMutation<CvGeneratedResponse, Error, void>({
    mutationFn: () => cvApi.generateCvWithAi(),
    onSuccess: (cv) => {
      queryClient.setQueryData<CvGeneratedResponse>(CV_GENERATED_KEY, cv);
      // También actualizar el estado del CV para que aparezca como "Con CV"
      queryClient.setQueryData<CvInfo>(CV_QUERY_KEY, {
        status: "generated",
        source: "ai",
        lastUpdated: new Date().toISOString(),
        url: null,
        fileName: "CV_Generado.pdf",
        cvData: cv,
      });

    },

  });

  return {
    generateAsync: mutation.mutateAsync,
    generatedCv: mutation.data ?? null,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}


// ─── useSaveCv ───────────────────────────────────────────────────────────────

/**
 * Hook mutation para guardar/actualizar el CV editado manualmente.
 */
export function useSaveCv() {
  const queryClient = useQueryClient();

  const mutation = useMutation<CvInfo, Error, any>({
    mutationFn: (data: any) => cvApi.saveCv(data),
    onSuccess: (newCvInfo) => {
      // Actualizar cache local con el nuevo estado del CV
      queryClient.setQueryData<CvInfo>(CV_QUERY_KEY, newCvInfo);
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });

  return {
    saveAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}


// ─── useEditCvSection ────────────────────────────────────────────────────────


/**
 * Hook mutation para editar una sección específica del CV con IA.
 */
export function useEditCvSection() {
  const queryClient = useQueryClient();

  const mutation = useMutation<CvGeneratedResponse, Error, CvEditSectionRequest>({
    mutationFn: (request: CvEditSectionRequest) => cvApi.editCvSection(request),
    onSuccess: (cv) => {
      queryClient.setQueryData<CvGeneratedResponse>(CV_GENERATED_KEY, cv);
    },
  });

  return {
    editAsync: mutation.mutateAsync,
    editedCv: mutation.data ?? null,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}


