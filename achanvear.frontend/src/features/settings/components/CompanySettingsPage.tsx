// features/settings/components/CompanySettingsPage.tsx
"use client";

import { useState } from "react";
import { CompanySettingsSidebar } from "./CompanySettingsSidebar";
import { CompanyTeamSection } from "./CompanyTeamSection";
import { CompanyAgentSection } from "./CompanyAgentSection";
import { CompanyBillingSection } from "./CompanyBillingSection";
import { CompanyPrivacySection } from "./CompanyPrivacySection";
import { SecuritySection } from "./SecuritySection";
import { CompanyGeneralSection } from "./CompanyGeneralSection";
import type { CompanySettingsSection } from "../types/company-settings.types";

export function CompanySettingsPage() {
  const [activeSection, setActiveSection] = useState<CompanySettingsSection>("team");

  return (
    <div className="min-h-full bg-gray-50/50">
      <div className="px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Configuración</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona las preferencias y ajustes de tu empresa
          </p>
        </div>

        {/* Layout: sidebar interno + contenido */}
        <div className="flex gap-6 items-start">
          <CompanySettingsSidebar active={activeSection} onChange={setActiveSection} />

          <div className="flex-1 min-w-0">
            {activeSection === "team"    && <CompanyTeamSection />}
            {activeSection === "agent"   && <CompanyAgentSection />}
            {activeSection === "billing" && <CompanyBillingSection />}
            {activeSection === "privacy" && <CompanyPrivacySection />}
            {activeSection === "security" && <SecuritySection />}
            {activeSection === "general" && <CompanyGeneralSection />}
          </div>
        </div>

      </div>
    </div>
  );
}
