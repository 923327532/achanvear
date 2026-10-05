// app/(dashboard)/company/settings/page.tsx
"use client";

import { CompanySettingsPage } from "@/features/settings/components/CompanySettingsPage";

export default function Page() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <CompanySettingsPage />
    </div>
  );
}
