// features/jobs/api/candidateDrawerApi.ts
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type {
  CandidateDrawerDetail,
  AdvanceCandidatePayload,
} from "../types/candidate-drawer.types";

// ─── Tipo de la respuesta del backend ──────────────────────────────────────────

interface BackendCandidateDrawerDetail {
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

// ─── Mapper: Backend → Frontend ─────────────────────────────────────────────────

function mapBackendToFrontend(
  backend: BackendCandidateDrawerDetail,
  jobTitle?: string
): CandidateDrawerDetail {
  // Calcular score general ponderado
  const scores = [backend.screeningScore, backend.theoryInterviewScore, backend.technicalInterviewScore, backend.softSkillsScore];
  const validScores = scores.filter((s): s is number => s !== null);
  const overall = validScores.length > 0
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : null;

  // Encontrar índice de la etapa actual
  const currentStageIndex = backend.stages.findIndex((s) => s.status === "CURRENT");

  // Mapa de labels para las etapas
  const stageLabels: Record<string, string> = {};
  backend.stages.forEach((s) => {
    stageLabels[s.stage] = s.label;
  });

  return {
    id: backend.applicationId,
    processId: backend.hiringProcessId || backend.applicationId,
    candidateUserId: backend.candidateUserId,
    name: backend.candidateName,
    email: backend.candidateEmail,
    title: "",
    avatar: "",
    contextType: "JOB",
    jobTitle: jobTitle,
    cvUrl: backend.cvUrl || null,
    coverLetter: backend.coverLetter || null,
    scores: {
      screening: backend.screeningScore,
      theory: backend.theoryInterviewScore,
      technical: backend.technicalInterviewScore,
      softSkills: backend.softSkillsScore,
      overall,
    },
    generalInfo: {
      location: "",
      experience: "",
      education: "",
      appliedAt: backend.appliedAt,
      currentStage: backend.currentStage,
      stageLabel: stageLabels[backend.currentStage] || backend.currentStage,
    },
    interview: {
      exists: backend.interviewRecording?.available === true,
      status: backend.interviewRecording?.available ? "COMPLETED" : "PENDING",
      theoryScore: backend.theoryInterviewScore,
      technicalScore: backend.technicalInterviewScore,
      recordingUrl: backend.interviewRecording?.videoUrl || null,
      recordedAt: null,
    },
    report: {
      available: backend.executiveReport?.available === true,
      reportUrl: null,
      summary: backend.executiveReport?.summary || null,
      recommendation: backend.executiveReport?.recommendation || null,
      strengths: backend.executiveReport?.strengths || null,
      areasOfOpportunity: backend.executiveReport?.areasOfOpportunity || null,
      generatedAt: null,
    },
    stages: backend.stages.map((s) => s.label),
    currentStageIndex: currentStageIndex >= 0 ? currentStageIndex : 0,
  };
}

export const candidateDrawerApi = {
  /**
   * GET /jobs/{jobId}/applicants/{applicationId}/detail
   * Endpoint agregador que devuelve el detalle completo del candidato
   * para el drawer lateral.
   */
  getDetail: async (
    jobId: string,
    applicationId: string
  ): Promise<CandidateDrawerDetail> => {
    const response = await api.get<ApiResponse<BackendCandidateDrawerDetail>>(
      `/jobs/${jobId}/applicants/${applicationId}/detail`
    );
    const backendData = parseResponse(response);
    return mapBackendToFrontend(backendData);
  },

  /**
   * POST /jobs/{jobId}/applicants/{applicationId}/advance
   * Avanzar o descartar un candidato en el pipeline
   */
  advanceCandidate: async (
    jobId: string,
    applicationId: string,
    payload: AdvanceCandidatePayload
  ): Promise<CandidateDrawerDetail> => {
    const response = await api.post<ApiResponse<BackendCandidateDrawerDetail>>(
      `/jobs/${jobId}/applicants/${applicationId}/advance`,
      { action: payload.action === "DISCARD" ? "REJECT" : payload.action, reason: payload.reason }
    );
    const backendData = parseResponse(response);
    return mapBackendToFrontend(backendData);
  },
};
