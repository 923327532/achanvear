// features/payments/api/companyPaymentsApi.ts
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/features/auth/types/auth.types";

// ─── Company-specific payment types ───────────────────────────────────────────

export interface CompanyEscrowProject {
  id: string;
  projectName: string;
  freelancerName: string;
  freelancerId: string;
  totalAmount: number;
  retainedAmount: number;
  releasedAmount: number;
  status: "IN_PROGRESS" | "PENDING_APPROVAL" | "COMPLETED" | "DISPUTED";
  currency: string;
  milestoneId: string;
  createdAt: string;
}

export interface CompanyBillingRecord {
  id: string;
  date: string;
  concept: string;
  projectValue: number | null;
  rate: string | null;
  commission: number;
  invoiceNumber: string;
  status: "PAID" | "PENDING" | "OVERDUE";
  invoiceUrl: string | null;
}

export interface CompanyFinancialSummary {
  creditsAvailable: number;
  retainedFunds: number;
  commissionsPaid: number;
  totalActiveJobs: number;
  totalApplications: number;
  totalHired: number;
  currency: string;
}

// ─── Company Payments API ─────────────────────────────────────────────────────

export const companyPaymentsApi = {
  // GET /companies/{companyId}/payments/summary
  getFinancialSummary: async (companyId: string): Promise<CompanyFinancialSummary> => {
    const res = await api.get<ApiResponse<CompanyFinancialSummary>>(
      `/companies/${companyId}/payments/summary`
    );
    return parseResponse(res);
  },

  // GET /companies/{companyId}/payments/escrow
  getEscrowProjects: async (companyId: string): Promise<CompanyEscrowProject[]> => {
    const res = await api.get<ApiResponse<CompanyEscrowProject[]>>(
      `/companies/${companyId}/payments/escrow`
    );
    return parseResponse(res);
  },

  // GET /companies/{companyId}/payments/billing
  getBillingHistory: async (companyId: string): Promise<CompanyBillingRecord[]> => {
    const res = await api.get<ApiResponse<CompanyBillingRecord[]>>(
      `/companies/${companyId}/payments/billing`
    );
    return parseResponse(res);
  },

  // POST /companies/{companyId}/payments/escrow/{milestoneId}/release
  releaseEscrowPayment: async (companyId: string, milestoneId: string): Promise<void> => {
    await api.post(`/companies/${companyId}/payments/escrow/${milestoneId}/release`);
  },

  // POST /companies/{companyId}/payments/escrow/{milestoneId}/refund
  refundEscrowPayment: async (companyId: string, milestoneId: string, reason: string): Promise<void> => {
    await api.post(`/companies/${companyId}/payments/escrow/${milestoneId}/refund`, { reason });
  },
};