// features/payments/types/escrow-record.types.ts

export interface EscrowRecord {
  escrowId: string;
  milestoneId: string;
  projectId: string;
  amount: number;
  platformCommission: number;
  mpCommission: number;
  freelancerAmount: number;
  status: string;
  heldAt: string | null;
  releasedAt: string | null;
  refundedAt: string | null;
  disputedAt: string | null;
  disputeReason: string | null;
}