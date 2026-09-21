// app/(dashboard)/admin/page.tsx
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminMetricsPage } from "@/features/admin/components/AdminMetricsPage";

export default function AdminHomePage() {
  return (
    <AdminShell>
      <AdminMetricsPage />
    </AdminShell>
  );
}
