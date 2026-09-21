// features/settings/api/settingsApi.ts
import axiosClient from "@/lib/axiosClient";
import type {
  AvailabilityStatus,
  PreferredCurrency,
  PaymentMethodType,
  CommissionRecord,
} from "../types/settings.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface FullProfile {
  id: string;
  name: string;
  industry: string;
  specialty: string;
  profilePhotoUrl: string | null;
  biography: string;
  achievements: string;
  address: string;
  paymentMethodType: string;
  dni: string;
  curriculumUrl: string | null;
  cvData: string | null;
  status: string;
  certifications: unknown[];
  skills: unknown[];
  portfolioItems: unknown[];
  availabilityStatus: string | null;
  cvVisibility: string | null;
  preferredCurrency: string | null;
  preferredPaymentMethod: string | null;
  language: string | null;
  timezone: string | null;
  notificationPreferences: string | null;
}

export const settingsApi = {
  // GET /freelance/profiles/me — perfil completo
  getMyProfile: async (): Promise<FullProfile> => {
    const res = await axiosClient.get<ApiResponse<FullProfile>>("/freelance/profiles/me");
    return res.data.data;
  },

  // PUT /freelance/profiles/:id — recibe el payload YA COMPLETO (armado por el hook)
  updateProfile: async (profileId: string, payload: Partial<FullProfile>) => {
    const res = await axiosClient.put<ApiResponse<FullProfile>>(
      `/freelance/profiles/${profileId}`,
      payload
    );
    return res.data.data;
  },

  // POST /auth/change-password
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await axiosClient.post<ApiResponse<unknown>>("/auth/change-password", data);
    return res.data;
  },

  getCommissions: async (): Promise<CommissionRecord[]> => {
    const res = await axiosClient.get<ApiResponse<{ transactions: CommissionRecord[] }>>("/payments/transactions");
    return res.data.data.transactions ?? [];
  },

  // ─── 2FA (Two-Factor Authentication) ────────────────────────────────────────

  get2FAStatus: async (): Promise<{ enabled: boolean; method: string | null; setupAt: string | null }> => {
    const res = await axiosClient.get<ApiResponse<{ enabled: boolean; method: string | null; setupAt: string | null }>>("/auth/2fa/status");
    return res.data.data;
  },

  enable2FA: async (): Promise<{ secret: string; otpAuthUrl: string; issuer: string; label: string }> => {
    const res = await axiosClient.post<ApiResponse<{ secret: string; otpAuthUrl: string; issuer: string; label: string }>>("/auth/2fa/enable");
    return res.data.data;
  },

  disable2FA: async (): Promise<void> => {
    await axiosClient.post("/auth/2fa/disable");
  },

  verify2FA: async (code: string): Promise<{ verified: boolean }> => {
    const res = await axiosClient.post<ApiResponse<{ verified: boolean }>>("/auth/2fa/verify", { code });
    return res.data.data;
  },
};
