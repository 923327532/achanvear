// app/(dashboard)/company/layout.tsx  
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home, Briefcase, GitBranch, FolderOpen, Globe,
  MessageSquare, Building2, Bell, Settings, LogOut, Search,
  DollarSign, Menu, X, ChevronRight, Clock, Loader2,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProtectedRoute } from "@/shared/hooks/useProtectedRoute";
import { useCompanyDashboard } from "@/features/jobs/hooks/useCompanyDashboard";
import { ConfirmModal } from "@/shared/components/ui/ConfirmModal";
import { homeRouteForRole } from "@/lib/constants";

const NAV_ITEMS = [
  { icon: Home,          label: "Inicio",             href: "/company" },
  { icon: Briefcase,     label: "Mis Publicaciones",  href: "/company/jobs" },
  { icon: GitBranch,     label: "Pipeline SelecciÃ³n",  href: "/company/pipeline" },
  { icon: FolderOpen,    label: "Mis Proyectos",       href: "/company/projects" },
  { icon: Globe,         label: "Servicios",           href: "/company/services" },
  { icon: MessageSquare, label: "Mensajes",            href: "/company/chat" },
  { icon: Clock,         label: "Historial",           href: "/company/history" },
  { icon: Building2,     label: "Perfil Empresa",      href: "/company/profile" },
  { icon: DollarSign,    label: "Pagos",               href: "/company/payments" },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const { user, status, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  useProtectedRoute();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Guarda por rol: si un usuario que no es COMPANY entra aquÃ­, lo llevamos
  // a la secciÃ³n que le corresponde (admin, freelancer, etc.).
  const role = user?.role?.toUpperCase();
  const isCompanySection = role === "COMPANY" || role === "COMPANY_COLLABORATOR";
  useEffect(() => {
    if (status === "AUTHENTICATED" && user && !isCompanySection) {
      router.replace(homeRouteForRole(user.role));
    }
  }, [status, user, isCompanySection, router]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const { hasCompany, isLoading, data: dashboard } = useCompanyDashboard();

  const companyName = dashboard?.companyName ?? "Mi Empresa";
  const companyTradeName = dashboard?.companyTradeName ?? "";
  const initials = companyName.charAt(0).toUpperCase();

  const sidebarWidth = isCollapsed ? "w-[72px]" : "w-[260px]";

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
  };

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f7fb]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a8a]" />
      </div>
    );
  }

  if (!hasCompany) {
    return <div className="min-h-screen bg-[#f5f7fb]">{children}</div>;
  }

  const NavLink = ({ item }: { item: typeof NAV_ITEMS[0] }) => {
    const isActive =
      item.href === "/company"
        ? pathname === "/company"
        : pathname.startsWith(item.href);

    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap relative ${
          isActive
            ? "bg-blue-50 text-[#1B3A6B] border-l-[3px] border-[#1B3A6B]"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        } ${isCollapsed ? "justify-center pl-3 border-l-[3px] border-transparent" : ""}`}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon
          className={`w-5 h-5 shrink-0 ${isActive ? "text-[#1B3A6B]" : "text-slate-400"}`}
          strokeWidth={1.5}
        />
        {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 overflow-x-hidden">

      {showLogoutModal && (
        <ConfirmModal
          title="Â¿Cerrar sesiÃ³n?"
          description="TendrÃ¡s que volver a iniciar sesiÃ³n para acceder a tu cuenta."
          confirmLabel="Cerrar sesiÃ³n"
          cancelLabel="Cancelar"
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-[#1B3A6B]"
        aria-label={isMobileOpen ? "Cerrar menÃº" : "Abrir menÃº"}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen ${sidebarWidth} bg-white border-r border-slate-200 flex flex-col z-30 transition-all duration-300 hidden lg:flex`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-[#1B3A6B] transition-colors"
          aria-label={isCollapsed ? "Expandir menÃº" : "Colapsar menÃº"}
        >
          <ChevronRight
            className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
          />
        </button>

        <div className={`px-4 pt-6 pb-4 border-b border-slate-100 ${isCollapsed ? "flex justify-center" : ""}`}>
          <div className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}>
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#1B3A6B] text-white font-bold text-lg shrink-0">
              {initials}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-base font-bold text-[#1B3A6B] truncate">Achanvear</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-sm text-slate-600 truncate">{companyTradeName || companyName}</p>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-medium rounded-full shrink-0">
                    Empresa
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="border-t border-slate-100 p-2 space-y-0.5">
          <Link
            href="/company/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              pathname.startsWith("/company/settings")
                ? "bg-blue-50 text-[#1B3A6B] border-l-[3px] border-[#1B3A6B]"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            } ${isCollapsed ? "justify-center pl-3 border-l-[3px] border-transparent" : ""}`}
            title={isCollapsed ? "ConfiguraciÃ³n" : undefined}
          >
            <Settings
              className={`w-5 h-5 shrink-0 ${pathname.startsWith("/company/settings") ? "text-[#1B3A6B]" : "text-slate-400"}`}
              strokeWidth={1.5}
            />
            {!isCollapsed && "ConfiguraciÃ³n"}
          </Link>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Cerrar sesiÃ³n" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            {!isCollapsed && "Cerrar sesiÃ³n"}
          </button>
        </div>
      </aside>

      <aside
        className={`fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-300 lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#1B3A6B] text-white font-bold text-lg shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-[#1B3A6B] truncate">Achanvear</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-sm text-slate-600 truncate">{companyTradeName || companyName}</p>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-medium rounded-full shrink-0">
                  Empresa
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/company"
                ? pathname === "/company"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-100 text-[#1e3a8a] border-l-[3px] border-[#1e3a8a] pl-[9px]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-[#1e3a8a]" : "text-slate-400"}`}
                  strokeWidth={1.5}
                />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-100 space-y-1">
          <Link
            href="/company/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              pathname.startsWith("/company/settings")
                ? "bg-slate-100 text-[#1e3a8a] border-l-[3px] border-[#1e3a8a] pl-[9px]"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Settings
              className={`w-5 h-5 ${pathname.startsWith("/company/settings") ? "text-[#1e3a8a]" : "text-slate-400"}`}
              strokeWidth={1.5}
            />
            ConfiguraciÃ³n
          </Link>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            Cerrar sesiÃ³n
          </button>
        </div>
      </aside>

      <div
        className={`flex min-h-screen min-w-0 flex-1 flex-col transition-all duration-300 ${
          isCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
        }`}
      >
        <header className="sticky top-0 z-20 flex flex-shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5 pl-16 sm:px-6 lg:pl-6">
          <div className="hidden flex-1 max-w-lg items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
            <Search className="h-4 w-4 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar candidatos, servicios..."
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <button
              onClick={() => router.push("/company/notifications")}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Bell className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
            </button>
            <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#1B3A6B] text-xs font-bold text-white">
              {initials}
            </div>
          </div>
        </header>

        <main className="relative flex min-w-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
