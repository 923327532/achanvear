// app/(dashboard)/admin/users/page.tsx
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminUsersPage } from "@/features/admin/components/AdminUsersPage";

export default function AdminUsersRoute() {
  return (
    <AdminShell>
      <AdminUsersPage />
    </AdminShell>
  );
}
