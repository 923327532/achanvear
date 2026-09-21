// features/settings/hooks/useSettings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api/settingsApi";
import type { AvailabilityStatus, PreferredCurrency, PaymentMethodType } from "../types/settings.types";

type SettingsProfile = Awaited<ReturnType<typeof settingsApi.getMyProfile>>;

// ─── Mi perfil (se carga UNA vez, en SettingsPage) ───────────────────────────

export function useSettingsProfile() {
  const query = useQuery({
    queryKey: ["settings", "profile"],
    queryFn: settingsApi.getMyProfile,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

// ─── Helper interno: arma el payload completo a partir del profile YA CARGADO ─
// Ya no busca nada en cache — recibe el profile directo como argumento.

function buildFullPayload(profile: SettingsProfile, partialPayload: Record<string, unknown>) {
  return {
    ...(profile.name              ? { name: profile.name }              : {}),
    ...(profile.industry          ? { industry: profile.industry }      : {}),
    ...(profile.specialty         ? { specialty: profile.specialty }    : {}),
    ...(profile.biography         ? { biography: profile.biography }    : {}),
    ...(profile.achievements      ? { achievements: profile.achievements } : {}),
    ...(profile.address           ? { address: profile.address }        : {}),
    ...(profile.paymentMethodType ? { paymentMethodType: profile.paymentMethodType } : {}),
    ...(profile.dni               ? { dni: profile.dni }                : {}),
    ...(profile.profilePhotoUrl   ? { profilePhotoUrl: profile.profilePhotoUrl } : {}),
    ...(profile.curriculumUrl     ? { curriculumUrl: profile.curriculumUrl } : {}),
    ...(profile.certifications    ? { certifications: profile.certifications } : {}),
    ...(profile.skills            ? { skills: profile.skills }          : {}),
    ...(profile.portfolioItems    ? { portfolioItems: profile.portfolioItems } : {}),
    // Campos de Configuración — SIN estos, guardar una sección borra lo que
    // ya se había guardado en otra (el backend reemplaza el perfil completo
    // con lo que recibe; si un campo no viene, se pierde).
    ...(profile.availabilityStatus     ? { availabilityStatus: profile.availabilityStatus } : {}),
    ...(profile.cvVisibility           ? { cvVisibility: profile.cvVisibility } : {}),
    ...(profile.preferredCurrency      ? { preferredCurrency: profile.preferredCurrency } : {}),
    ...(profile.preferredPaymentMethod ? { preferredPaymentMethod: profile.preferredPaymentMethod } : {}),
    ...(profile.language               ? { language: profile.language } : {}),
    ...(profile.timezone               ? { timezone: profile.timezone } : {}),
    ...(profile.notificationPreferences ? { notificationPreferences: profile.notificationPreferences } : {}),
    ...partialPayload,
  };
}

function useProfileFieldUpdate(profile: SettingsProfile | null) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (partialPayload: Record<string, unknown>) => {
      if (!profile?.id) {
        throw new Error("No se encontró el perfil del usuario. Recarga la página e intenta de nuevo.");
      }
      const fullPayload = buildFullPayload(profile, partialPayload);
      return settingsApi.updateProfile(profile.id, fullPayload);
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["settings", "profile"], updatedProfile);
      queryClient.invalidateQueries({ queryKey: ["settings", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });

  return mutation;
}

// ─── Actualizar Preferencias de Trabajo (disponibilidad + visibilidad CV) ─────
// Combinado en UNA sola petición para evitar condición de carrera:
// si se mandaran por separado en paralelo, cada request arma su payload con el
// profile "viejo" y puede pisar el cambio que la otra request acaba de guardar.

export function useUpdateWorkPreferences(profile: SettingsProfile | null) {
  const mutation = useProfileFieldUpdate(profile);
  return {
    updateAsync: (data: { availabilityStatus: AvailabilityStatus; cvVisibility: string }) =>
      mutation.mutateAsync(data),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  };
}

// ─── Actualizar Finanzas (moneda + método de pago) ────────────────────────────
// Mismo motivo: una sola petición combinada, no dos en paralelo.

export function useUpdateFinances(profile: SettingsProfile | null) {
  const mutation = useProfileFieldUpdate(profile);
  return {
    updateAsync: (data: {
      preferredCurrency: PreferredCurrency;
      preferredPaymentMethod?: PaymentMethodType;
    }) => mutation.mutateAsync(data),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
  };
}

// ─── Actualizar idioma y zona horaria ─────────────────────────────────────────

export function useUpdateGeneralSettings(profile: SettingsProfile | null) {
  const mutation = useProfileFieldUpdate(profile);
  return {
    updateAsync: (data: { language: string; timezone: string }) => mutation.mutateAsync(data),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
  };
}

// ─── Cambiar contraseña ───────────────────────────────────────────────────────

export function useChangePassword() {
  const mutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      settingsApi.changePassword(data),
  });
  return {
    changeAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}

// ─── Historial de comisiones ──────────────────────────────────────────────────

export function useCommissions() {
  const query = useQuery({
    queryKey: ["settings", "commissions"],
    queryFn: settingsApi.getCommissions,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  return {
    commissions: query.data ?? [],
    isLoading: query.isLoading,
  };
}