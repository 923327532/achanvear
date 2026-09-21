// app/(dashboard)/admin/audit/page.tsx
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminAuditPage } from "@/features/admin/components/AdminAuditPage";

export default function AdminAuditRoute() {
  return (
    <AdminShell>
      <AdminAuditPage />
    </AdminShell>
  );
}
