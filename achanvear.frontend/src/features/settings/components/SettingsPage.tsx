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
  const [activeSection, setActiveSection] = useState<SettingsSection>("work");
  const { profile, isLoading } = useSettingsProfile();

  return (
    <div className="min-h-full bg-gray-50/50">
      <div className="px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Configuración</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus preferencias y ajustes de cuenta</p>
        </div>

        <div className="flex gap-6 items-start">
          <SettingsSidebar active={activeSection} onChange={setActiveSection} />
          <div className="flex-1 min-w-0">
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