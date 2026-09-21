// features/jobs/components/HiringPipeline.tsx
"use client";

import { FileSearch, BookOpen, Code2, Award } from "lucide-react";

interface PipelineData {
  screening: number;
  theory: number;
  technical: number;
  finalists: number;
}

const PIPELINE_STEPS = [
  { label: "Screening", key: "screening" as const, icon: FileSearch },
  { label: "Teórica", key: "theory" as const, icon: BookOpen },
  { label: "Técnica", key: "technical" as const, icon: Code2 },
  { label: "Finales", key: "finalists" as const, icon: Award },
];

export function HiringPipeline({ data }: { data: PipelineData }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {PIPELINE_STEPS.map((step) => {
        const Icon = step.icon;
        const value = data[step.key];
        return (
          <div
            key={step.key}
            className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 mx-auto mb-3">
              <Icon className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
            </div>
            <p className="text-2xl font-bold text-[#1e3a8a]">{value}</p>
            <p className="text-sm text-slate-600 mt-1">{step.label}</p>
          </div>
        );
      })}
    </div>
  );
}