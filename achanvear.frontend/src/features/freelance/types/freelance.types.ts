// features/freelance/types/freelance.types.ts

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ProjectStatus = "OPEN" | "IN_PROGRESS" | "PAUSED" | "COMPLETED" | "CANCELLED" | "DRAFT";
export type ProposalStatus = "SUBMITTED" | "ACCEPTED" | "REJECTED";
export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "REJECTED";
export type ProjectDuration = "LESS_THAN_1_WEEK" | "1_2_WEEKS" | "2_4_WEEKS" | "MORE_THAN_1_MONTH";

// ─── Proposal ─────────────────────────────────────────────────────────────────

export interface Proposal {
  id: string;
  freelancerUserId: string;
  coverLetter: string;
  proposedBudget: number;
  estimatedDays: number;
  submittedAt: string;
  status: ProposalStatus;
}

// ─── Milestone ────────────────────────────────────────────────────────────────

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: MilestoneStatus;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  clientUserId: string;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  budget: number;
  estimatedDays: number;
  experienceLevel: string | null;
  skills: string[];
  budgetType: string | null;
  modality: string | null;
  providerType: string | null;
  attachments: string[];
  status: ProjectStatus;
  selectedFreelancerUserId: string | null;
  proposals: Proposal[];
  milestones: Milestone[];
  createdAt: string;
  currency: string | null;
  language: string | null;
  minBudget: number | null;
  maxBudget: number | null;
  hourlyRateMin: number | null;
  hourlyRateMax: number | null;

  // ── Datos de empresa ──
  companyName: string | null;
  companyInitials: string | null;
  companyLogoUrl: string | null;
  companyRating: number;
  publishedJobsCount: number;
  proposalCount: number;
  hasApplied: boolean;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface ProjectFilters {
  search?: string;
  category?: string;
  status?: ProjectStatus | "";
  budgetMin?: number;
  budgetMax?: number;
  duration?: ProjectDuration | "";
  page: number;
  size: number;
  sortBy: string;
  sortDirection: "ASC" | "DESC";
}

export const DEFAULT_PROJECT_FILTERS: ProjectFilters = {
  search: "",
  category: "",
  status: "OPEN",
  page: 0,
  size: 10,
  sortBy: "createdAt",
  sortDirection: "DESC",
};

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedProjects {
  items: Project[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

// ─── Proposal Payload ─────────────────────────────────────────────────────────

export interface SubmitProposalPayload {
  coverLetter: string;
  proposedBudget: number;
  estimatedDays: number;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const PROJECT_CATEGORIES = [
  "Desarrollo Web",
  "App Móvil",
  "Diseño",
  "Marketing",
  "Consultoría",
  "Legal",
  "Contabilidad",
  "Otros",
] as const;