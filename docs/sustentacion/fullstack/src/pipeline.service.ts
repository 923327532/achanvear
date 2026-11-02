import { Application, PipelineSummary } from "./models";

export function buildPipelineSummary(applications: Application[]): PipelineSummary[] {
  if (!Array.isArray(applications)) throw new Error("Se esperaba una lista");
  const groups = new Map<string, { count: number; total: number }>();
  const ids = new Set<string>();

  for (const item of applications) {
    if (!item || typeof item.id !== "string" || !item.id.trim()) {
      throw new Error("Identificador invalido");
    }
    if (ids.has(item.id.trim())) throw new Error("Identificador duplicado");
    if (typeof item.status !== "string" || !item.status.trim()) {
      throw new Error("Estado vacio");
    }
    if (!Number.isFinite(item.score) || item.score < 0 || item.score > 100) {
      throw new Error("Puntaje fuera del rango 0 a 100");
    }
    ids.add(item.id.trim());
    const status = item.status.trim().toLowerCase();
    const group = groups.get(status) ?? { count: 0, total: 0 };
    group.count++;
    group.total += item.score;
    groups.set(status, group);
  }

  return Array.from(groups, ([status, group]) => ({
    status,
    count: group.count,
    averageScore: Number((group.total / group.count).toFixed(2)),
    nextAction: status === "new" ? "Revisar perfil"
      : status === "interview" ? "Realizar entrevista" : "Revisar etapa"
  }));
}
