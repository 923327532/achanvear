// features/payments/api/paymentsApi.ts
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type {
  WalletSummary,
  QuickRecharge,
  WalletTransaction,
  EscrowProject,
  PaymentMethod,
  PaymentIntent,
  EscrowDetail,
  Dispute,
  AuditLogEntry,
  FreelancerWalletSummary,
  PayoutMethod,
  Payout,
} from "../types/payments.types";

// ─── Wallet API ───────────────────────────────────────────────────────────────

export const walletApi = {
  // GET /payments/wallet
  getWallet: async (): Promise<WalletSummary> => {
    const res = await api.get<ApiResponse<WalletSummary>>("/payments/wallet");
    return parseResponse(res);
  },

  // POST /payments/wallet/recharge
  initiateRecharge: async (data: {
    amount: number;
    method: string;
    phoneNumber?: string;
  }): Promise<QuickRecharge> => {
    const res = await api.post<ApiResponse<QuickRecharge>>("/payments/wallet/recharge", data);
    return parseResponse(res);
  },

  // POST /payments/wallet/recharge/{rechargeId}/confirm
  confirmRecharge: async (rechargeId: string, referenceCode: string): Promise<QuickRecharge> => {
    const res = await api.post<ApiResponse<QuickRecharge>>(
      `/payments/wallet/recharge/${rechargeId}/confirm`,
      { referenceCode }
    );
    return parseResponse(res);
  },

  // POST /payments/wallet/recharge/{rechargeId}/fail
  failRecharge: async (rechargeId: string, reason: string): Promise<QuickRecharge> => {
    const res = await api.post<ApiResponse<QuickRecharge>>(
      `/payments/wallet/recharge/${rechargeId}/fail`,
      { reason }
    );
    return parseResponse(res);
  },

  // GET /payments/wallet/recharges
  getRechargeHistory: async (): Promise<QuickRecharge[]> => {
    const res = await api.get<ApiResponse<QuickRecharge[]>>("/payments/wallet/recharges");
    return parseResponse(res);
  },

  // GET /payments/wallet/transactions
  getWalletTransactions: async (): Promise<WalletTransaction[]> => {
    const res = await api.get<ApiResponse<WalletTransaction[]>>("/payments/wallet/transactions");
    return parseResponse(res);
  },

  // GET /payments/freelancer/wallet-summary
  getFreelancerWalletSummary: async (): Promise<FreelancerWalletSummary> => {
    const res = await api.get<ApiResponse<FreelancerWalletSummary>>(
      "/payments/freelancer/wallet-summary"
    );
    return parseResponse(res);
  },
};

// ─── Payout / Retiros API (Izipay Dispersión) ─────────────────────────────────

export const payoutApi = {
  // GET /payments/payout-methods
  getPayoutMethods: async (): Promise<PayoutMethod[]> => {
    const res = await api.get<ApiResponse<PayoutMethod[]>>("/payments/payout-methods");
    return parseResponse(res);
  },

  // POST /payments/payout-methods
  addPayoutMethod: async (data: {
    cardToken?: string;
    maskedCard: string;
    cardBrand?: string;
    lastFourDigits: string;
    accountHolderName?: string;
  }): Promise<PayoutMethod> => {
    const res = await api.post<ApiResponse<PayoutMethod>>("/payments/payout-methods", data);
    return parseResponse(res);
  },

  // DELETE /payments/payout-methods/{methodId}
  removePayoutMethod: async (methodId: string): Promise<void> => {
    await api.delete(`/payments/payout-methods/${methodId}`);
  },

  // POST /payments/payout-methods/{methodId}/default
  setDefaultPayoutMethod: async (methodId: string): Promise<void> => {
    await api.post(`/payments/payout-methods/${methodId}/default`);
  },

  // GET /payments/payouts
  getPayoutHistory: async (): Promise<Payout[]> => {
    const res = await api.get<ApiResponse<Payout[]>>("/payments/payouts");
    return parseResponse(res);
  },

  // POST /payments/payouts
  requestPayout: async (data: {
    amount: number;
    payoutMethodId: string;
    idempotencyKey?: string;
  }): Promise<Payout> => {
    const res = await api.post<ApiResponse<Payout>>("/payments/payouts", data);
    return parseResponse(res);
  },

  // POST /payments/payouts/{payoutId}/refresh
  refreshPayout: async (payoutId: string): Promise<Payout> => {
    const res = await api.post<ApiResponse<Payout>>(`/payments/payouts/${payoutId}/refresh`);
    return parseResponse(res);
  },
};

// ─── Local Payment Methods API (Yape/Plin) ────────────────────────────────────

