// features/jobs/components/QuickActions.tsx
"use client";

import Link from "next/link";
import { PlusCircle, Users2, Bot } from "lucide-react";

const ACTIONS = [
  {
    title: "Publicar empleo",
    description: "Crea una nueva vacante y atrae talento",
    icon: PlusCircle,
    href: "/company/jobs/create",
    color: "text-[#1e3a8a]",
    bgColor: "bg-blue-50",
  },
  {
    title: "Ver candidatos",
    description: "Revisa postulaciones y perfiles",
    icon: Users2,
    href: "/company/pipeline",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Configurar IA",
    description: "Automatiza tu proceso de selección",
    icon: Bot,
    href: "/company/settings",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

export function QuickActions() {
  // RESPONSIVE: antes pasaba a 3 columnas desde sm (640px). A 640px cada
  // tarjeta quedaba con ~80px para el texto. Ahora 1 columna hasta md (768px).
  // También: <a href> interno → <Link> (evita recarga completa y el error de
  // build no-html-link-for-pages).
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.title}
            href={action.href}
            className="group flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${action.bgColor} shrink-0`}>
              <Icon className={`w-6 h-6 ${action.color}`} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 group-hover:text-[#1e3a8a] transition-colors">
                {action.title}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}