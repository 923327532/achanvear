// features/payments/hooks/usePayments.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  walletApi,
  localPaymentMethodsApi,
  escrowApi,
  disputeApi,
  refundApi,
  auditApi,
  payoutApi,
} from "../api/paymentsApi";
import type {
  WalletSummary,
  QuickRecharge,
  WalletTransaction,
  PaymentMethod,
  EscrowDetail,
  Dispute,
  AuditLogEntry,
  PayoutMethod,
  Payout,
} from "../types/payments.types";

// ─── Wallet ───────────────────────────────────────────────────────────────────

export function useWallet() {
  const query = useQuery({
    queryKey: ["payments", "wallet"],
    queryFn: walletApi.getWallet,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    wallet: query.data ?? ({
      id: "",
      balance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalSpent: 0,
      currency: "PEN",
      isActive: true,
    } as WalletSummary),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ─── Resumen de pagos del freelancer ──────────────────────────────────────────

export function useFreelancerWalletSummary() {
  const query = useQuery({
    queryKey: ["payments", "freelancer", "wallet-summary"],
    queryFn: walletApi.getFreelancerWalletSummary,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    summary: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

// ─── Payout / Retiros (Izipay Dispersión) ─────────────────────────────────────

export function usePayoutMethods() {
  const query = useQuery({
    queryKey: ["payments", "payout-methods"],
    queryFn: payoutApi.getPayoutMethods,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    methods: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useAddPayoutMethod() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: {
      cardToken?: string;
      maskedCard: string;
      cardBrand?: string;
      lastFourDigits: string;
      accountHolderName?: string;
    }) => payoutApi.addPayoutMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "payout-methods"] });
    },
  });

  return {
    addAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}

export function useRemovePayoutMethod() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (methodId: string) => payoutApi.removePayoutMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "payout-methods"] });
    },
  });

  return {
    removeAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export function useSetDefaultPayoutMethod() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (methodId: string) => payoutApi.setDefaultPayoutMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "payout-methods"] });
    },
  });

  return {
    setDefaultAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export function usePayoutHistory() {
  const query = useQuery({
    queryKey: ["payments", "payouts"],
    queryFn: payoutApi.getPayoutHistory,
    staleTime: 1000 * 60 * 1,
    retry: 1,
  });

  return {
    payouts: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useRequestPayout() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { amount: number; payoutMethodId: string; idempotencyKey?: string }) =>
      payoutApi.requestPayout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "wallet"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "payouts"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "wallet", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "freelancer", "wallet-summary"] });
    },
  });

  return {
    requestAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useRefreshPayout() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payoutId: string) => payoutApi.refreshPayout(payoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "payouts"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "wallet"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "wallet", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "freelancer", "wallet-summary"] });
    },
  });

  return {
    refreshAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

// ─── Wallet Transactions ──────────────────────────────────────────────────────

export function useWalletTransactions() {
  const query = useQuery({
    queryKey: ["payments", "wallet", "transactions"],
    queryFn: walletApi.getWalletTransactions,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

// ─── Quick Recharge ───────────────────────────────────────────────────────────

export function useInitiateRecharge() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { amount: number; method: string; phoneNumber?: string }) =>
      walletApi.initiateRecharge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "wallet"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "wallet", "recharges"] });
    },
  });

  return {
    initiateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    data: mutation.data,
  };
}

