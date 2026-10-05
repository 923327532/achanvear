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
  AgentSettings,
  AgentSettingsPayload,
  CompanyPreferences,
  CompanyPreferencesPayload,
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
// GET  /payments/local-methods       → PaymentMethod[]
// GET  /catalog/ai-agents          → AiAgentCatalogItem[]
// POST /auth/reset-password        → void

export interface AiAgentCatalogItem {
  id: string;
  name: string;
  description: string;
  personality: string;
  capabilities: string[];
}

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

  subscribeToPlan: async (plan: string, companyEmail: string, token: string): Promise<string> => {
    const res = await api.post<ApiResponse<string>>("/payments/plans/subscribe", {
      plan,
      companyEmail,
      token,
    });
    return parseResponse(res);
  },

  // Compra de un paquete de creditos con checkout del proveedor configurado
  checkoutCreditPackage: async (packageId: string, clientEmail: string): Promise<string> => {
    const res = await api.post<ApiResponse<string>>(
      `/payments/credit-packages/${packageId}/checkout`,
      { clientEmail }
    );
    return parseResponse(res);
  },

  // ─── Métodos de pago ───────────────────────────────────────────────────────

  getPaymentMethods: async (_companyId: string): Promise<CompanyPaymentMethod[]> => {
    const res = await api.get<ApiResponse<Array<{
      id: string;
      methodType?: string;
      phoneNumber?: string;
      accountHolderName?: string | null;
      isDefault?: boolean;
      isActive?: boolean;
    }>>>("/payments/local-methods");
    const methods = parseResponse(res);

    return methods
      .filter((method) => method.isActive !== false)
      .map((method) => ({
        id: method.id,
        brand: method.methodType === "PLIN" ? "Plin" : "Yape",
        detail: method.accountHolderName
          ? `+51 ${method.phoneNumber} - ${method.accountHolderName}`
          : `+51 ${method.phoneNumber}`,
        isDefault: method.isDefault ?? false,
      }));
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
  // Endpoints reales del backend (CompanyController): la empresa se resuelve
  // a partir del usuario autenticado, por lo que no se envía un id.

  getPrivacySettings: async (): Promise<PrivacySettings> => {
    const res = await api.get<ApiResponse<PrivacySettings>>("/companies/privacy-settings");
    return parseResponse(res);
  },

  updatePrivacySettings: async (data: PrivacySettings): Promise<PrivacySettings> => {
    const res = await api.put<ApiResponse<PrivacySettings>>("/companies/privacy-settings", data);
    return parseResponse(res);
  },

  // ─── Agente IA (agente seleccionado + umbral de match) ──────────────────────
  // PATCH /companies/agent-settings

  getAgentSettings: async (): Promise<AgentSettings> => {
    const res = await api.get<ApiResponse<AgentSettings>>("/companies/agent-settings");
    return parseResponse(res);
  },

  updateAgentSettings: async (data: AgentSettingsPayload): Promise<AgentSettings> => {
    const res = await api.patch<ApiResponse<AgentSettings>>("/companies/agent-settings", data);
    return parseResponse(res);
  },

  // ─── Preferencias generales (idioma / zona horaria) ─────────────────────────
  // GET /companies/preferences · PATCH /companies/preferences

  getPreferences: async (): Promise<CompanyPreferences> => {
    const res = await api.get<ApiResponse<CompanyPreferences>>("/companies/preferences");
    return parseResponse(res);
  },

  updatePreferences: async (data: CompanyPreferencesPayload): Promise<CompanyPreferences> => {
    const res = await api.patch<ApiResponse<CompanyPreferences>>("/companies/preferences", data);
    return parseResponse(res);
  },

  // ─── Catálogo de Agentes IA ─────────────────────────────────────────────────
  // FIX: antes CompanyAgentSection.tsx llamaba a axios directo dentro del
  // componente, saltándose la capa de API — se mueve aquí para seguir el
  // mismo patrón que el resto del archivo (API → hook → componente).

  getAiAgentsCatalog: async (): Promise<AiAgentCatalogItem[]> => {
    const res = await api.get<ApiResponse<AiAgentCatalogItem[]>>("/catalog/ai-agents");
    return parseResponse(res);
  },
};