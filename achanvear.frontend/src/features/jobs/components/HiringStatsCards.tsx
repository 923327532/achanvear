// features/jobs/components/HiringStatsCards.tsx
"use client";

import { Briefcase, Users, FileText, Building2 } from "lucide-react";

interface StatsData {
  activeJobs: number | null;
  totalApplications: number | null;
  interviewsInProgress: number | null;
  finalists: number | null;
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
  // RESPONSIVE: antes era 1 columna en celular, así que las 4 tarjetas
  // ocupaban 4 filas completas y alargaban mucho la pantalla. Ahora 2x2 desde
  // el ancho más chico, con tarjetas más compactas (padding, ícono y número
  // más chicos) hasta sm; desde ahí vuelven al tamaño original.
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {STATS.map((stat) => {
        const Icon = stat.icon;
        const value = data[stat.key];
        return (
          <div
            key={stat.key}
            className="min-w-0 bg-white rounded-2xl border border-slate-200 p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-xl bg-slate-100 sm:h-12 sm:w-12">
                <Icon className="w-5 h-5 text-slate-500 sm:w-6 sm:h-6" strokeWidth={1.5} />
              </div>
              <span className="text-xl font-bold text-[#1e3a8a] sm:text-2xl">{value ?? "—"}</span>
            </div>
            <p className="mt-3 break-words text-xs text-slate-600 sm:text-sm">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}