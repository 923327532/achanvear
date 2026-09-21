// features/settings/components/CompanySettingsSidebar.tsx
"use client";

import { Users, Bot, CreditCard, Eye, Settings, Shield } from "lucide-react";
import type { CompanySettingsSection } from "../types/company-settings.types";

interface Props {
  active: CompanySettingsSection;
  onChange: (section: CompanySettingsSection) => void;
}

const ITEMS: { id: CompanySettingsSection; label: string; icon: React.ElementType }[] = [
  { id: "team",    label: "Gestión de Equipo",          icon: Users },
  { id: "agent",   label: "Configuración del Agente IA", icon: Bot },
  { id: "billing", label: "Facturación y Créditos",      icon: CreditCard },
  { id: "privacy", label: "Privacidad de la Empresa",    icon: Eye },
  { id: "security", label: "Seguridad de Cuenta",       icon: Shield },
  { id: "general", label: "Configuración General",       icon: Settings },
];

export function CompanySettingsSidebar({ active, onChange }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex flex-col gap-0.5 w-[220px] flex-shrink-0">
      {ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-colors ${
            active === id
              ? "bg-[#1B3A6B] text-white"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
        </button>
      ))}
    </div>
  );
}
