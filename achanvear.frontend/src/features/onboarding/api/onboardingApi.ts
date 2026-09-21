// src/features/onboarding/api/onboardingApi.ts
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type { 
  RegisterFormData,
  Plan,
  AIAgent,
} from "@/features/onboarding/types/onboarding.types";

const BASE_PATH = "/onboarding";
const COMPANY_BASE_PATH = "/company/onboarding";
const CATALOG_BASE_PATH = "/catalog";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface RegisterResponse {
  id: string;
  email: string;
  fullName: string;
  dni: string;
  role: string;
  status: string;
}

export interface IndustryRequest {
  industry: string;
}

export interface SpecialtyRequest {
  specialty: string;
}

export interface CreateProfileRequest {
  name: string;
  industry: string;
  specialty: string;
  profilePhotoUrl: string | null;
  biography: string;
  achievements: string;
  address?: string;
  paymentMethodType: string;
  dni: string;
  curriculumUrl: string | null;
  certifications: {
    name: string;
    issuingOrganization: string;
    credentialUrl: string;
  }[];
}

export interface PresignedUrlRequest {
  fileName: string;
  contentType: string;
  folder: "CURRICULUM" | "PROFILE_PHOTO";
}

export interface PresignedUrlResponse {
  fileKey: string;
  uploadUrl: string;
  publicFileUrl: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const onboardingService = {

  // ── Freelancer ──────────────────────────────────────────────────────────────

  getIndustries: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>(
      `${BASE_PATH}/industries`
    );
    return parseResponse(response);
  },

