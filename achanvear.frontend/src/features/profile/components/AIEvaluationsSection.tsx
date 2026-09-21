// features/profile/components/AIEvaluationsSection.tsx
// Readonly — los datos vendrán del interview-controller cuando esté conectado

import type { AIEvaluation } from "../types/profile.types";

// Mock hasta que interview-controller exponga los scores por perfil
const MOCK_EVALUATIONS: AIEvaluation[] = [
  { agentName: "Carlos", evaluationType: "Screening", score: 92, maxScore: 100 },
  { agentName: "Ana", evaluationType: "Teórica", score: 88, maxScore: 100 },
  { agentName: "Diego", evaluationType: "Técnica", score: 95, maxScore: 100 },
  { agentName: "Sofía", evaluationType: "Soft Skills", score: 90, maxScore: 100 },
];

function ScoreBar({ score, maxScore }: { score: number; maxScore: number }) {
  const pct = Math.round((score / maxScore) * 100);
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
      <div
        className="h-full bg-[#1B3A6B] rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function AIEvaluationsSection() {
  const avgScore = Math.round(
    MOCK_EVALUATIONS.reduce((acc, e) => acc + e.score, 0) / MOCK_EVALUATIONS.length
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-[#1B3A6B]">Evaluaciones de Agentes IA</h2>
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#1B3A6B] bg-blue-50 px-3 py-1.5 rounded-full">
          🤖 Score promedio: {avgScore}/100
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MOCK_EVALUATIONS.map((ev) => (
          <div key={ev.agentName} className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {ev.agentName} ({ev.evaluationType})
              </span>
              <span className="text-sm font-bold text-[#1B3A6B]">
                {ev.score}/{ev.maxScore}
              </span>
            </div>
            <ScoreBar score={ev.score} maxScore={ev.maxScore} />
          </div>
        ))}
      </div>
    </div>
  );
}