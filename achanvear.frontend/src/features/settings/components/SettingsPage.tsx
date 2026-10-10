// features/settings/components/SettingsPage.tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useSettingsProfile } from "../hooks/useSettings";
import { SettingsSidebar } from "./SettingsSidebar";
import { WorkPreferencesSection } from "./WorkPreferencesSection";
import { FinancesSection } from "./FinancesSection";
import { SecuritySection } from "./SecuritySection";
import { NotificationsSection } from "./NotificationsSection";
import { GeneralSection } from "./GeneralSection";
import type { SettingsSection } from "../types/settings.types";

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");
  const { profile, isLoading } = useSettingsProfile();

  return (
    <div className="min-h-full bg-gray-50/50">
      {/* RESPONSIVE: px-4 / py-6 en celular */}
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1B3A6B]">Configuración</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus preferencias y ajustes de cuenta</p>
        </div>

        {/* Diseño de tu compañero: el menú va arriba y el contenido debajo en todos los tamaños.
            RESPONSIVE: el envoltorio con min-w-0 y max-w-full evita que el menú se pase del ancho disponible. */}
        <div className="space-y-6">
          <div className="w-full min-w-0 [&>*]:max-w-full">
            <SettingsSidebar active={activeSection} onChange={setActiveSection} />
          </div>
          <div className="w-full flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                {activeSection === "work"          && <WorkPreferencesSection profile={profile} />}
                {activeSection === "finances"      && <FinancesSection profile={profile} />}
                {activeSection === "security"      && <SecuritySection />}
                {activeSection === "notifications" && <NotificationsSection />}
                {activeSection === "general"       && <GeneralSection profile={profile} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}