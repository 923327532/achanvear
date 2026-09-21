
// src/features/profile/types/profile.types.ts

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface ReputationScore {
  averageStars: number;
  recommendationPercentage: number;
  totalRatings: number;
}

export interface Skill {
  name: string;
  level: string;
  yearsOfExperience: number;
}

export interface PortfolioItem {
  title: string;
  description: string;
  assetUrl: string;
  projectUrl: string;
}

export interface Rating {
  reviewerUserId: string;
  reviewerType: string;
  stars: number;
  recommended: boolean;
  comment: string;
  createdAt: string;
}

// ─── Freelancer Profile ───────────────────────────────────────────────────────

export interface FreelancerProfile {
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
  certifications: Certification[];
  // Campos legacy para compatibilidad con componentes existentes
  headline: string;
  location: string;
  reputationScore: ReputationScore;
  skills: Skill[];
  portfolioItems: PortfolioItem[];
  ratings: Rating[];

  // ── Preferencias de Configuración (2.1 - 2.4) ──
  availabilityStatus: string | null;
  cvVisibility: string | null;
  preferredCurrency: string | null;
  preferredPaymentMethod: string | null;
  language: string | null;
  timezone: string | null;
  notificationPreferences: string | null;
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  credentialUrl: string;
}

// ─── Company Profile — coincide con CompanyResponse del backend ──────────────

export interface CompanyProfile {
  id: string;
  ownerUserId: string;
  businessName: string;
  tradeName: string | null;
  legalName: string;
  industry: string;
  specialty: string;
  companySize: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  biography: string;
  achievements: string | null;
  address: string;
  paymentMethodType: string;
  companyPlan: string;
  representativeDni: string;
  ruc: string | null;
  status: string;
  name: string;
}

// ─── Alias — los componentes usan Profile, el backend devuelve FreelancerProfile
export type Profile = FreelancerProfile;

export type StorageFolder = "CURRICULUM" | "PROFILE_PHOTO" | "PORTFOLIO";

export interface PresignedUrlResponse {
  fileKey: string;
  uploadUrl: string;
  publicFileUrl: string;
}

// ─── Payment Methods ──────────────────────────────────────────────────────────

export interface PaymentMethod {
  id: string;
  companyId: string;
  brand: string;       // "Visa", "Mastercard", "American Express"
  last4: string;       // últimos 4 dígitos
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
}

export interface CreatePaymentMethodRequest {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
}

export interface UpdatePaymentMethodRequest {
  isDefault?: boolean;
}

// ─── UI-only ──────────────────────────────────────────────────────────────────

export interface AIEvaluation {
  agentName: string;
  evaluationType: string;
  score: number;
  maxScore: number;
}

export const SKILL_LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
  EXPERT: "Experto",
};

export const SKILL_LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-gray-200",
  INTERMEDIATE: "bg-blue-400",
  ADVANCED: "bg-[#0EA5A0]",
  EXPERT: "bg-[#1B3A6B]",
};

export const SKILL_LEVEL_BAR: Record<string, string> = {
  BEGINNER: "w-1/4",
  INTERMEDIATE: "w-2/4",
  ADVANCED: "w-3/4",
  EXPERT: "w-full",
};