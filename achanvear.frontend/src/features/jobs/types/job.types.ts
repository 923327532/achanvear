// features/jobs/types/job.types.ts

// ─── Enums ────────────────────────────────────────────────────────────────────

export type JobType = "FULL_TIME" | "PART_TIME" | "FREELANCE" | "INTERNSHIP";
// Coincide con el backend: PUBLISHED, SUSPENDED, CLOSED, DRAFT
export type JobStatus = "PUBLISHED" | "SUSPENDED" | "CLOSED" | "DRAFT";
export type ApplicationStatus = "PENDING" | "REVIEWING" | "ACCEPTED" | "REJECTED";

// Estos no vienen del backend aún — los usamos como fallback en el frontend
export type JobLevel = "JUNIOR" | "MID" | "SENIOR";
export type JobModality = "REMOTE" | "HYBRID" | "ON_SITE";

// ─── Company (embebida en Job) ────────────────────────────────────────────────

export interface JobCompany {
  id: string;
  businessName: string;
  tradeName: string;
  industry: string;
  specialty: string;
  companySize: string;
  logoUrl: string | null;
  status: string;
}

// ─── Application ──────────────────────────────────────────────────────────────

export interface JobApplication {
  id: string;
  candidateUserId: string;
  cvUrl: string | null;
  coverLetter: string | null;
  appliedAt: string;
  status: ApplicationStatus;
}

// ─── Job ──────────────────────────────────────────────────────────────────────

export interface Job {
  id: string;
  companyId: string;
  company: JobCompany;
  title: string;
  description: string;
  location: string;
  type: JobType;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  vacancies: number;
  requirements?: string;
  status: JobStatus;
  applications: JobApplication[];

  // Campos pendientes del backend — opcional por ahora
  level?: JobLevel;
  modality?: JobModality;
  skills?: string[];
  createdAt?: string;

  // Campos de configuracion de seleccion
  selectionMode?: string;
  maxApplicants?: number;
  closingDate?: string;
  closingMode?: string;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface JobFilters {
  search?: string;
  location?: string;
  type?: JobType | "";
  status?: JobStatus | "";
  companyId?: string;
  page: number;
  size: number;
  sortBy: string;
  sortDirection: "ASC" | "DESC";
}

export const DEFAULT_JOB_FILTERS: JobFilters = {
  search: "",
  location: "",
  type: "",
  status: "PUBLISHED",
  page: 0,
  size: 10,
  sortBy: "createdAt",
  sortDirection: "DESC",
};

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedJobs {
  items: Job[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

// ─── Selection mode ───────────────────────────────────────────────────────────

export type SelectionMode = "MANUAL" | "SEMI_AUTOMATED" | "FULLY_AUTOMATED";

// ─── Modo de cierre de vacantes ───────────────────────────────────────────────

export type ClosingMode = "MAX_APPLICANTS" | "FIXED_DATE" | "CONTINUOUS";

export interface AutomationConfig {
  maxCandidatesForScreening?: number;
  candidatesForTheoryInterview?: number;
  minimumScore?: number;
}

// ─── Create payload ───────────────────────────────────────────────────────────

export interface CreateJobPayload {
  title: string;
  description: string;
  location: string;
  type: JobType;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  vacancies: number;
  requirements?: string;
  selectionMode: SelectionMode;
  hideSalary?: boolean;
  maxCandidatesForScreening?: number;
  candidatesForTheoryInterview?: number;
  minimumScore?: number;
  // Cierre de vacantes
  closingMode?: ClosingMode;
  closingDate?: string; // ISO instant para FIXED_DATE
  maxApplicants?: number; // maximo de postulantes para MAX_APPLICANTS
  // Cuando notificar al candidato
  notificationTiming?: "IMMEDIATE" | "AFTER_2_HOURS" | "AFTER_CLOSING";
}

// ─── Apply payload ────────────────────────────────────────────────────────────

export interface ApplyJobPayload {
  cvUrl: string;
  coverLetter: string;
}

// ─── AI Suggestion ────────────────────────────────────────────────────────────

export interface JobAiSuggestion {
  title: string | null;
  description: string | null;
  requirements: string | null;
  type: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
}
