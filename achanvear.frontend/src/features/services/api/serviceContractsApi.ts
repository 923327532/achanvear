import api, { parseResponse, type ApiResponse } from "@/lib/axiosClient";
export interface ServiceOffer {
  serviceId: string; planId: string | null; freelancerId: string; title: string; planName: string;
  amount: number; deliveryDays: number; currency: string;
}
export interface ServiceContract {
  id: string; projectId: string; serviceId: string; planId: string | null; conversationId: string;
  clientId: string; freelancerId: string; milestoneId: string; title: string; planName: string;
  amount: number; deliveryDays: number; currency: string;
  status: "PENDING_ACCEPTANCE" | "ACCEPTED" | "COMPLETED" | "REJECTED";
}
export const serviceContractsApi = {
  reviews: async (id: string) => parseResponse(await api.get<ApiResponse<{
    reviewerUserId: string; stars: number; comment: string | null; createdAt: string;
  }[]>>(`/services/${id}/reviews`)),
  linkOrigin: async (conversationId: string, serviceId: string) => {
    await api.post(`/services/conversations/${conversationId}/origins/${serviceId}`);
  },
  offers: async (id: string) => parseResponse(await api.get<ApiResponse<ServiceOffer[]>>(`/services/conversations/${id}/offers`)),
  list: async (id: string) => parseResponse(await api.get<ApiResponse<ServiceContract[]>>(`/services/conversations/${id}/contracts`)),
  create: async (conversationId: string, offer: ServiceOffer, idempotencyKey: string) => parseResponse(await api.post<ApiResponse<ServiceContract>>("/services/contracts", {
    conversationId, serviceId: offer.serviceId, planId: offer.planId, idempotencyKey,
  })),
  accept: async (id: string) => { await api.post(`/services/contracts/${id}/accept`); },
  review: async (id: string, stars: number, comment: string) => { await api.post(`/services/contracts/${id}/review`, { stars, comment }); },
};