export const localPaymentMethodsApi = {
  // GET /payments/local-methods
  getLocalMethods: async (): Promise<PaymentMethod[]> => {
    const res = await api.get<ApiResponse<PaymentMethod[]>>("/payments/local-methods");
    return parseResponse(res);
  },

  // POST /payments/local-methods
  addLocalMethod: async (data: {
    methodType: string;
    phoneNumber: string;
    accountHolderName?: string;
  }): Promise<PaymentMethod> => {
    const res = await api.post<ApiResponse<PaymentMethod>>("/payments/local-methods", data);
    return parseResponse(res);
  },

  // DELETE /payments/local-methods/{methodId}
  removeLocalMethod: async (methodId: string): Promise<void> => {
    await api.delete(`/payments/local-methods/${methodId}`);
  },

  // POST /payments/local-methods/{methodId}/default
  setDefaultMethod: async (methodId: string): Promise<void> => {
    await api.post(`/payments/local-methods/${methodId}/default`);
  },
};

// ─── Mercado Pago / Escrow API ────────────────────────────────────────────────

export const escrowApi = {
  // POST /payments/milestones/{milestoneId}/deposit-intent
  createDepositIntent: async (
    milestoneId: string,
    data: {
      projectId: string;
      freelancerUserId: string;
      title: string;
      description?: string;
      amount: number;
      clientEmail: string;
    }
  ): Promise<PaymentIntent> => {
    const res = await api.post<ApiResponse<PaymentIntent>>(
      "/payments/milestones/deposit-intent",
      data
    );
    return parseResponse(res);
  },

  processCulqiPayment: async (
    milestoneId: string,
    data: { token: string; email: string }
  ): Promise<string> => {
    const res = await api.post<ApiResponse<string>>(
      `/payments/milestones/${milestoneId}/process-culqi-payment`,
      data
    );
    return parseResponse(res);
  },

  // POST /payments/milestones/{milestoneId}/process-payment
  processPayment: async (
    milestoneId: string,
    data: { mpPaymentId: string; mpPreferenceId: string }
  ): Promise<EscrowDetail> => {
    const res = await api.post<ApiResponse<EscrowDetail>>(
      `/payments/milestones/${milestoneId}/process-payment`,
      data
    );
    return parseResponse(res);
  },

  // POST /payments/milestones/{milestoneId}/release
  releaseMilestone: async (milestoneId: string): Promise<EscrowDetail> => {
    const res = await api.post<ApiResponse<EscrowDetail>>(
      `/payments/milestones/${milestoneId}/release`
    );
    return parseResponse(res);
  },

  // POST /payments/milestones/{milestoneId}/refund
  refundMilestone: async (milestoneId: string, reason: string): Promise<EscrowDetail> => {
    const res = await api.post<ApiResponse<EscrowDetail>>(
      `/payments/milestones/${milestoneId}/refund`,
      { reason }
    );
    return parseResponse(res);
  },

  // GET /payments/milestones/{milestoneId}
  getMilestoneDetail: async (milestoneId: string): Promise<EscrowDetail> => {
    const res = await api.get<ApiResponse<EscrowDetail>>(`/payments/milestones/${milestoneId}`);
    return parseResponse(res);
  },

  // GET /payments/escrow
  getEscrowList: async (): Promise<EscrowDetail[]> => {
    const res = await api.get<ApiResponse<EscrowDetail[]>>("/payments/escrow");
    return parseResponse(res);
  },
};

// ─── Dispute API ──────────────────────────────────────────────────────────────

export const disputeApi = {
  // POST /payments/disputes
  createDispute: async (data: {
    escrowId: string;
    reason: string;
    description: string;
  }): Promise<Dispute> => {
    const res = await api.post<ApiResponse<Dispute>>("/payments/disputes", data);
    return parseResponse(res);
  },

  // POST /payments/disputes/{disputeId}/resolve
  resolveDispute: async (
    disputeId: string,
    data: { resolution: string; releaseToFreelancer: boolean }
  ): Promise<Dispute> => {
    const res = await api.post<ApiResponse<Dispute>>(
      `/payments/disputes/${disputeId}/resolve`,
      data
    );
    return parseResponse(res);
  },

  // GET /payments/disputes
  getDisputes: async (): Promise<Dispute[]> => {
    const res = await api.get<ApiResponse<Dispute[]>>("/payments/disputes");
    return parseResponse(res);
  },

  // GET /payments/disputes/{disputeId}
  getDisputeDetail: async (disputeId: string): Promise<Dispute> => {
    const res = await api.get<ApiResponse<Dispute>>(`/payments/disputes/${disputeId}`);
    return parseResponse(res);
  },
};

// ─── Audit Log API ────────────────────────────────────────────────────────────

export const auditApi = {
  // GET /payments/audit-logs
  getAuditLogs: async (params?: {
    userId?: string;
    action?: string;
    entityType?: string;
    page?: number;
    size?: number;
  }): Promise<AuditLogEntry[]> => {
    const res = await api.get<ApiResponse<AuditLogEntry[]>>("/payments/audit-logs", { params });
    return parseResponse(res);
  },
};

// ─── Refund API ───────────────────────────────────────────────────────────────

export const refundApi = {
  // POST /payments/refunds
  createRefund: async (data: {
    escrowId: string;
    reason: string;
    amount?: number;
  }): Promise<EscrowDetail> => {
    const res = await api.post<ApiResponse<EscrowDetail>>("/payments/refunds", data);
    return parseResponse(res);
  },
};
