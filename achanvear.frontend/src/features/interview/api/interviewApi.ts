// features/interview/api/interviewApi.ts
// Endpoints reales del backend: InterviewController.java
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type {
  InterviewSessionResponse,
  QuestionResponse,
  SubmitAnswerResponse,
  InterviewReportResponse,
  InterviewSummaryResponse,
  ScheduleInterviewPayload,
  SubmitAnswerPayload,
  ReportViolationPayload,
  SaveRecordingPayload,
  RecordInterviewConsentPayload,
  InterviewConsentResponse,
} from "../types/interview.types";

export const interviewApi = {
  // POST /interviews/schedule — agendar una entrevista
  schedule: async (payload: ScheduleInterviewPayload): Promise<InterviewSessionResponse> => {
    const response = await api.post<ApiResponse<InterviewSessionResponse>>("/interviews/schedule", payload);
    return parseResponse(response);
  },

  // POST /interviews/{interviewId}/consent — registrar consentimiento previo
  recordConsent: async (interviewId: string, payload: RecordInterviewConsentPayload): Promise<InterviewConsentResponse> => {
    const response = await api.post<ApiResponse<InterviewConsentResponse>>(
      `/interviews/${interviewId}/consent`,
      payload
    );
    return parseResponse(response);
  },

  // POST /interviews/{interviewId}/start — iniciar sesion de entrevista
  start: async (interviewId: string): Promise<InterviewSessionResponse> => {
    const response = await api.post<ApiResponse<InterviewSessionResponse>>(`/interviews/${interviewId}/start`);
    return parseResponse(response);
  },

  // POST /interviews/{interviewId}/answers — enviar respuesta
  // El controller extrae .nextQuestion() del SubmitAnswerResponse y lo devuelve como QuestionResponse
  submitAnswer: async (interviewId: string, payload: SubmitAnswerPayload): Promise<QuestionResponse> => {
    const response = await api.post<ApiResponse<QuestionResponse>>(
      `/interviews/${interviewId}/answers`,
      payload
    );
    return parseResponse(response);
  },

  // POST /interviews/{interviewId}/complete — completar entrevista
  complete: async (interviewId: string): Promise<InterviewReportResponse> => {
    const response = await api.post<ApiResponse<InterviewReportResponse>>(`/interviews/${interviewId}/complete`);
    return parseResponse(response);
  },

  // POST /interviews/{interviewId}/violations — reportar violacion anti-cheat
  reportViolation: async (interviewId: string, payload: ReportViolationPayload): Promise<void> => {
    await api.post(`/interviews/${interviewId}/violations`, payload);
  },

  // POST /interviews/{interviewId}/abort — abortar entrevista
  abort: async (interviewId: string, reason: string): Promise<void> => {
    await api.post(`/interviews/${interviewId}/abort`, { reason });
  },

  // POST /interviews/{interviewId}/recording — guardar key de grabacion
  saveRecording: async (interviewId: string, payload: SaveRecordingPayload): Promise<void> => {
    await api.post(`/interviews/${interviewId}/recording`, payload);
  },

  // GET /interviews/{interviewId}/report — obtener reporte de entrevista
  getReport: async (interviewId: string): Promise<InterviewReportResponse> => {
    const response = await api.get<ApiResponse<InterviewReportResponse>>(`/interviews/${interviewId}/report`);
    return parseResponse(response);
  },

  // GET /interviews/my?candidateId= — obtener todas las entrevistas de un candidato
  getMyInterviews: async (candidateId: string): Promise<InterviewSummaryResponse[]> => {
    const response = await api.get<ApiResponse<InterviewSummaryResponse[]>>(`/interviews/my?candidateId=${encodeURIComponent(candidateId)}`);
    return parseResponse(response);
  },
};
