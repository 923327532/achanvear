// features/admin/components/AdminShell.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { LayoutDashboard, Users, ClipboardList, FileText, ShieldCheck, History, LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { homeRouteForRole } from "@/lib/constants";

const ADMIN_ROLES = ["SUPERADMIN", "SUBADMIN", "ADMIN", "SUPPORT"];

const NAV_ITEMS = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/consents", label: "Consentimientos", icon: ShieldCheck },
  { href: "/admin/interviews", label: "Entrevistas", icon: ClipboardList },
  { href: "/admin/legal-documents", label: "Documentos legales", icon: FileText },
  { href: "/admin/audit", label: "Auditoría", icon: History },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, status, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = !!user && ADMIN_ROLES.includes(user.role?.toUpperCase());

  // Si un usuario autenticado que no es admin entra al panel, lo llevamos a su sección.
  useEffect(() => {
    if (status === "AUTHENTICATED" && user && !isAdmin) {
      router.replace(homeRouteForRole(user.role));
    }
  }, [status, user, isAdmin, router]);

  if (status === "PENDING" || (user && !isAdmin)) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3A6B] border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <ShieldCheck className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="text-lg font-bold text-slate-800">Acceso denegado</h1>
          <p className="mt-2 text-sm text-slate-500">
            Este panel está restringido a administradores. La validación real de rol y permisos
            también se realiza en el backend.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-[#1B3A6B] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0EA5A0] transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B3A6B] text-sm font-bold text-white">
            A
          </div>
          <div>
            <p className="text-sm font-bold text-[#1B3A6B]">Admin</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Achanvear</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-[#1B3A6B] text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <div className="border-b border-slate-200 bg-white px-6 py-4 md:hidden">
          <div className="flex gap-2 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${
                  pathname === item.href ? "bg-[#1B3A6B] text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
