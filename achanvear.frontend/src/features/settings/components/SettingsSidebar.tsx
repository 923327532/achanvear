// features/settings/components/SettingsSidebar.tsx
"use client";

import { Bell, Briefcase, DollarSign, Settings, Shield } from "lucide-react";
import type { SettingsSection } from "../types/settings.types";

interface Props {
  active: SettingsSection;
  onChange: (section: SettingsSection) => void;
}

const ITEMS: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "Configuracion General", icon: Settings },
  { id: "work", label: "Preferencias de Trabajo", icon: Briefcase },
  { id: "finances", label: "Finanzas y Pagos", icon: DollarSign },
  { id: "security", label: "Seguridad y Proctoring", icon: Shield },
  { id: "notifications", label: "Notificaciones", icon: Bell },
];

export function SettingsSidebar({ active, onChange }: Props) {
  return (
    <div className="flex w-full gap-2 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
      {ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
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
