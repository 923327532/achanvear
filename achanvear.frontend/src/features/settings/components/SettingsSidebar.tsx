// features/settings/components/SettingsSidebar.tsx
"use client";

import { Briefcase, DollarSign, Shield, Bell, Settings } from "lucide-react";
import type { SettingsSection } from "../types/settings.types";

interface Props {
  active: SettingsSection;
  onChange: (section: SettingsSection) => void;
}

const ITEMS: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
  { id: "work",          label: "Preferencias de Trabajo", icon: Briefcase },
  { id: "finances",      label: "Finanzas y Pagos",         icon: DollarSign },
  { id: "security",      label: "Seguridad y Proctoring",   icon: Shield },
  { id: "notifications", label: "Notificaciones",           icon: Bell },
  { id: "general",       label: "Configuración General",    icon: Settings },
];

export function SettingsSidebar({ active, onChange }: Props) {
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