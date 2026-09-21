// features/interview/hooks/useInterviewConsent.ts
import { useMutation } from "@tanstack/react-query";
import { interviewApi } from "../api/interviewApi";
import type { RecordInterviewConsentPayload } from "../types/interview.types";

// ── Registrar el consentimiento específico previo a la entrevista ──
export function useInterviewConsent() {
  return useMutation({
    mutationFn: ({
      interviewId,
      payload,
    }: {
      interviewId: string;
      payload: RecordInterviewConsentPayload;
    }) => interviewApi.recordConsent(interviewId, payload),
  });
}
