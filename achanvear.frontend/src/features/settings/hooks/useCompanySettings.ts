// features/settings/hooks/useCompanySettings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companySettingsApi } from "../api/companySettingsApi";
import type { CompanyProfile } from "@/features/profile/types/profile.types";
import type { TeamMember } from "../types/company-settings.types";

// ─── Perfil de empresa ─────────────────────────────────────────────────────────

export function useCompanyProfile() {
  const query = useQuery({
    queryKey: ["company-settings", "profile"],
    queryFn: companySettingsApi.getCompanyProfile,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });

  return {
    company: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

// ─── Actualizar perfil de empresa ──────────────────────────────────────────────

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        businessName: string;
        tradeName?: string;
        legalName: string;
        industry: string;
        specialty: string;
        companySize: string;
        logoUrl?: string;
        bannerUrl?: string;
        biography: string;
        achievements?: string;
        address: string;
        paymentMethodType: string;
        companyPlan: string;
      };
    }) => companySettingsApi.updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["company-profile"] });
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

// ─── Planes disponibles ────────────────────────────────────────────────────────

export function useAvailablePlans() {
  const query = useQuery({
    queryKey: ["company-settings", "plans"],
    queryFn: companySettingsApi.getAvailablePlans,
    staleTime: 1000 * 60 * 10,
    retry: 0,
  });

  return {
    plans: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

// ─── Plan actual ───────────────────────────────────────────────────────────────

export function useCurrentPlan() {
  const query = useQuery({
    queryKey: ["company-settings", "current-plan"],
    queryFn: companySettingsApi.getCurrentPlan,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });

  return {
    currentPlan: query.data ?? null,
    isLoading: query.isLoading,
  };
}

// ─── Suscribirse a un plan ─────────────────────────────────────────────────────

export function useSubscribeToPlan() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ plan, companyEmail }: { plan: string; companyEmail: string }) =>
      companySettingsApi.subscribeToPlan(plan, companyEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings", "current-plan"] });
      queryClient.invalidateQueries({ queryKey: ["company-settings", "plans"] });
    },
  });

  return {
    subscribeAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
  };
}

// ─── Comprar un paquete de créditos (Mercado Pago) ────────────────────────────

export function useCheckoutCreditPackage() {
  const mutation = useMutation({
    mutationFn: ({ packageId, clientEmail }: { packageId: string; clientEmail: string }) =>
      companySettingsApi.checkoutCreditPackage(packageId, clientEmail),
  });

  return {
    checkoutAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
  };
}

// ─── Métodos de pago ──────────────────────────────────────────────────────────

export function useCompanyPaymentMethods(companyId: string | undefined) {
  const query = useQuery({
    queryKey: ["company-settings", "payment-methods", companyId],
    queryFn: () => companySettingsApi.getPaymentMethods(companyId!),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });

  return {
    paymentMethods: query.data ?? [],
    isLoading: query.isLoading,
  };
}

// ─── Colaboradores / Team ──────────────────────────────────────────────────────

export function useCollaborators() {
  const query = useQuery({
    queryKey: ["company-settings", "collaborators"],
    queryFn: companySettingsApi.getCollaborators,
    staleTime: 1000 * 60 * 2,
    retry: 0,
  });

  return {
    collaborators: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useInviteCollaborator() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { email: string; fullName: string }) =>
      companySettingsApi.inviteCollaborator(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings", "collaborators"] });
    },
  });

  return {
    inviteAsync: mutation.mutateAsync as (data: { email: string; fullName: string }) => Promise<TeamMember & { tempPassword?: string }>,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useRemoveCollaborator() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (collaboratorId: string) =>
      companySettingsApi.removeCollaborator(collaboratorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings", "collaborators"] });
    },
  });

  return {
    removeAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export function useDeactivateCollaborator() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (collaboratorId: string) =>
      companySettingsApi.deactivateCollaborator(collaboratorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings", "collaborators"] });
    },
  });

  return {
    deactivateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

// ─── Cambiar contraseña ────────────────────────────────────────────────────────

export function useCompanyChangePassword() {
  const mutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      companySettingsApi.changePassword(data),
  });

  return {
    changeAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}

// ─── Credit Packages ───────────────────────────────────────────────────────────

export function useCreditPackages() {
  const query = useQuery({
    queryKey: ["company-settings", "credit-packages"],
    queryFn: companySettingsApi.getCreditPackages,
    staleTime: 1000 * 60 * 10,
    retry: 0,
  });

  return {
    creditPackages: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

// ─── Payments Overview ─────────────────────────────────────────────────────────

export function usePaymentsOverview() {
  const query = useQuery({
    queryKey: ["company-settings", "payments-overview"],
    queryFn: companySettingsApi.getPaymentsOverview,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });

  return {
    overview: query.data ?? null,
    isLoading: query.isLoading,
  };
}

// ─── Wallet ────────────────────────────────────────────────────────────────────

export function useWallet() {
  const query = useQuery({
    queryKey: ["company-settings", "wallet"],
    queryFn: companySettingsApi.getWallet,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });

  return {
    wallet: query.data ?? null,
    isLoading: query.isLoading,
  };
}

// ─── Privacidad ────────────────────────────────────────────────────────────────

export function usePrivacySettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["company-settings", "privacy"],
    queryFn: companySettingsApi.getPrivacySettings,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });

  const mutation = useMutation({
    mutationFn: (data: import("../types/company-settings.types").PrivacySettings) =>
      companySettingsApi.updatePrivacySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings", "privacy"] });
    },
  });

  return {
    settings: query.data ?? { incognitoMode: false, showContactInfo: true, showInDirectory: true, visibilityNotifications: false },
    isLoading: query.isLoading,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
