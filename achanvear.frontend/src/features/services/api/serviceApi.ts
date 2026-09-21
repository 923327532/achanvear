// features/services/api/serviceApi.ts
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type {
  Service,
  ExploreService,
  ServiceDetail,
  ServiceStatus,
  ServiceStats,
  PaginatedServices,
  ServiceFormData,
  ServiceFilters,
} from "../types/service.types";

export const serviceApi = {
  // GET /services/my
  getMyServices: async (): Promise<Service[]> => {
    const response = await api.get<ApiResponse<Service[]>>("/services/my");
    return parseResponse(response);
  },

  // GET /services/drafts
  getDrafts: async (): Promise<Service[]> => {
    const response = await api.get<ApiResponse<Service[]>>("/services/drafts");
    return parseResponse(response);
  },

  // GET /services/stats
  getMyStats: async (): Promise<ServiceStats> => {
    const response = await api.get<ApiResponse<ServiceStats>>("/services/stats");
    return parseResponse(response);
  },

  // GET /services (explore)
  explore: async (filters: ServiceFilters): Promise<PaginatedServices> => {
    // When category is "ALL", don't send it so the backend treats it as NULL (no filter)
    const params: Record<string, string | number> = {
      search: filters.search,
      page: filters.page,
      size: filters.size,
    };
    if (filters.category !== "ALL") {
      params.category = filters.category;
    }
    const response = await api.get<ApiResponse<PaginatedServices>>("/services", { params });
    return parseResponse(response);
  },

  // GET /services/{id}
  getById: async (id: string): Promise<ServiceDetail> => {
    const response = await api.get<ApiResponse<ServiceDetail>>(`/services/${id}`);
    return parseResponse(response);
  },

  // POST /services
  create: async (data: ServiceFormData, publish: boolean): Promise<Service> => {
    const response = await api.post<ApiResponse<Service>>("/services", data, { params: { publish } });
    return parseResponse(response);
  },

  // PUT /services/:id
  update: async (id: string, data: Partial<ServiceFormData> & { status?: ServiceStatus }): Promise<Service> => {
    const response = await api.put<ApiResponse<Service>>(`/services/${id}`, data);
    return parseResponse(response);
  },

  // DELETE /services/:id
  delete: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`);
  },

  // POST /services/ai-suggest
  aiSuggest: async (prompt: string): Promise<{
    title: string;
    shortDescription: string;
    description: string;
    category: string;
    subcategory: string;
    tags: string[];
    modality: string;
    coverageType: string;
    coverageDetails: string;
    schedule: string;
    deliveryDays: number;
    availableImmediately: boolean;
    basePrice: number;
    billingType: string;
    currency: string;
    plans: { name: string; description: string; price: number; deliveryDays: number; features: string[] }[];
    whatsapp: string;
    phone: string;
    emailContact: string;
    responseTime: string;
    faqs: string;
    warrantyInfo: string;
    cancellationPolicy: string;
    supportInfo: string;
  }> => {
    const response = await api.post<ApiResponse<any>>("/services/ai-suggest", { prompt });
    return parseResponse(response);
  },
};
