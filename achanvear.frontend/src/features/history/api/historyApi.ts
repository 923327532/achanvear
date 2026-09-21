// features/history/api/historyApi.ts
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/features/auth/types/auth.types";

export interface HistoryItem {
  id: string;
  type: "PROJECT" | "HIRING" | "PAYMENT" | "REVIEW" | "PROPOSAL";
  title: string;
  description: string;
  date: string;
  status: string;
  relatedId: string;
  freelancerName?: string;
  amount?: number;
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
  page?: number;
  size?: number;
  totalPages?: number;
}

export const historyApi = {
  // GET /companies/{companyId}/history
  getHistory: async (
    companyId: string,
    params?: { page?: number; size?: number }
  ): Promise<HistoryResponse> => {
    const response = await api.get<ApiResponse<HistoryResponse>>(
      `/companies/${companyId}/history`,
      { params: { page: params?.page ?? 0, size: params?.size ?? 8 } }
    );
    return parseResponse(response);
  },
};