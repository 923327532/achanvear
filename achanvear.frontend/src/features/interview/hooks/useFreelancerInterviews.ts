// features/interview/hooks/useFreelancerInterviews.ts
// Hooks que usan los endpoints reales del backend
import { useMutation, useQuery } from "@tanstack/react-query";
import { interviewApi } from "../api/interviewApi";
import type {
  InterviewSessionResponse,
  InterviewReportResponse,
  ScheduleInterviewPayload,
  SubmitAnswerPayload,
  ReportViolationPayload,
} from "../types/interview.types";

// ── Agendar entrevista ──
export function useScheduleInterview() {
  return useMutation({
    mutationFn: (payload: ScheduleInterviewPayload) =>
      interviewApi.schedule(payload),
  });
}

// ── Iniciar sesión de entrevista ──
export function useStartInterview() {
  return useMutation({
    mutationFn: (interviewId: string) =>
      interviewApi.start(interviewId),
  });
}

// ── Enviar respuesta ──
export function useSubmitAnswer() {
  return useMutation({
    mutationFn: ({
      interviewId,
      payload,
    }: {
      interviewId: string;
      payload: SubmitAnswerPayload;
    }) => interviewApi.submitAnswer(interviewId, payload),
  });
}

// ── Completar entrevista ──
export function useCompleteInterview() {
  return useMutation({
    mutationFn: (interviewId: string) =>
      interviewApi.complete(interviewId),
  });
}

// ── Reportar violación anti-cheat ──
export function useReportViolation() {
  return useMutation({
    mutationFn: ({
      interviewId,
      payload,
    }: {
      interviewId: string;
      payload: ReportViolationPayload;
    }) => interviewApi.reportViolation(interviewId, payload),
  });
}

// ── Abortar entrevista ──
export function useAbortInterview() {
  return useMutation({
    mutationFn: ({
      interviewId,
      reason,
    }: {
      interviewId: string;
      reason: string;
    }) => interviewApi.abort(interviewId, reason),
  });
}

// ── Obtener reporte de entrevista ──
export function useInterviewReport(interviewId: string | null) {
  return useQuery({
    queryKey: ["interview-report", interviewId],
    queryFn: () => interviewApi.getReport(interviewId!),
    enabled: !!interviewId,
  });
}

// ── Obtener todas las entrevistas de un candidato ──
export function useMyInterviews(candidateId: string | null) {
  return useQuery({
    queryKey: ["my-interviews", candidateId],
    queryFn: () => interviewApi.getMyInterviews(candidateId!),
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}
