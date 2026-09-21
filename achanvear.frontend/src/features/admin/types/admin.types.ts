// features/admin/types/admin.types.ts
export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  dni: string | null;
  phone: string | null;
  role: string;
  status: string;
  representanteDni: string | null;
  representanteLegal: string | null;
  ruc: string | null;
}

export interface AdminUserPage {
  items: AdminUser[];
  totalItems: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface UserPeriodBucket {
  period: string;
  count: number;
}

export interface AdminUserKpis {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  previousNewUsers: number;
  newUsersVariationPct: number;
  totalUsersGrowthPct: number;
  activeUsersInPeriod: number;
  previousActiveUsersInPeriod: number;
  activeUsersVariationPct: number;
  usersByPeriod: UserPeriodBucket[];
  previousUsersByPeriod: UserPeriodBucket[];
  usersByStatus: Record<string, number>;
  usersByRole: Record<string, number>;
  periodStart: string;
  periodEnd: string;
  previousPeriodStart: string;
  previousPeriodEnd: string;
  granularity: "DAY" | "WEEK" | "MONTH";
}

export interface CreateUserPayload {
  email: string;
  fullName: string;
  dni?: string;
  phone?: string;
  password: string;
  role: string;
}

export interface AdminConsent {
  id: string;
  userId: string;
  interviewId: string | null;
  consentType: string;
  documentVersion: string | null;
  accepted: boolean;
  status: string;
  acceptedAt: string;
  withdrawnAt: string | null;
}

export interface AdminConsentPage {
  items: AdminConsent[];
  totalItems: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface AdminInterview {
  id: string;
  candidateId: string;
  jobId: string;
  interviewType: string;
  status: string;
  score: number | null;
  result: string | null;
  totalQuestions: number;
  totalAnswers: number;
  totalViolations: number;
  recordingFileKey: string | null;
  usedAi: boolean;
}

export interface AdminInterviewPage {
  items: AdminInterview[];
  totalItems: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface AdminMetrics {
  totalUsers: number;
  totalCompanies: number;
  totalFreelancers: number;
  totalApplications: number;
  interviewsStarted: number;
  interviewsCompleted: number;
  interviewsApproved: number;
  interviewsRejected: number;
  antiCheatIncidents: number;
  aiSystemUsage: number;
}

export interface LegalDocumentVersion {
  id: string;
  documentType: string;
  version: string;
  title: string;
  content: string;
  status: string;
  publishedAt: string | null;
  publishedBy: string | null;
  createdAt: string;
}

export interface LegalDocument {
  type: string;
  currentVersionId: string | null;
  status: string;
  currentVersion: LegalDocumentVersion | null;
}

export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  metadata: string | null;
  createdAt: string;
}

export interface AdminAuditLogPage {
  items: AdminAuditLog[];
  totalItems: number;
  totalPages: number;
  page: number;
  size: number;
}
