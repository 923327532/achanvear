// features/jobs/components/HiringStatsCards.tsx
"use client";

import { Briefcase, Users, FileText, Building2 } from "lucide-react";

interface StatsData {
  activeJobs: number;
  totalApplications: number;
  interviewsInProgress: number;
  finalists: number;
}

const STATS = [
  {
    label: "Empleos activos",
    key: "activeJobs" as const,
    icon: Briefcase,
  },
  {
    label: "Postulaciones recibidas",
    key: "totalApplications" as const,
    icon: Users,
  },
  {
    label: "Entrevistas en proceso",
    key: "interviewsInProgress" as const,
    icon: FileText,
  },
  {
    label: "Candidatos finalistas",
    key: "finalists" as const,
    icon: Building2,
  },
];

export function HiringStatsCards({ data }: { data: StatsData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {STATS.map((stat) => {
        const Icon = stat.icon;
        const value = data[stat.key];
        return (
          <div
            key={stat.key}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-100">
                <Icon className="w-6 h-6 text-slate-500" strokeWidth={1.5} />
              </div>
              <span className="text-2xl font-bold text-[#1e3a8a]">{value}</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}