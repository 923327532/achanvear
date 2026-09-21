// features/chat/types/chat.types.ts

export enum ProjectStatus {
  NEGOTIATING = "NEGOTIATING",
  PROPOSAL_SENT = "PROPOSAL_SENT",
  HIRED = "HIRED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.NEGOTIATING]: "En negociación",
  [ProjectStatus.PROPOSAL_SENT]: "Propuesta enviada",
  [ProjectStatus.HIRED]: "Contratado",
  [ProjectStatus.IN_PROGRESS]: "En desarrollo",
  [ProjectStatus.COMPLETED]: "Finalizado",
  [ProjectStatus.CANCELLED]: "Cancelado",
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.NEGOTIATING]: "bg-amber-50 text-amber-700 border-amber-200",
  [ProjectStatus.PROPOSAL_SENT]: "bg-blue-50 text-blue-700 border-blue-200",
  [ProjectStatus.HIRED]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [ProjectStatus.IN_PROGRESS]: "bg-purple-50 text-purple-700 border-purple-200",
  [ProjectStatus.COMPLETED]: "bg-green-50 text-green-700 border-green-200",
  [ProjectStatus.CANCELLED]: "bg-red-50 text-red-700 border-red-200",
};

export interface Conversation {
  id: string;
  participantName: string;
  participantRole: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Attachment {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  uploadedAt: string;
  expiresAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sentAt: string;
  isMine: boolean;
  attachments?: Attachment[];
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
}

export interface DownloadAttachmentResponse {
  downloadUrl: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
}

// ─── Profile types for ParticipantInfoPanel ──────────────────────────────────

export interface FreelancerProfileResponse {
  id: string | null;
  userId: string;
  name: string;
  industry: string;
  specialty: string;
  profilePhotoUrl: string | null;
  biography: string;
  achievements: string;
  address: string;
  paymentMethodType: string;
  dni: string;
  curriculumUrl: string | null;
  cvData: string | null;
  status: string;
  certifications: any[];
  headline: string;
  location: string;
  reputationScore: {
    averageStars: number;
    recommendationPercentage: number;
    totalRatings: number;
  } | null;
  skills: { name: string; level: string; yearsOfExperience: number }[];
  portfolioItems: any[];
  ratings: any[];
}

export interface CompanyProfileResponse {
  id: string;
  ownerUserId: string;
  businessName: string;
  tradeName: string;
  legalName: string;
  industry: string;
  specialty: string;
  companySize: string;
  logoUrl: string | null;
  biography: string;
  achievements: string;
  address: string;
  paymentMethodType: string;
  companyPlan: string;
  representativeDni: string;
  ruc: string | null;
  status: string;
  name: string;
}
