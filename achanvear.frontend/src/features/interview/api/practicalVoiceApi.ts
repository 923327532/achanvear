import { API_BASE_URL } from "@/lib/constants";

export type WorkspaceType = "coding" | "case_study" | "document_review" | "simulation";

export interface PracticalCodeFile {
  path: string;
  content: string;
  language?: string;
}

export interface PracticalInterviewerProfile {
  id: string;
  name: string;
  role: string;
  voice: string;
  gender: "male" | "female";
  style: string;
}

export interface PracticalChallenge {
  title: string;
  prompt: string;
  language?: string;
  entry_file?: string;
  files?: PracticalCodeFile[];
  workspace_tool?: "code_project" | "document" | "case_notes" | "spreadsheet_notes" | "test_plan" | "runbook" | "notes";
  interviewer_profile?: PracticalInterviewerProfile;
  function_name?: string;
  test_cases?: unknown[];
  preview?: "html" | "json";
  starter_code?: string;
  expected_output?: string[];
  document?: string;
}

export interface StartPracticalRequest {
  session_id: string;
  career: string;
  job_title: string;
  candidate_name?: string;
  job_description?: string;
  job_requirements?: string;
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

function validateAgentConnection() {
  if (typeof window === "undefined") return;
  const agent = new URL(AGENT_BASE_URL);
  const localPage = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
  if (!localPage && ["localhost", "127.0.0.1", "[::1]"].includes(agent.hostname)) {
    throw new Error("La entrevista no puede conectarse: falta configurar la direccion publica del agente de IA en el despliegue.");
  }
  if (window.location.protocol === "https:" && agent.protocol !== "https:") {
    throw new Error("La entrevista necesita una conexion segura al agente de IA. Configura su direccion HTTPS en el despliegue.");
  }
}

export function practicalWsUrl(path: string) {
  validateAgentConnection();
  const base = AGENT_BASE_URL.replace(/^http/, "ws").replace(/\/$/, "");
  return `${base}${path}`;
}

export async function startPracticalInterview(
  request: StartPracticalRequest
): Promise<StartPracticalResponse> {
  validateAgentConnection();
  let response: Response;
  try {
    response = await fetch(`${AGENT_BASE_URL}/practical-interview/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error("No se pudo conectar con el agente de IA en 15 segundos. Revisa tu conexion o vuelve a intentar.");
  }
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

export async function runPracticalCode(data: {
  language: string;
  code: string;
  files?: PracticalCodeFile[];
  entry_file?: string;
  function_name?: string;
  test_cases?: unknown[];
}) {
  const response = await fetch(`${AGENT_BASE_URL}/code-runner/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("No se pudo ejecutar el codigo");
  return response.json() as Promise<{
    success: boolean;
    language?: string;
    stdout: string;
    stderr: string;
    exit_code: number;
    runtime_available: boolean;
  }>;
}

export { AGENT_BASE_URL, API_BASE_URL };
