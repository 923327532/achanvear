import { buildPipelineSummary } from "./src/pipeline.service";
import { runTests } from "./tests/pipeline.test";

runTests();

const result = buildPipelineSummary([
  { id: "a1", status: "new", score: 72 },
  { id: "a2", status: "interview", score: 88 },
  { id: "a3", status: "interview", score: 91 }
]);

console.log("Resumen del panel CRM:");
console.log(JSON.stringify(result, null, 2));
