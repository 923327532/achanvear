// app/(dashboard)/company/settings/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { CompanySettingsPage } from "@/features/settings/components/CompanySettingsPage";

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "COMPANY_COLLABORATOR") {
      router.replace("/company");
    }
  }, [user, router]);

  return (
    <div className="p-8">
      <CompanySettingsPage />
    </div>
  );
}