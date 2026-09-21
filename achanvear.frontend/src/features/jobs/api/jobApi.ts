// features/jobs/api/jobApi.ts
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type {
  Job,
  JobFilters,
  PaginatedJobs,
  ApplyJobPayload,
  CreateJobPayload,
  JobAiSuggestion,
} from "../types/job.types";

// ─── Tipo para la respuesta de applicants ─────────────────────────────────────

export interface JobApplicationResponse {
  id: string;
  candidateUserId: string;
  candidateName: string;
  candidateEmail: string;
  cvUrl: string | null;
  coverLetter: string | null;
  appliedAt: string;
  status: string;
}

// ─── Tipo para la respuesta del detalle del candidato ──────────────────────────

export interface CandidateDrawerDetailResponse {
  applicationId: string;
  candidateUserId: string;
  candidateName: string;
  candidateEmail: string;
  cvUrl: string;
  coverLetter: string;
  appliedAt: string;
  applicationStatus: string;
  hiringProcessId: string;
  currentStage: string;
  screeningScore: number | null;
  screeningSummary: string | null;
  theoryInterviewScore: number | null;
  technicalInterviewScore: number | null;
  softSkillsScore: number | null;
  executiveReport: {
    available: boolean;
    summary: string | null;
    recommendation: string | null;
    strengths: string | null;
    areasOfOpportunity: string | null;
  } | null;
  interviewRecording: {
    available: boolean;
    videoUrl: string | null;
    audioUrl: string | null;
    durationSeconds: number | null;
  } | null;
  stages: Array<{
    stage: string;
    label: string;
    status: string;
    completedAt: string | null;
  }>;
}

export const jobApi = {
  // GET /jobs — listado con filtros y paginación
  getAll: async (filters: Partial<JobFilters>): Promise<PaginatedJobs> => {
    const params = {
      ...(filters.search && { search: filters.search }),
      ...(filters.location && { location: filters.location }),
      ...(filters.type && { type: filters.type }),
      ...(filters.status && { status: filters.status }),
      ...(filters.companyId && { companyId: filters.companyId }),
      page: filters.page ?? 0,
      size: filters.size ?? 10,
      sortBy: filters.sortBy ?? "createdAt",
      sortDirection: filters.sortDirection ?? "DESC",
    };
    const response = await api.get<ApiResponse<PaginatedJobs>>("/jobs", { params });
    return parseResponse(response);
  },

  // GET /jobs/{id} — detalle de un empleo
  getById: async (id: string): Promise<Job> => {
    const response = await api.get<ApiResponse<Job>>(`/jobs/${id}`);
    return parseResponse(response);
  },

  // POST /jobs — crear un nuevo empleo (COMPANY)
  create: async (payload: CreateJobPayload): Promise<Job> => {
    const response = await api.post<ApiResponse<Job>>("/jobs", payload);
    return parseResponse(response);
  },

  // GET /jobs/applied-ids — obtener IDs de empleos a los que ya postuló
  getAppliedJobIds: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>("/jobs/applied-ids");
    return parseResponse(response);
  },

  // POST /jobs/{id}/apply — postular a un empleo

  apply: async (id: string, payload: ApplyJobPayload): Promise<Job> => {
    const response = await api.post<ApiResponse<Job>>(`/jobs/${id}/apply`, payload);
    return parseResponse(response);
  },

  // GET /jobs/my-posts — obtener mis publicaciones (COMPANY)
  getMyPosts: async (filters?: Partial<JobFilters>): Promise<PaginatedJobs> => {
    const params = {
      ...(filters?.search && { search: filters.search }),
      page: filters?.page ?? 0,
      size: filters?.size ?? 100,
      sortBy: filters?.sortBy ?? "createdAt",
      sortDirection: filters?.sortDirection ?? "DESC",
    };
    const response = await api.get<ApiResponse<PaginatedJobs>>("/jobs/my-posts", { params });
    return parseResponse(response);
  },

  // PUT /jobs/{id} — actualizar un empleo (COMPANY)
  update: async (id: string, payload: Partial<CreateJobPayload>): Promise<Job> => {
    const response = await api.put<ApiResponse<Job>>(`/jobs/${id}`, payload);
    return parseResponse(response);
  },

  // DELETE /jobs/{id} — eliminar un empleo (COMPANY)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },

  // PATCH /jobs/{id}/status — cambiar estado de un empleo (COMPANY)
  changeStatus: async (id: string, status: string): Promise<Job> => {
    const response = await api.patch<ApiResponse<Job>>(`/jobs/${id}/status`, { status });
    return parseResponse(response);
  },

  // GET /jobs/{id}/applicants — obtener postulantes de un empleo (COMPANY)
  getApplicants: async (id: string, filters?: { page?: number; size?: number }): Promise<JobApplicationResponse[]> => {
    const params = {
      page: filters?.page ?? 0,
      size: filters?.size ?? 100,
    };
    const response = await api.get<ApiResponse<{ content: JobApplicationResponse[] }>>(`/jobs/${id}/applicants`, { params });
    const data = parseResponse(response);
    return data.content ?? [];
  },

  // GET /jobs/{jobPostId}/applicants/{applicationId}/detail — detalle del candidato para el drawer
  getCandidateDrawerDetail: async (jobPostId: string, applicationId: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/jobs/${jobPostId}/applicants/${applicationId}/detail`);
    return parseResponse(response);
  },

  // POST /jobs/{jobPostId}/applicants/{applicationId}/advance — avanzar/rechazar candidato
  advanceCandidate: async (jobPostId: string, applicationId: string, action: "ADVANCE" | "REJECT", reason?: string): Promise<JobApplicationResponse> => {
    const response = await api.post<ApiResponse<JobApplicationResponse>>(`/jobs/${jobPostId}/applicants/${applicationId}/advance`, { action, reason });
    return parseResponse(response);
  },

  // POST /jobs/ai-suggest — obtener sugerencia de IA para crear oferta laboral
  aiSuggest: async (prompt: string): Promise<JobAiSuggestion> => {
    const response = await api.post<ApiResponse<JobAiSuggestion>>("/jobs/ai-suggest", { prompt });
    return parseResponse(response);
  },
};
