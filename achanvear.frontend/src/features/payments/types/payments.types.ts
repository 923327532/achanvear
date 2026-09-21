// features/payments/types/payments.types.ts

// ─── Wallet ───────────────────────────────────────────────────────────────────

export interface WalletSummary {
  id: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalSpent: number;
  currency: string;
  isActive: boolean;
}

// ─── Quick Recharge ───────────────────────────────────────────────────────────

export type QuickRechargeStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface QuickRecharge {
  id: string;
  amount: number;
  method: string;
  phoneNumber: string;
  status: QuickRechargeStatus;
  referenceCode: string | null;
  completedAt: string | null;
}

// ─── Wallet Transactions ──────────────────────────────────────────────────────

export type WalletTransactionType = "DEPOSIT" | "PAYMENT" | "REFUND" | "WITHDRAWAL";

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string;
  referenceId: string;
  description: string;
  createdAt: string;
}

// ─── Resumen de pagos del freelancer (wallet-summary) ─────────────────────────

export interface ProjectPaymentRow {
  projectId: string;
  projectTitle: string;
  milestoneId: string;
  milestoneTitle: string;
  grossAmount: number;
  platformCommission: number;
  mpCommission: number;
  netAmount: number;
  status: string;
  date: string | null;
}

export interface FreelancerWalletSummary {
  totalEarned: number;
  pendingRelease: number;
  availableForWithdrawal: number;
  totalPlatformCommissions: number;
  totalMpCommissions: number;
  netEarnings: number;
  recentPayments: ProjectPaymentRow[];
  currency: string;
}

// ─── Métodos de retiro y retiros (Izipay Dispersión) ──────────────────────────

export type PayoutStatus = "REQUESTED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface PayoutMethod {
  id: string;
  provider: string;
  cardToken: string | null;
  maskedCard: string;
  cardBrand: string | null;
  lastFourDigits: string;
  accountHolderName: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string | null;
}

export interface Payout {
  id: string;
  userId: string;
  payoutMethodId: string;
  amount: number;
  status: PayoutStatus;
  externalDisbursementId: string | null;
  failureReason: string | null;
  requestedAt: string | null;
  completedAt: string | null;
  createdAt: string | null;
}

export const PAYOUT_STATUS_CONFIG: Record<PayoutStatus, { label: string; color: string }> = {
  REQUESTED:  { label: "Solicitado", color: "bg-amber-100 text-amber-700" },
  PROCESSING: { label: "En proceso", color: "bg-blue-100 text-blue-700" },
  COMPLETED:  { label: "Pagado",     color: "bg-emerald-100 text-emerald-700" },
  FAILED:     { label: "Fallido",    color: "bg-red-100 text-red-600" },
  CANCELLED:  { label: "Cancelado",  color: "bg-slate-100 text-slate-600" },
};

// ─── Escrow / Milestones ──────────────────────────────────────────────────────

export type MilestoneStatus = "PENDING" | "HELD" | "RELEASED" | "REFUNDED" | "DISPUTED";

export interface EscrowProject {
  id: string;
  title: string;
  client: string;
  status: MilestoneStatus;
  currentMilestone: number;
  totalMilestones: number;
  estimatedRelease: string;
  escrowAmount: number;
}

// ─── Payment methods (local - Yape/Plin) ──────────────────────────────────────

export type PaymentMethodType = "YAPE" | "PLIN" | "BANK" | "CARD";

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  detail: string;
  isPrimary: boolean;
}

// ─── Add payment method form ──────────────────────────────────────────────────

export type AddMethodTab = "TARJETA" | "CUENTA_BANCARIA" | "YAPE_PLIN";
export type YapePlinSubtype = "YAPE" | "PLIN";
export type AccountType = "AHORRO" | "CORRIENTE";

// ─── Mercado Pago ─────────────────────────────────────────────────────────────

export interface MercadoPagoPreference {
  id: string;
  initPoint: string;
  sandboxInitPoint: string;
  preferenceId: string;
}

export interface PaymentIntent {
  milestoneId: string;
  amount: number;
  currency: string;
  description: string;
  preference: MercadoPagoPreference;
  status: string;
  expiresAt: string;
}

// ─── Escrow Detail ────────────────────────────────────────────────────────────

export interface EscrowDetail {
  id: string;
  milestoneId: string;
  amount: number;
  currency: string;
  status: MilestoneStatus;
  mpPaymentId: string | null;
  mpPreferenceId: string | null;
  clientId: string;
  freelancerId: string;
  projectName: string;
  heldAt: string | null;
  releasedAt: string | null;
  createdAt: string;
}

// ─── Dispute ──────────────────────────────────────────────────────────────────

export interface Dispute {
  id: string;
  escrowId: string;
  raisedBy: string;
  reason: string;
  description: string;
  status: "OPEN" | "RESOLVED";
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const TRANSACTION_TYPE_COLORS: Record<string, string> = {
  DEPOSIT: "bg-emerald-100 text-emerald-700",
  PAYMENT: "bg-blue-100 text-blue-700",
  REFUND: "bg-purple-100 text-purple-700",
  WITHDRAWAL: "bg-amber-100 text-amber-700",
};

export const MILESTONE_STATUS_CONFIG: Record<MilestoneStatus, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-gray-100 text-gray-600" },
  HELD: { label: "Retenido", color: "bg-amber-100 text-amber-700" },
  RELEASED: { label: "Liberado", color: "bg-emerald-100 text-emerald-700" },
  REFUNDED: { label: "Reembolsado", color: "bg-red-100 text-red-600" },
  DISPUTED: { label: "En Disputa", color: "bg-purple-100 text-purple-700" },
};
