import { API_BASE_URL } from "@/lib/constants";

export type WorkspaceType = "coding" | "case_study" | "document_review" | "simulation";

export interface PracticalChallenge {
  title: string;
  prompt: string;
  language?: string;
  starter_code?: string;
  expected_output?: string[];
  document?: string;
}

export interface StartPracticalRequest {
  session_id: string;
  career: string;
  job_title: string;
  workspace_type?: WorkspaceType;
  country?: string;
}

export interface StartPracticalResponse {
  session_id: string;
  workspace_type: WorkspaceType;
  challenge: PracticalChallenge;
  websocket_url: string;
  time_limit_minutes: number;
}

export interface FinishPracticalResponse {
  session_id: string;
  score: number;
  theory_score: number;
  final_score: number;
  communication_score: number;
  passed: boolean;
  summary: string;
  communication_summary: string;
  strengths: string[];
  risks: string[];
  recommendation: string;
  next_action: "reject" | "schedule_human_meeting" | "manual_review";
}

const AGENT_BASE_URL = process.env.NEXT_PUBLIC_AGENT_API_URL ?? "http://localhost:8001";

export function practicalWsUrl(path: string) {
  const base = AGENT_BASE_URL.replace(/^http/, "ws").replace(/\/$/, "");
  return `${base}${path}`;
}

export async function startPracticalInterview(
  request: StartPracticalRequest
): Promise<StartPracticalResponse> {
  const response = await fetch(`${AGENT_BASE_URL}/practical-interview/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error("No se pudo iniciar la entrevista practica");
  return response.json();
}

export async function reportPracticalViolation(data: {
  session_id: string;
  type: string;
  detail?: string;
  severity?: string;
}) {
  await fetch(`${AGENT_BASE_URL}/practical-interview/violation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function finishPracticalInterview(data: {
  session_id: string;
  workspace_type: WorkspaceType;
  transcript: Array<{ role: string; content: string }>;
  workspace_state: Record<string, unknown>;
  violations: number;
}): Promise<FinishPracticalResponse> {
  const response = await fetch(`${AGENT_BASE_URL}/practical-interview/finish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("No se pudo finalizar la entrevista practica");
  return response.json();
}

export { AGENT_BASE_URL, API_BASE_URL };
