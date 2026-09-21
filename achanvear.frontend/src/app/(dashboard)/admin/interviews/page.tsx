// app/(dashboard)/admin/interviews/page.tsx
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminInterviewsPage } from "@/features/admin/components/AdminInterviewsPage";

export default function AdminInterviewsRoute() {
  return (
    <AdminShell>
      <AdminInterviewsPage />
    </AdminShell>
  );
}
