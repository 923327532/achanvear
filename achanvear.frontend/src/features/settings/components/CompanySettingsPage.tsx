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
  const [activeSection, setActiveSection] = useState<CompanySettingsSection>("billing");

  return (
    <div className="min-h-full bg-[#f5f7fb]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Centro de control</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Configuracion de empresa</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Administra equipo, agente IA, facturacion, privacidad y seguridad desde una vista ordenada.
          </p>
        </div>

        <div className="mb-6">
          <CompanySettingsSidebar active={activeSection} onChange={setActiveSection} />
        </div>

        <div className="min-w-0">
          {activeSection === "team" && <CompanyTeamSection />}
          {activeSection === "agent" && <CompanyAgentSection />}
          {activeSection === "billing" && <CompanyBillingSection />}
          {activeSection === "privacy" && <CompanyPrivacySection />}
          {activeSection === "security" && <SecuritySection />}
          {activeSection === "general" && <CompanyGeneralSection />}
        </div>
      </div>
    </div>
  );
}
