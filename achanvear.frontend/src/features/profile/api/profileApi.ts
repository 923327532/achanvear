// features/profile/api/profileApi.ts
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type {
  CompanyProfile,
  FreelancerProfile,
  PresignedUrlResponse,
  StorageFolder,
  PaymentMethod,
  CreatePaymentMethodRequest,
  UpdatePaymentMethodRequest,
} from "@/features/profile/types/profile.types";

export const profileApi = {

  // ── Freelancer profile ─────────────────────────────────────────────────────

  // GET /freelance/profiles/me  ← corregido (antes era /profiles/me → 404)
  getMyProfile: async (): Promise<FreelancerProfile> => {
    const response = await api.get<ApiResponse<FreelancerProfile>>("/freelance/profiles/me");
    return parseResponse(response);
  },

  // GET /freelance/profiles/{id}  ← corregido
  getProfileById: async (id: string): Promise<FreelancerProfile> => {
    const response = await api.get<ApiResponse<FreelancerProfile>>(`/freelance/profiles/${id}`);
    return parseResponse(response);
  },

  // PUT /freelance/profiles/{id}  ← corregido
  updateProfile: async (id: string, data: Partial<FreelancerProfile>): Promise<FreelancerProfile> => {
    const response = await api.put<ApiResponse<FreelancerProfile>>(`/freelance/profiles/${id}`, data);
    return parseResponse(response);
  },

  // ── Storage / presigned URLs ───────────────────────────────────────────────

  // POST /profiles/storage/presigned-url — para foto de perfil
  getPresignedUrl: async (fileName: string, contentType: string, folder: StorageFolder): Promise<PresignedUrlResponse> => {
    const response = await api.post<ApiResponse<PresignedUrlResponse>>(
      "/profiles/storage/presigned-url",
      { fileName, contentType, folder }
    );
    return parseResponse(response);
  },

  getPhotoPresignedUrl: async (fileName: string, contentType: string): Promise<PresignedUrlResponse> => {
    const response = await api.post<ApiResponse<PresignedUrlResponse>>(
      "/profiles/storage/presigned-url",
      { fileName, contentType, folder: "PROFILE_PHOTO" satisfies StorageFolder }
    );
    return parseResponse(response);
  },

  // POST /profiles/storage/presigned-url — para CV
  getCurriculumPresignedUrl: async (fileName: string, contentType: string): Promise<PresignedUrlResponse> => {
    const response = await api.post<ApiResponse<PresignedUrlResponse>>(
      "/profiles/storage/presigned-url",
      { fileName, contentType, folder: "CURRICULUM" satisfies StorageFolder }
    );
    return parseResponse(response);
  },

  // POST /profiles/storage/presigned-url — para portfolio
  getPortfolioPresignedUrl: async (fileName: string, contentType: string): Promise<PresignedUrlResponse> => {
    const response = await api.post<ApiResponse<PresignedUrlResponse>>(
      "/profiles/storage/presigned-url",
      { fileName, contentType, folder: "PORTFOLIO" satisfies StorageFolder }
    );
    return parseResponse(response);
  },

  // PUT directo a S3 con la presigned URL obtenida
  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!response.ok && response.type !== "opaque") {
      throw new Error(`Error al subir archivo a S3: ${response.status} ${response.statusText}`);
    }
  },

  // ── Company profile ────────────────────────────────────────────────────────

  // GET /companies/profile
  getCompanyProfile: async (): Promise<CompanyProfile> => {
    const response = await api.get<ApiResponse<CompanyProfile>>("/companies/profile");
    return parseResponse(response);
  },

  // POST /companies
  createCompany: async (data: {
    businessName: string;
    tradeName: string;
    legalName: string;
    industry: string;
    specialty: string;
    companySize: string;
    logoUrl?: string;
    biography: string;
    achievements: string;
    address: string;
    paymentMethodType: string;
    companyPlan: string;
    representativeDni: string;
    ruc: string;
  }): Promise<CompanyProfile> => {
    const response = await api.post<ApiResponse<CompanyProfile>>("/companies", data);
    return parseResponse(response);
  },

  // PUT /companies/{id}
  updateCompany: async (id: string, data: {
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
  }): Promise<CompanyProfile> => {
    const response = await api.put<ApiResponse<CompanyProfile>>(`/companies/${id}`, data);
    return parseResponse(response);
  },

  // ── Payment Methods ────────────────────────────────────────────────────────

  // GET /companies/{companyId}/payment-methods
  getPaymentMethods: async (companyId: string): Promise<PaymentMethod[]> => {
    const response = await api.get<ApiResponse<PaymentMethod[]>>(`/companies/${companyId}/payment-methods`);
    return parseResponse(response);
  },

  // POST /companies/{companyId}/payment-methods
  createPaymentMethod: async (companyId: string, data: CreatePaymentMethodRequest): Promise<PaymentMethod> => {
    const response = await api.post<ApiResponse<PaymentMethod>>(`/companies/${companyId}/payment-methods`, data);
    return parseResponse(response);
  },

  // PUT /companies/{companyId}/payment-methods/{paymentMethodId}
  updatePaymentMethod: async (companyId: string, paymentMethodId: string, data: UpdatePaymentMethodRequest): Promise<PaymentMethod> => {
    const response = await api.put<ApiResponse<PaymentMethod>>(`/companies/${companyId}/payment-methods/${paymentMethodId}`, data);
    return parseResponse(response);
  },

  // DELETE /companies/{companyId}/payment-methods/{paymentMethodId}
  deletePaymentMethod: async (companyId: string, paymentMethodId: string): Promise<void> => {
    await api.delete(`/companies/${companyId}/payment-methods/${paymentMethodId}`);
  },
};
