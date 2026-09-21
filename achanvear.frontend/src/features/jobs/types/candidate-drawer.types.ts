// features/jobs/types/candidate-drawer.types.ts
// ─── Tipos para el Drawer de detalle de candidato ──────────────────────────────

export type ProcessContextType = "JOB" | "PROJECT";

export type JobStage =
  | "APPLIED"
  | "SCREENING"
  | "SELECTED_FOR_INTERVIEW"
  | "THEORY_INTERVIEW"
  | "THEORY_PASSED"
  | "TECHNICAL_INTERVIEW"
  | "EVALUATION_COMPLETED"
  | "DISCARDED"
  | "HIRED";

export type ProjectStage =
  | "APPLIED"
  | "IN_EVALUATION"
  | "IN_INTERVIEW"
  | "EVALUATION_COMPLETED"
  | "SELECTED"
  | "DISCARDED";

// ─── Scores ────────────────────────────────────────────────────────────────────

export interface CandidateScores {
  screening: number | null;      // 0-100 o null si no existe
  theory: number | null;         // 0-100 o null si no existe
  technical: number | null;      // 0-100 o null si no existe
  softSkills: number | null;     // 0-100 o null si no existe
  overall: number | null;        // Score general ponderado
}

// ─── Entrevista ────────────────────────────────────────────────────────────────

export interface InterviewInfo {
  exists: boolean;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | null;
  theoryScore: number | null;
  technicalScore: number | null;
  recordingUrl: string | null;   // URL de S3 si existe grabación
  recordedAt: string | null;
}

// ─── Reporte Ejecutivo ─────────────────────────────────────────────────────────

export interface ExecutiveReport {
  available: boolean;
  reportUrl: string | null;
  summary: string | null;
  recommendation: string | null;
  strengths: string | null;
  areasOfOpportunity: string | null;
  generatedAt: string | null;
}

// ─── Información general del candidato ─────────────────────────────────────────

export interface CandidateGeneralInfo {
  location: string;
  experience: string;
  education: string;
  appliedAt: string;
  currentStage: string;
  stageLabel: string;
}

// ─── Respuesta completa del endpoint agregador ─────────────────────────────────

export interface CandidateDrawerDetail {
  // Identidad
  id: string;
  processId: string;
  candidateUserId: string;
  name: string;
  email: string;
  title: string;
  avatar: string;

  // Contexto del proceso
  contextType: ProcessContextType;
  jobTitle?: string;
  projectTitle?: string;

  // CV
  cvUrl: string | null;
  coverLetter: string | null;

  // Scores
  scores: CandidateScores;

  // Información general
  generalInfo: CandidateGeneralInfo;

  // Entrevista
  interview: InterviewInfo;

  // Reporte ejecutivo
  report: ExecutiveReport;

  // Fases del proceso
  stages: string[];
  currentStageIndex: number;
}

// ─── Payload para avanzar/descartar ────────────────────────────────────────────

export interface AdvanceCandidatePayload {
  processId: string;
  action: "ADVANCE" | "DISCARD";
  reason?: string;
}
