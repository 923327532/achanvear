import { buildPipelineSummary } from "../src/pipeline.service";
import { Application } from "../src/models";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error("Fallo: " + message);
}

function rejects(input: Application[], message: string) {
  let rejected = false;
  try { buildPipelineSummary(input); } catch { rejected = true; }
  assert(rejected, message);
}

export function runTests() {
  const result = buildPipelineSummary([
    { id: "a1", status: "new", score: 72 },
    { id: "a2", status: "interview", score: 88 },
    { id: "a3", status: "interview", score: 91 }
  ]);
  assert(result.find(r => r.status === "interview")?.averageScore === 89.5, "promedio");
  assert(result.find(r => r.status === "interview")?.count === 2, "agrupacion");
  assert(result.find(r => r.status === "new")?.nextAction === "Revisar perfil", "accion");
  assert(buildPipelineSummary([]).length === 0, "lista vacia");
  assert(buildPipelineSummary([{ id: "a", status: " NEW ", score: 0 }])[0].averageScore === 0, "cero valido");
  assert(buildPipelineSummary([{ id: "a", status: " NEW ", score: 100 }])[0].status === "new", "normalizacion y limite 100");
  rejects([{ id: "a", status: "new", score: -1 }], "negativo");
  rejects([{ id: "a", status: "new", score: 101 }], "mayor a 100");
  rejects([{ id: "a", status: "new", score: NaN }], "NaN");
  rejects([{ id: "a", status: " ", score: 50 }], "estado vacio");
  rejects([{ id: "", status: "new", score: 50 }], "id vacio");
  rejects([{ id: "a", status: "new", score: 50 }, { id: "a", status: "new", score: 60 }], "id duplicado");
  console.log("12 pruebas TypeScript correctas");
}
