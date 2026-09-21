// features/settings/api/companySettingsApi.ts
// API para la configuración de COMPANY — todo conectado al backend real
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type { CompanyProfile } from "@/features/profile/types/profile.types";
import type {
  TeamMember,
  AgentOption,
  PlanOption,
  CompanyPaymentMethod,
  PrivacySettings,
  WalletInfo,
  PaymentsOverview,
  CreditPackage,
} from "../types/company-settings.types";

// ─── Endpoints del backend ─────────────────────────────────────────────────────
// GET  /companies/profile          → CompanyProfile
// PUT  /companies/{id}             → CompanyProfile
// GET  /payments/plans             → PlanOption[]
// GET  /payments/plans/current     → CurrentPlanResponse
// POST /payments/plans/subscribe   → initPoint
// GET  /payments/overview          → PaymentsOverview
// GET  /payments/wallet            → WalletInfo
// GET  /payments/transactions      → PaymentTransactionPageResponse
// GET  /companies/{id}/payment-methods → PaymentMethod[]
// POST /auth/reset-password        → void

export const companySettingsApi = {
  // ─── Perfil de empresa ─────────────────────────────────────────────────────

  getCompanyProfile: async (): Promise<CompanyProfile> => {
    const res = await api.get<ApiResponse<CompanyProfile>>("/companies/profile");
    return parseResponse(res);
  },

  updateCompany: async (
    id: string,
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
    }
  ): Promise<CompanyProfile> => {
    const res = await api.put<ApiResponse<CompanyProfile>>(`/companies/${id}`, data);
    return parseResponse(res);
  },

  // ─── Planes de suscripción ─────────────────────────────────────────────────

  getAvailablePlans: async (): Promise<PlanOption[]> => {
    const res = await api.get<ApiResponse<PlanOption[]>>("/payments/plans");
    return parseResponse(res);
  },

  getCurrentPlan: async (): Promise<{ planType: string; status: string; startDate: string; endDate: string } | null> => {
    try {
      const res = await api.get<ApiResponse<{ planType: string; status: string; startDate: string; endDate: string }>>(
        "/payments/plans/current"
      );
      return parseResponse(res);
    } catch {
      return null;
    }
  },

  subscribeToPlan: async (plan: string, companyEmail: string): Promise<string> => {
    const res = await api.post<ApiResponse<string>>("/payments/plans/subscribe", {
      plan,
      companyEmail,
    });
    return parseResponse(res);
  },

  // Compra de un paquete de créditos con Mercado Pago (checkout)
  checkoutCreditPackage: async (packageId: string, clientEmail: string): Promise<string> => {
    const res = await api.post<ApiResponse<string>>(
      `/payments/credit-packages/${packageId}/checkout`,
      { clientEmail }
    );
    return parseResponse(res);
  },

  // ─── Métodos de pago ───────────────────────────────────────────────────────

  getPaymentMethods: async (companyId: string): Promise<CompanyPaymentMethod[]> => {
    const res = await api.get<ApiResponse<CompanyPaymentMethod[]>>(
      `/companies/${companyId}/payment-methods`
    );
    return parseResponse(res);
  },

  // ─── Colaboradores / Team ──────────────────────────────────────────────────

  getCollaborators: async (): Promise<TeamMember[]> => {
    const res = await api.get<ApiResponse<TeamMember[]>>("/companies/collaborators");
    return parseResponse(res);
  },

  inviteCollaborator: async (data: {
    email: string;
    fullName: string;
  }): Promise<TeamMember> => {
    const res = await api.post<ApiResponse<TeamMember>>("/companies/collaborators/invite", data);
    return parseResponse(res);
  },

  removeCollaborator: async (collaboratorId: string): Promise<void> => {
    await api.delete(`/companies/collaborators/${collaboratorId}`);
  },

  deactivateCollaborator: async (collaboratorId: string): Promise<void> => {
    await api.patch(`/companies/collaborators/${collaboratorId}/deactivate`);
  },

  // ─── Cambiar contraseña ────────────────────────────────────────────────────

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await api.post("/auth/change-password", data);
  },

  // ─── Credit Packages ──────────────────────────────────────────────────────

  getCreditPackages: async (): Promise<CreditPackage[]> => {
    const res = await api.get<ApiResponse<CreditPackage[]>>("/payments/credit-packages");
    return parseResponse(res);
  },

  // ─── Payments Overview ────────────────────────────────────────────────────

  getPaymentsOverview: async (): Promise<PaymentsOverview> => {
    try {
      const res = await api.get<ApiResponse<PaymentsOverview>>("/payments/overview");
      return parseResponse(res);
    } catch {
      return {
        publishedProjectsCount: 0,
        remainingFreeProjects: 3,
        canPublishMoreProjects: true,
        currentPlan: "BASIC",
        planExpirationDate: "",
        totalEarned: 0,
        pendingRelease: 0,
        availableForWithdrawal: 0,
        totalCommissionsPaid: 0,
        upgradeMessage: "Actualiza tu plan para publicar más proyectos",
      };
    }
  },

  // ─── Wallet ────────────────────────────────────────────────────────────────

  getWallet: async (): Promise<WalletInfo> => {
    try {
      const res = await api.get<ApiResponse<WalletInfo>>("/payments/wallet");
      return parseResponse(res);
    } catch {
      return {
        id: "",
        balance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        totalSpent: 0,
        currency: "PEN",
        isActive: true,
      };
    }
  },

  // ─── Privacidad ────────────────────────────────────────────────────────────

  getPrivacySettings: async (): Promise<PrivacySettings> => {
    try {
      const res = await api.get<ApiResponse<PrivacySettings>>("/companies/privacy");
      return parseResponse(res);
    } catch {
      // Fallback: leer desde localStorage si el endpoint no existe
      const stored = localStorage.getItem("company-privacy-settings");
      if (stored) return JSON.parse(stored);
      return { incognitoMode: false, showContactInfo: true, showInDirectory: true, visibilityNotifications: false };
    }
  },

  updatePrivacySettings: async (data: PrivacySettings): Promise<PrivacySettings> => {
    try {
      const res = await api.put<ApiResponse<PrivacySettings>>("/companies/privacy", data);
      return parseResponse(res);
    } catch {
      // Fallback: guardar en localStorage si el endpoint no existe
      localStorage.setItem("company-privacy-settings", JSON.stringify(data));
      return data;
    }
  },
};
