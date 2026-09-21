// features/admin/hooks/useAdminData.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";
import type { CreateUserPayload } from "../types/admin.types";

export function useAdminMetrics() {
  return useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: () => adminApi.getMetrics(),
  });
}

export function useAdminUserKpis(days: number) {
  return useQuery({
    queryKey: ["admin", "users", "kpis", days],
    queryFn: () => adminApi.getUserKpis(days),
  });
}

export function useAdminUsers(params: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminApi.listUsers(params),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => adminApi.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "metrics"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
    },
  });
}

export function useChangeUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, newStatus }: { userId: string; newStatus: string }) =>
      adminApi.changeUserStatus(userId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "metrics"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
    },
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: string }) =>
      adminApi.changeUserRole(userId, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
    },
  });
}

export function useAdminConsents(params: {
  type?: string;
  userId?: string;
  status?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ["admin", "consents", params],
    queryFn: () => adminApi.listConsents(params),
  });
}

export function useAdminInterviews(params: {
  status?: string;
  type?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ["admin", "interviews", params],
    queryFn: () => adminApi.listInterviews(params),
  });
}

export function useAdminLegalDocuments() {
  return useQuery({
    queryKey: ["admin", "legal-documents"],
    queryFn: () => adminApi.listLegalDocuments(),
  });
}

export function useLegalDocumentHistory(type: string | null) {
  return useQuery({
    queryKey: ["admin", "legal-documents", "history", type],
    queryFn: () => adminApi.getLegalDocumentHistory(type!),
    enabled: !!type,
  });
}

export function useCreateLegalDocumentVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      type,
      payload,
    }: {
      type: string;
      payload: { version: string; title: string; content: string };
    }) => adminApi.createLegalDocumentVersion(type, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "legal-documents"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
    },
  });
}

export function usePublishLegalDocumentVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, versionId }: { type: string; versionId: string }) =>
      adminApi.publishLegalDocumentVersion(type, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "legal-documents"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
    },
  });
}

export function useAdminAuditLogs(params: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ["admin", "audit-logs", params],
    queryFn: () => adminApi.listAuditLogs(params),
  });
}
