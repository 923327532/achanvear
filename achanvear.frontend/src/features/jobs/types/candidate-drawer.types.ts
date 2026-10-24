// features/jobs/types/candidate-drawer.types.ts

export type ProcessContextType = "JOB" | "PROJECT";

export type JobStage =
  | "SUBMITTED"
  | "SCREENING"
  | "SCREENING_REVIEW"
  | "THEORY_INTERVIEW"
  | "TECHNICAL_INTERVIEW"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "HIRED"
  | "REJECTED";

export type ProjectStage =
  | "APPLIED"
  | "IN_EVALUATION"
  | "IN_INTERVIEW"
  | "EVALUATION_COMPLETED"
  | "SELECTED"
  | "DISCARDED";

export interface CandidateScores {
  screening: number | null;
  theory: number | null;
  technical: number | null;
  softSkills: number | null;
  overall: number | null;
}

export interface InterviewInfo {
  exists: boolean;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | null;
  theoryScore: number | null;
  technicalScore: number | null;
  recordingUrl: string | null;
  recordedAt: string | null;
}

export interface ExecutiveReport {
  available: boolean;
  reportUrl: string | null;
  summary: string | null;
  recommendation: string | null;
  strengths: string | null;
  areasOfOpportunity: string | null;
  generatedAt: string | null;
}

export interface CandidateGeneralInfo {
  location: string;
  experience: string;
  education: string;
  appliedAt: string;
  currentStage: string;
  stageLabel: string;
}

export interface CandidateDrawerDetail {
  id: string;
  processId: string;
  candidateUserId: string;
  name: string;
  email: string;
  title: string;
  avatar: string;

  contextType: ProcessContextType;
  jobTitle?: string;
  projectTitle?: string;

  cvUrl: string | null;
  coverLetter: string | null;

  scores: CandidateScores;

  generalInfo: CandidateGeneralInfo;

  interview: InterviewInfo;

  report: ExecutiveReport;

  stages: string[];
  stageStatuses?: string[];
  currentStageIndex: number;
}

export interface AdvanceCandidatePayload {
  processId: string;
  action: "ADVANCE" | "DISCARD";
  reason?: string;
}