export function useConfirmRecharge() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ rechargeId, referenceCode }: { rechargeId: string; referenceCode: string }) =>
      walletApi.confirmRecharge(rechargeId, referenceCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "wallet"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "wallet", "recharges"] });
    },
  });

  return {
    confirmAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export function useRechargeHistory() {
  const query = useQuery({
    queryKey: ["payments", "wallet", "recharges"],
    queryFn: walletApi.getRechargeHistory,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    recharges: query.data ?? [],
    isLoading: query.isLoading,
  };
}

// ─── Local Payment Methods ────────────────────────────────────────────────────

export function useLocalPaymentMethods() {
  const query = useQuery({
    queryKey: ["payments", "local-methods"],
    queryFn: localPaymentMethodsApi.getLocalMethods,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    methods: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useAddLocalMethod() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { methodType: string; phoneNumber: string; accountHolderName?: string }) =>
      localPaymentMethodsApi.addLocalMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "local-methods"] });
    },
  });

  return {
    addAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export function useRemoveLocalMethod() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (methodId: string) => localPaymentMethodsApi.removeLocalMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "local-methods"] });
    },
  });

  return {
    removeAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export function useSetDefaultLocalMethod() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (methodId: string) => localPaymentMethodsApi.setDefaultMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "local-methods"] });
    },
  });

  return {
    setDefaultAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

// ─── Escrow ───────────────────────────────────────────────────────────────────

export function useEscrowList() {
  const query = useQuery({
    queryKey: ["payments", "escrow"],
    queryFn: escrowApi.getEscrowList,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    escrows: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useEscrowDetail(milestoneId: string) {
  const query = useQuery({
    queryKey: ["payments", "escrow", milestoneId],
    queryFn: () => escrowApi.getMilestoneDetail(milestoneId),
    enabled: !!milestoneId,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    escrow: query.data,
    isLoading: query.isLoading,
  };
}

export function useCreateDepositIntent() {
  const mutation = useMutation({
    mutationFn: ({
      milestoneId,
      ...data
    }: {
      milestoneId: string;
      projectId: string;
      freelancerUserId: string;
      title: string;
      description?: string;
      amount: number;
      clientEmail: string;
    }) => escrowApi.createDepositIntent(milestoneId, data),
  });

  return {
    createAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    data: mutation.data,
  };
}

export function useProcessPayment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      milestoneId,
      mpPaymentId,
      mpPreferenceId,
    }: {
      milestoneId: string;
      mpPaymentId: string;
      mpPreferenceId: string;
    }) => escrowApi.processPayment(milestoneId, { mpPaymentId, mpPreferenceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "escrow"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "wallet"] });
    },
  });

  return {
    processAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export function useProcessCulqiPayment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      milestoneId,
      token,
      email,
    }: {
      milestoneId: string;
      token: string;
      email: string;
    }) => escrowApi.processCulqiPayment(milestoneId, { token, email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "escrow"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "wallet"] });
    },
  });

  return {
    processCulqiAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export function useReleaseMilestone() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (milestoneId: string) => escrowApi.releaseMilestone(milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "escrow"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "wallet"] });
    },
  });

  return {
    releaseAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export function useRefundMilestone() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ milestoneId, reason }: { milestoneId: string; reason: string }) =>
      escrowApi.refundMilestone(milestoneId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "escrow"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "wallet"] });
    },
  });

  return {
    refundAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

// ─── Disputes ─────────────────────────────────────────────────────────────────

export function useDisputes() {
  const query = useQuery({
    queryKey: ["payments", "disputes"],
    queryFn: disputeApi.getDisputes,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    disputes: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useCreateDispute() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { escrowId: string; reason: string; description: string }) =>
      disputeApi.createDispute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "disputes"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "escrow"] });
    },
  });

  return {
    createAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export function useResolveDispute() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      disputeId,
      resolution,
      releaseToFreelancer,
    }: {
      disputeId: string;
      resolution: string;
      releaseToFreelancer: boolean;
    }) => disputeApi.resolveDispute(disputeId, { resolution, releaseToFreelancer }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "disputes"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "escrow"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "wallet"] });
    },
  });

  return {
    resolveAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export function useAuditLogs(params?: {
  userId?: string;
  action?: string;
  entityType?: string;
}) {
  const query = useQuery({
    queryKey: ["payments", "audit-logs", params],
    queryFn: () => auditApi.getAuditLogs(params),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    logs: query.data ?? [],
    isLoading: query.isLoading,
  };
}

// ─── Refunds ──────────────────────────────────────────────────────────────────

export function useCreateRefund() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { escrowId: string; reason: string; amount?: number }) =>
      refundApi.createRefund(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "escrow"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "wallet"] });
    },
  });

  return {
    createAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

// ─── Legacy compatibility aliases ─────────────────────────────────────────────

export function usePaymentMethods() {
  return useLocalPaymentMethods();
}

export function useAddPaymentMethod() {
  return useAddLocalMethod();
}

export function useTransactions() {
  return useWalletTransactions();
}

export function useEscrowProjects() {
  const { escrows, isLoading } = useEscrowList();
  return {
    projects: escrows.map((e) => ({
      id: e.milestoneId,
      title: e.projectName,
      client: e.clientId,
      status: e.status,
      currentMilestone: 1,
      totalMilestones: 1,
      estimatedRelease: e.releasedAt ?? e.createdAt,
      escrowAmount: e.amount,
    })),
    isLoading,
  };
}