  getSpecialtiesByIndustry: async (industry: string): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>(
      `${BASE_PATH}/specialties/${encodeURIComponent(industry)}`
    );
    return parseResponse(response);
  },

  register: async (data: RegisterFormData) => {
    const response = await api.post<ApiResponse<RegisterResponse>>(
      "/auth/register",
      {
        email: data.email,
        fullName: data.fullName,
        dni: data.dni,
        password: data.password,
        role: "FREELANCER",
      }
    );
    return parseResponse(response);
  },

  loginAfterRegister: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{
      accessToken: string;
      tokenType: string;
      user: RegisterResponse;
    }>>("/auth/login", { email, password });
    return parseResponse(response);
  },

  saveIndustry: async (industry: string): Promise<void> => {
    const response = await api.post<ApiResponse<void>>(
      `${BASE_PATH}/industry`,
      { industry } as IndustryRequest
    );
    return parseResponse(response);
  },

  saveSpecialty: async (specialty: string): Promise<void> => {
    const response = await api.post<ApiResponse<void>>(
      `${BASE_PATH}/specialty`,
      { specialty } as SpecialtyRequest
    );
    return parseResponse(response);
  },

  getPresignedUrl: async (data: PresignedUrlRequest): Promise<PresignedUrlResponse> => {
    const response = await api.post<ApiResponse<PresignedUrlResponse>>(
      "/freelance/storage/presigned-url",
      data
    );
    return parseResponse(response);
  },

  /** Obtiene URL presigned para subir archivos (compañía o freelancer) */
  getProfilePresignedUrl: async (data: PresignedUrlRequest): Promise<PresignedUrlResponse> => {
    const response = await api.post<ApiResponse<PresignedUrlResponse>>(
      "/profiles/storage/presigned-url",
      data
    );
    return parseResponse(response);
  },

  createProfile: async (data: CreateProfileRequest): Promise<{ id: string }> => {
    const response = await api.post<ApiResponse<{ id: string }>>(
      "/freelance/profiles",
      data
    );
    return parseResponse(response);
  },

  personalizeProfile: async (data: {
    profilePhotoUrl: string | null;
    biography: string;
    portfolioLinks: string[];
    achievements: string[];
  }): Promise<void> => {
    const response = await api.patch<ApiResponse<void>>(
      `${BASE_PATH}/personalize`,
      data
    );
    return parseResponse(response);
  },

  /** Sube un archivo a través del backend (evita CORS de S3) */
  uploadFile: async (folder: string, file: File): Promise<{ fileKey: string; publicFileUrl: string }> => {
    const formData = new FormData();
    formData.append("folder", folder);
    formData.append("file", file);
    const response = await api.post<ApiResponse<{ fileKey: string; publicFileUrl: string }>>(
      "/freelance/storage/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return parseResponse(response);
  },

  // ── Catálogos compartidos ───────────────────────────────────────────────────
  getCatalogIndustries: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>(
      `${CATALOG_BASE_PATH}/industries`
    );
    return parseResponse(response);
  },

  getCatalogSpecialties: async (industry: string): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>(
      `${CATALOG_BASE_PATH}/specialties/${encodeURIComponent(industry)}`
    );
    return parseResponse(response);
  },

  // ── Company Onboarding (paso a paso) ────────────────────────────────────────

  registerCompany: async (data: {
    email: string;
    fullName: string;
    dni: string;
    phone?: string;
    password: string;
    role: string;
    representanteDni: string;
    representanteLegal: string;
    ruc?: string;
  }) => {
    const response = await api.post<ApiResponse<RegisterResponse>>(
      "/auth/register",
      data
    );
    return parseResponse(response);
  },

  /** PASO 1: Inicializa la compañía con datos básicos */
  initCompany: async (data: {
    businessName: string;
    legalName: string;
    representativeDni: string;
    ruc?: string;
    industry?: string;
    biography?: string;
    address?: string;
  }): Promise<{ id: string }> => {
    const response = await api.post<ApiResponse<{ id: string }>>(
      `${COMPANY_BASE_PATH}/init`,
      data
    );
    return parseResponse(response);
  },

  /** PASO 2: Actualiza industria */
  saveCompanyIndustry: async (industry: string): Promise<void> => {
    const response = await api.patch<ApiResponse<void>>(
      `${COMPANY_BASE_PATH}/industry`,
      { industry }
    );
    return parseResponse(response);
  },

  /** PASO 3: Actualiza especialidad */
  saveCompanySpecialty: async (specialty: string): Promise<void> => {
    const response = await api.patch<ApiResponse<void>>(
      `${COMPANY_BASE_PATH}/specialty`,
      { specialty }
    );
    return parseResponse(response);
  },

  /** PASO 4: Actualiza perfil corporativo */
  saveCorporateProfile: async (data: {
    companySize: string;
    biography: string;
    address: string;
    logoUrl?: string;
  }): Promise<void> => {
    const response = await api.patch<ApiResponse<void>>(
      `${COMPANY_BASE_PATH}/profile`,
      data
    );
    return parseResponse(response);
  },

  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get<ApiResponse<any[]>>(
      `${CATALOG_BASE_PATH}/plans`
    );
    const rawPlans = parseResponse(response);
    return rawPlans.map((p: any) => ({
      id: p.planType || p.id,
      name: p.displayName || p.name,
      description: p.description || "",
      price: p.monthlyPrice ?? p.price ?? 0,
      yearlyPrice: p.yearlyPrice ?? Math.round((p.monthlyPrice ?? 0) * 12 * 0.8),
      currency: "PEN",
      billingCycle: "monthly",
      features: p.benefits || p.features || [],
      isActive: p.isActive ?? true,
      isPopular: p.isPopular ?? false,
      maxActiveJobs: p.maxProjects ?? p.maxActiveJobs ?? 1,
      maxInterviews: p.maxInvitesPerProject ?? p.maxInterviews ?? 5,
      availableAgents: p.availableAgents || [],
      proctoringLevel: p.proctoringLevel || "basic",
      videoStorageDays: p.videoStorageDays ?? 7,
      hasExecutiveReports: p.hasExecutiveReports ?? false,
      hasKanbanPipeline: p.hasKanbanPipeline ?? false,
      hasWhiteLabel: p.hasWhiteLabel ?? false,
      hasReportsApi: p.hasReportsApi ?? false,
      hasAccountManager: p.hasAccountManager ?? false,
      supportLevel: p.supportLevel || "email",
    }));
  },

  /** PASO 5: Actualiza plan */
  selectPlan: async (planId: string): Promise<void> => {
    const response = await api.patch<ApiResponse<void>>(
      `${COMPANY_BASE_PATH}/plan`,
      { companyPlan: planId }
    );
    return parseResponse(response);
  },

  /** Suscripción a plan via MercadoPago — devuelve URL de pago */
  subscribeToPlan: async (planId: string, companyEmail: string): Promise<string> => {
    const response = await api.post<ApiResponse<string>>(
      "/payments/plans/subscribe",
      { plan: planId, companyEmail }
    );
    return parseResponse(response);
  },

  /** PASO 6: Actualiza método de pago */
  savePaymentMethod: async (paymentMethod: string): Promise<void> => {
    const response = await api.patch<ApiResponse<void>>(
      `${COMPANY_BASE_PATH}/payment-method`,
      { paymentMethodType: paymentMethod }
    );
    return parseResponse(response);
  },

  getAIAgents: async (): Promise<AIAgent[]> => {
    const response = await api.get<ApiResponse<AIAgent[]>>(
      `${CATALOG_BASE_PATH}/ai-agents`
    );
    return parseResponse(response);
  },

  /** PASO 7: Finaliza onboarding */
  completeOnboarding: async (data: {
    industry?: string;
    specialty?: string;
    companySize?: string;
    logoUrl?: string;
    biography?: string;
    achievements?: string;
    address?: string;
    paymentMethodType?: string;
    companyPlan?: string;
  }): Promise<{ id: string }> => {
    const response = await api.post<ApiResponse<{ id: string }>>(
      `${COMPANY_BASE_PATH}/complete`,
      data
    );
    return parseResponse(response);
  },

  // ── Obtener perfil de la compañía del usuario autenticado ────────────────────
  getCompanyProfile: async () => {
    try {
      const response = await api.get<ApiResponse<any>>(
        "/companies/profile"
      );
      // Si el backend devuelve 204 (No Content), response.data puede ser undefined
      if (!response.data || !response.data.data) {
        return null;
      }
      return response.data.data;
    } catch (err) {
      // Si hay error (por ejemplo 404), retornar null
      return null;
    }
  },

  // ── Crear compañía en el backend ─────────────────────────────────────────────
  createCompany: async (data: {
    businessName: string;
    tradeName?: string;
    legalName: string;
    industry: string;
    specialty: string;
    companySize: string;
    logoUrl?: string;
    biography: string;
    achievements?: string;
    address: string;
    paymentMethodType: string;
    companyPlan: string;
    representativeDni: string;
    ruc?: string;
  }) => {
    const response = await api.post<ApiResponse<any>>(
      "/companies",
      data
    );
    return parseResponse(response);
  },

  // ── Actualizar compañía en el backend ────────────────────────────────────────
  updateCompany: async (id: string, data: {
    businessName?: string;
    tradeName?: string;
    legalName?: string;
    industry?: string;
    specialty?: string;
    companySize?: string;
    logoUrl?: string;
    biography?: string;
    achievements?: string;
    address?: string;
    paymentMethodType?: string;
    companyPlan?: string;
  }) => {
    const response = await api.put<ApiResponse<any>>(
      `/companies/${id}`,
      data
    );
    return parseResponse(response);
  },
};