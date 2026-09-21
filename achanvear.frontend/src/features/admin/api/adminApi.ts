// features/admin/api/adminApi.ts
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/lib/axiosClient";
import type {
  AdminUserPage,
  AdminConsentPage,
  AdminInterviewPage,
  AdminMetrics,
  LegalDocument,
  LegalDocumentVersion,
  AdminAuditLogPage,
  AdminUserKpis,
  CreateUserPayload,
} from "../types/admin.types";

export const adminApi = {
  // GET /admin/users
  listUsers: async (params: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<AdminUserPage> => {
    const response = await api.get<ApiResponse<AdminUserPage>>("/admin/users", { params });
    return parseResponse(response);
  },

  // POST /admin/users
  createUser: async (payload: CreateUserPayload): Promise<{ id: string; email: string; role: string }> => {
    const response = await api.post<ApiResponse<{ id: string; email: string; role: string }>>("/admin/users", payload);
    return parseResponse(response);
  },

  // PATCH /admin/users/{id}/status
  changeUserStatus: async (userId: string, newStatus: string): Promise<void> => {
    await api.patch(`/admin/users/${userId}/status`, { newStatus });
  },

  // PATCH /admin/users/{id}/role
  changeUserRole: async (userId: string, newRole: string): Promise<void> => {
    await api.patch(`/admin/users/${userId}/role`, { newRole });
  },

  // GET /admin/users/kpis
  getUserKpis: async (days: number): Promise<AdminUserKpis> => {
    const response = await api.get<ApiResponse<AdminUserKpis>>("/admin/users/kpis", {
      params: { days },
    });
    return parseResponse(response);
  },

  // GET /admin/consents
  listConsents: async (params: {
    type?: string;
    userId?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<AdminConsentPage> => {
    const response = await api.get<ApiResponse<AdminConsentPage>>("/admin/consents", { params });
    return parseResponse(response);
  },

  // GET /admin/interviews
  listInterviews: async (params: {
    status?: string;
    type?: string;
    page?: number;
    size?: number;
  }): Promise<AdminInterviewPage> => {
    const response = await api.get<ApiResponse<AdminInterviewPage>>("/admin/interviews", { params });
    return parseResponse(response);
  },

  // GET /admin/metrics
  getMetrics: async (): Promise<AdminMetrics> => {
    const response = await api.get<ApiResponse<AdminMetrics>>("/admin/metrics");
    return parseResponse(response);
  },

  // GET /admin/legal-documents
  listLegalDocuments: async (): Promise<LegalDocument[]> => {
    const response = await api.get<ApiResponse<LegalDocument[]>>("/admin/legal-documents");
    return parseResponse(response);
  },

  // GET /admin/legal-documents/{type}/versions
  getLegalDocumentHistory: async (type: string): Promise<LegalDocumentVersion[]> => {
    const response = await api.get<ApiResponse<LegalDocumentVersion[]>>(
      `/admin/legal-documents/${type}/versions`
    );
    return parseResponse(response);
  },

  // POST /admin/legal-documents/{type}/versions
  createLegalDocumentVersion: async (
    type: string,
    payload: { version: string; title: string; content: string }
  ): Promise<LegalDocumentVersion> => {
    const response = await api.post<ApiResponse<LegalDocumentVersion>>(
      `/admin/legal-documents/${type}/versions`,
      payload
    );
    return parseResponse(response);
  },

  // PATCH /admin/legal-documents/{type}/versions/{id}/publish
  publishLegalDocumentVersion: async (type: string, versionId: string): Promise<LegalDocumentVersion> => {
    const response = await api.patch<ApiResponse<LegalDocumentVersion>>(
      `/admin/legal-documents/${type}/versions/${versionId}/publish`
    );
    return parseResponse(response);
  },

  // GET /admin/audit-logs
  listAuditLogs: async (params: { page?: number; size?: number }): Promise<AdminAuditLogPage> => {
    const response = await api.get<ApiResponse<AdminAuditLogPage>>("/admin/audit-logs", { params });
    return parseResponse(response);
  },
};
