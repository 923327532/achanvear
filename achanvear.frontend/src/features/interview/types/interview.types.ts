 // features/interview/types/interview.types.ts
// DTOs que coinciden EXACTAMENTE con los records del backend Java

export interface InterviewSessionResponse {
  interviewId: string;
  hiringProcessId: string;
  candidateId: string;
  interviewType: string;   // "THEORY" | "TECHNICAL"
  status: string;           // "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "ABORTED"
  interviewerName: string;
  interviewerStyle: string;
  interviewerVoice: string;
  availableSlots: number | null;
  firstQuestionContent: string | null;
  challengeJson: string | null;
}

export interface QuestionResponse {
  id: string;
  content: string;
  audioUrl: string | null;
}

export interface SubmitAnswerResponse {
  interviewId: string;
  questionId: string;
  answerId: string;
  score: number;
  feedback: string;
  nextQuestion: QuestionResponse | null;
  interviewCompleted: boolean;
}

export interface InterviewReportResponse {
  interviewId: string;
  status: string;
  interviewType: string;
  finalScore: number | null;
  passed: boolean | null;
  interviewerProfile: {
    name: string;
    voice: string;
  } | null;
  assignedSlot: {
    slotNumber: number;
    startTime: string;
    endTime: string;
  } | null;
  recording: {
    fileKey: string;
  } | null;
  abortReason: {
    reason: string;
  } | null;
  totals: {
    totalQuestions: number;
    totalAnswers: number;
    totalViolations: number;
  } | null;
  questions: Array<{
    id: string;
    content: string;
    audioUrl: string | null;
  }>;
  answers: Array<{
    id: string;
    questionId: string;
    content: string;
    score: number | null;
  }>;
  violations: Array<{
    type: string;
    count: number;
    occurredAt: string;
  }>;
}

// Payloads para requests
export interface ScheduleInterviewPayload {
  hiringProcessId: string;
  candidateId: string;
  interviewType: string;
  theoryScore?: number;
  conciseAnswers?: boolean;
  leadershipProfile?: boolean;
  interviewerProfileCode?: string;
}

export interface SubmitAnswerPayload {
  questionId: string;
  answerContent: string;
}

export interface ReportViolationPayload {
  type: string;
  count: number;
  timestamp: string;
}

export interface SaveRecordingPayload {
  fileKey: string;
}

export interface RecordInterviewConsentPayload {
  acceptDataProcessing: boolean;
  acceptAiEvaluation: boolean;
  acceptRecording: boolean;
}

export interface InterviewConsentResponse {
  interviewId: string;
  acceptedTypes: string[];
  readyToStart: boolean;
}

export interface InterviewSummaryResponse {
  interviewId: string;
  position: string;
  company: string;
  date: string;
  time: string;
  agent: string;
  status: string;
  interviewType: string;
  score: number | null;
  maxScore: number;
  passed: boolean;
  abortReason?: string;
}
