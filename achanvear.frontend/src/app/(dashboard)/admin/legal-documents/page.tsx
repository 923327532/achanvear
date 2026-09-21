// app/(dashboard)/admin/legal-documents/page.tsx
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminLegalDocumentsPage } from "@/features/admin/components/AdminLegalDocumentsPage";

export default function AdminLegalDocumentsRoute() {
  return (
    <AdminShell>
      <AdminLegalDocumentsPage />
    </AdminShell>
  );
}
