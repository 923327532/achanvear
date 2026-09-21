// features/profile/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profileApi";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";
import type { FreelancerProfile, StorageFolder } from "../types/profile.types";

export function useMyProfile() {
  const query = useQuery({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      try {
        return await profileApi.getMyProfile();
      } catch (error: any) {
        if (error?.status === 404) return null;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      profileId,
      payload,
    }: {
      profileId: string;
      payload: Partial<FreelancerProfile>;
    }) => {
      // Intenta usar el cache primero; si no existe o está vacío, lo pide
      // fresco antes de continuar. Esto evita mandar un payload incompleto
      // silenciosamente cuando el componente que guarda se monta sin que
      // useMyProfile() se haya ejecutado antes en un padre.
      let current = queryClient.getQueryData<FreelancerProfile>(["profile", "me"]);

      if (!current) {
        current = await queryClient.fetchQuery({
          queryKey: ["profile", "me"],
          queryFn: () => profileApi.getMyProfile(),
        });
      }

      const filteredPayload = Object.fromEntries(
        Object.entries(payload).filter(([key, value]) => {
          if (Array.isArray(value)) return true;
          if (value === null) return true;
          if (typeof value === "string" && value.trim() !== "") return true;
          if (typeof value === "number") return true;
          if (typeof value === "boolean") return true;
          return false;
        })
      );

      const fullPayload = {
        ...(current?.name              ? { name: current.name }              : {}),
        ...(current?.industry          ? { industry: current.industry }      : {}),
        ...(current?.specialty         ? { specialty: current.specialty }    : {}),
        ...(current?.biography         ? { biography: current.biography }    : {}),
        ...(current?.achievements      ? { achievements: current.achievements } : {}),
        ...(current?.address           ? { address: current.address }        : {}),
        ...(current?.paymentMethodType ? { paymentMethodType: current.paymentMethodType } : {}),
        ...(current?.dni               ? { dni: current.dni }                : {}),
        ...(current?.profilePhotoUrl   ? { profilePhotoUrl: current.profilePhotoUrl } : {}),
        ...(current?.curriculumUrl     ? { curriculumUrl: current.curriculumUrl } : {}),
        ...(current?.certifications    ? { certifications: current.certifications } : {}),
        ...(current?.skills            ? { skills: current.skills }          : {}),
        ...(current?.portfolioItems    ? { portfolioItems: current.portfolioItems } : {}),
        ...filteredPayload,
      };

      return profileApi.updateProfile(profileId, fullPayload);
    },

    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["profile", "me"], updatedProfile);
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
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

export function useUploadFile() {
  const mutation = useMutation({
    mutationFn: async ({
      file,
      folder,
    }: {
      file: File;
      folder: StorageFolder;
    }): Promise<string> => {
      const { publicFileUrl } = await onboardingService.uploadFile(folder, file);
      return publicFileUrl;
    },
  });

  return {
    uploadAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}