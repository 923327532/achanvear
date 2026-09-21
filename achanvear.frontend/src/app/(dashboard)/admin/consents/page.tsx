// app/(dashboard)/admin/consents/page.tsx
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminConsentsPage } from "@/features/admin/components/AdminConsentsPage";

export default function AdminConsentsRoute() {
  return (
    <AdminShell>
      <AdminConsentsPage />
    </AdminShell>
  );
}
