// features/freelance/api/freelanceApi.ts
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type {
  Project,
  ProjectFilters,
  PaginatedProjects,
  SubmitProposalPayload,
} from "../types/freelance.types";

function mapProject(raw: any): Project {
  return {
    ...raw,
    budget: raw.minBudget ?? raw.budget ?? 0,
    budgetMax: raw.maxBudget ?? raw.budgetMax ?? undefined,
    proposals: raw.proposals ?? [],
    milestones: raw.milestones ?? [],
    skills: raw.skills ?? [],
    hasApplied: raw.hasApplied ?? false,
  };
}

function mapPaginated(raw: any): PaginatedProjects {
  return {
    ...raw,
    items: (raw.items ?? []).map(mapProject),
  };
}

// ─── Tipos que venían de companyProjectsApi.ts (fusionado aquí) ───────────────

export interface CreateProjectPayload {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget?: number;
  estimatedDays: number;
  experienceLevel?: string;
  skills?: string[];
  budgetType?: string;
  modality?: string;
  providerType?: string;
  attachments?: string[];
  currency?: string;
  language?: string;
  minBudget?: number;
  maxBudget?: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
}

export interface ProjectAiSuggestion {
  title: string;
  category: string;
  subcategory: string;
  description: string;
  skills: string;
  experienceLevel: string;
  budgetType: string;
  budget: number | null;
  minBudget: number | null;
  maxBudget: number | null;
  hourlyRateMin: number | null;
  hourlyRateMax: number | null;
  currency: string;
  language: string;
  estimatedDays: number | null;
  modality: string;
  providerType: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const freelanceApi = {
  // GET /freelance/projects — listar proyectos con filtros
  getAll: async (filters: Partial<ProjectFilters>): Promise<PaginatedProjects> => {
    const params = {
      ...(filters.search    && { search: filters.search }),
      ...(filters.category  && { category: filters.category }),
      ...(filters.status    && { status: filters.status }),
      page:          filters.page          ?? 0,
      size:          filters.size          ?? 10,
      sortBy:        filters.sortBy        ?? "createdAt",
      sortDirection: filters.sortDirection ?? "DESC",
    };
    const response = await api.get<ApiResponse<any>>("/freelance/projects", { params });
    return mapPaginated(parseResponse(response));
  },

  // GET /freelance/projects — listar proyectos filtrados por empresa (mismo endpoint,
  // con params distintos; antes vivía en companyProjectsApi.getMyProjects)
  getMyProjects: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedProjects> => {
    const response = await api.get<ApiResponse<any>>("/freelance/projects", { params });
    return mapPaginated(parseResponse(response));
  },

  // GET /freelance/projects/{projectId} — detalle de un proyecto
  getById: async (projectId: string): Promise<Project> => {
    const response = await api.get<ApiResponse<any>>(`/freelance/projects/${projectId}`);
    return mapProject(parseResponse(response));
  },

  // POST /freelance/projects — crear proyecto (antes en companyProjectsApi.create)
  create: async (payload: CreateProjectPayload): Promise<Project> => {
    const response = await api.post<ApiResponse<any>>("/freelance/projects", payload);
    return mapProject(parseResponse(response));
  },

  // PUT /freelance/projects/{projectId} — actualizar proyecto (antes companyProjectsApi.update)
  update: async (projectId: string, payload: CreateProjectPayload): Promise<Project> => {
    const response = await api.put<ApiResponse<any>>(`/freelance/projects/${projectId}`, payload);
    return mapProject(parseResponse(response));
  },

  // POST /freelance/projects/{projectId}/proposals — postular a un proyecto
  submitProposal: async (
    projectId: string,
    payload: SubmitProposalPayload
  ): Promise<void> => {
    await api.post(`/freelance/projects/${projectId}/proposals`, payload);
  },

  // POST /freelance/projects/{projectId}/proposals/{proposalId}/accept — aceptar propuesta
  // (antes companyProjectsApi.acceptProposal)
  acceptProposal: async (projectId: string, proposalId: string): Promise<Project> => {
    const response = await api.post<ApiResponse<any>>(
      `/freelance/projects/${projectId}/proposals/${proposalId}/accept`
    );
    return mapProject(parseResponse(response));
  },

  // GET /freelance/projects/my-proposals — propuestas enviadas por el freelancer
  getMyProposals: async (params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<PaginatedProjects> => {
    const response = await api.get<ApiResponse<any>>("/freelance/projects/my-proposals", {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10,
        sortBy: params.sortBy ?? "createdAt",
        sortDirection: params.sortDirection ?? "DESC",
      },
    });
    return mapPaginated(parseResponse(response));
  },

  // POST /freelance/proposals/ai-suggest — sugerencia IA para una propuesta (freelancer)
  aiSuggestProposal: async (prompt: string): Promise<{
    coverLetter: string;
    proposedBudget: number;
    estimatedDays: number;
  }> => {
    const response = await api.post<ApiResponse<{
      coverLetter: string;
      proposedBudget: number;
      estimatedDays: number;
    }>>("/freelance/proposals/ai-suggest", { prompt });
    return parseResponse(response);
  },

  // POST /freelance/projects/ai-suggest — sugerencia IA para crear un proyecto (empresa)
  // (antes companyProjectsApi.aiSuggest — distinto del de arriba, que es para propuestas)
  aiSuggest: async (prompt: string): Promise<ProjectAiSuggestion> => {
    const response = await api.post<ApiResponse<ProjectAiSuggestion>>(
      "/freelance/projects/ai-suggest",
      { prompt }
    );
    return parseResponse(response);
  },

  // PATCH /freelance/projects/{projectId}/pause — pausar proyecto
  pause: async (projectId: string): Promise<void> => {
    await api.patch(`/freelance/projects/${projectId}/pause`);
  },

  // PATCH /freelance/projects/{projectId}/resume — reanudar proyecto
  resume: async (projectId: string): Promise<void> => {
    await api.patch(`/freelance/projects/${projectId}/resume`);
  },

  // DELETE /freelance/projects/{projectId} — eliminar proyecto (soft-delete)
  remove: async (projectId: string): Promise<void> => {
    await api.delete(`/freelance/projects/${projectId}`);
  },
};
