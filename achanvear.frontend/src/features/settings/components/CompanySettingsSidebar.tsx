// features/settings/components/CompanySettingsSidebar.tsx
"use client";

import { Users, Bot, CreditCard, Eye, Settings, Shield } from "lucide-react";
import type { CompanySettingsSection } from "../types/company-settings.types";

interface Props {
  active: CompanySettingsSection;
  onChange: (section: CompanySettingsSection) => void;
}

const ITEMS: { id: CompanySettingsSection; label: string; description: string; icon: React.ElementType }[] = [
  { id: "billing", label: "Facturacion", description: "Planes, creditos y pagos", icon: CreditCard },
  { id: "team", label: "Equipo", description: "Colaboradores y accesos", icon: Users },
  { id: "agent", label: "Agente IA", description: "Automatizacion y umbrales", icon: Bot },
  { id: "privacy", label: "Privacidad", description: "Visibilidad de empresa", icon: Eye },
  { id: "security", label: "Seguridad", description: "Cuenta y autenticacion", icon: Shield },
  { id: "general", label: "General", description: "Idioma y zona horaria", icon: Settings },
];

export function CompanySettingsSidebar({ active, onChange }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex items-center gap-3 overflow-x-auto">
        {/* RESPONSIVE: la etiqueta "SECCIONES" ocupaba ~100px de los ~220
            disponibles y dejaba a las pestañas un carril de ~110px. En celular
            se oculta; las pestañas usan todo el ancho y se desplazan. */}
        <div className="hidden shrink-0 px-3 py-2 sm:block">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Secciones</p>
        </div>
        <div className="flex min-w-max flex-1 gap-1">
          {ITEMS.map(({ id, label, description, icon: Icon }) => {
            const selected = active === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                aria-current={selected ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-left transition sm:min-w-[190px] sm:gap-3 sm:py-3 ${
                  selected ? "bg-[#1B3A6B] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${
                  selected ? "bg-white/12 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block whitespace-nowrap text-sm font-semibold">{label}</span>
                  {/* La descripción solo desde sm: en celular las pestañas son
                      más angostas y se ven más a la vez. */}
                  <span className={`hidden truncate text-xs sm:block ${selected ? "text-white/60" : "text-slate-400"}`}>{description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}