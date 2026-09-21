// app/(dashboard)/freelancer/layout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Briefcase, Rocket, Video, Wrench,
  MessageSquare, User, Bell, Settings, LogOut, Search,
  DollarSign, Menu, X, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProtectedRoute } from "@/shared/hooks/useProtectedRoute";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { ConfirmModal } from "@/shared/components/ui/ConfirmModal";
import { homeRouteForRole } from "@/lib/constants";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { icon: Home,          label: "Inicio",        href: "/freelancer" },
  { icon: Briefcase,     label: "Empleos",        href: "/freelancer/jobs" },
  { icon: Rocket,        label: "Freelance",      href: "/freelancer/projects" },
  { icon: Video,         label: "Entrevistas",    href: "/freelancer/interviews" },
  { icon: Wrench,        label: "Mis Servicios",  href: "/freelancer/my-services" },
  { icon: MessageSquare, label: "Mensajes",       href: "/freelancer/chat" },
  { icon: User,          label: "Mi Perfil",      href: "/freelancer/profile" },
  { icon: Bell,          label: "Notificaciones", href: "/freelancer/notifications" },
  { icon: DollarSign,    label: "Pagos",          href: "/freelancer/payments" },
];

export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
  const { user, status, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  useProtectedRoute();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState<string | null>(null);

  // Guarda por rol: si un usuario que no es FREELANCER entra aquí, lo llevamos
  // a la sección que le corresponde (admin, empresa, etc.).
  const role = user?.role?.toUpperCase();
  const isFreelancerSection = role === "FREELANCER" || role === "CANDIDATE";
  useEffect(() => {
    if (status === "AUTHENTICATED" && user && !isFreelancerSection) {
      router.replace(homeRouteForRole(user.role));
    }
  }, [status, user, isFreelancerSection, router]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const { unreadCount } = useNotifications();

  const fullName = user?.fullName ?? "";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const sidebarWidth = isCollapsed ? "w-[72px]" : "w-[260px]";

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
  };

  if (status === "PENDING") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3A6B] border-t-transparent" />
      </div>
    );
  }

  const NavLink = ({ item }: { item: typeof NAV_ITEMS[0] }) => {
    const isActive =
      item.href === "/freelancer"
        ? pathname === "/freelancer"
        : pathname.startsWith(item.href);

    const Icon = item.icon;
    const badgeCount = item.href === "/freelancer/notifications" ? unreadCount : 0;
    const isComingSoon = item.href === "#";

    const handleClick = (e: React.MouseEvent) => {
      if (isComingSoon) {
        e.preventDefault();
        setShowComingSoon(item.label);
        setTimeout(() => setShowComingSoon(null), 2500);
      }
    };

    return (
      <Link
        href={isComingSoon ? "#" : item.href}
        onClick={handleClick}
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
        {!isCollapsed && (
          <>
            <span className="truncate flex-1">{item.label}</span>
            {isComingSoon && (
              <span className="text-[9px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                Pronto
              </span>
            )}
            {badgeCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0EA5A0] text-[10px] font-bold text-white">
                {badgeCount}
              </span>
            )}
          </>
        )}
        {isCollapsed && badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#0EA5A0] text-[8px] font-bold text-white">
            {badgeCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {showLogoutModal && (
        <ConfirmModal
          title="¿Cerrar sesión?"
          description="Tendrás que volver a iniciar sesión para acceder a tu cuenta."
          confirmLabel="Cerrar sesión"
          cancelLabel="Cancelar"
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      {/* Coming soon toast */}
      {showComingSoon && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 shadow-lg flex items-center gap-2.5">
            <span className="text-lg">🚧</span>
            <p className="text-sm font-medium text-amber-800">
              <strong>{showComingSoon}</strong> — En desarrollo
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-[#1B3A6B]"
        aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR DESKTOP */}
      <aside
        className={`fixed left-0 top-0 h-screen ${sidebarWidth} bg-white border-r border-slate-200 flex flex-col z-30 transition-all duration-300 hidden lg:flex`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-[#1B3A6B] transition-colors"
          aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          <ChevronRight
            className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
          />
        </button>

        <div className={`px-4 pt-6 pb-4 border-b border-slate-100 ${isCollapsed ? "flex justify-center" : ""}`}>
          <div className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}>
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#1B3A6B] text-white font-bold text-lg shrink-0">
              A
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-base font-bold text-[#1B3A6B] truncate">Achanvear</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-sm text-slate-600 truncate">{fullName}</p>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-medium rounded-full shrink-0">
                    Profesional
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
            href="/freelancer/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              pathname.startsWith("/freelancer/settings")
                ? "bg-blue-50 text-[#1B3A6B] border-l-[3px] border-[#1B3A6B]"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            } ${isCollapsed ? "justify-center pl-3 border-l-[3px] border-transparent" : ""}`}
            title={isCollapsed ? "Configuración" : undefined}
          >
            <Settings
              className={`w-5 h-5 shrink-0 ${pathname.startsWith("/freelancer/settings") ? "text-[#1B3A6B]" : "text-slate-400"}`}
              strokeWidth={1.5}
            />
            {!isCollapsed && "Configuración"}
          </Link>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Cerrar sesión" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            {!isCollapsed && "Cerrar sesión"}
          </button>
        </div>
      </aside>

      {/* SIDEBAR MÓVIL */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-300 lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#1B3A6B] text-white font-bold text-lg shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-[#1B3A6B] truncate">Achanvear</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-sm text-slate-600 truncate">{fullName}</p>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-medium rounded-full shrink-0">
                  Profesional
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/freelancer"
                ? pathname === "/freelancer"
                : pathname.startsWith(item.href);

            const Icon = item.icon;
            const badgeCount = item.href === "/freelancer/notifications" ? unreadCount : 0;

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
                {badgeCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0EA5A0] text-[10px] font-bold text-white">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-100 space-y-1">
          <Link
            href="/freelancer/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              pathname.startsWith("/freelancer/settings")
                ? "bg-slate-100 text-[#1e3a8a] border-l-[3px] border-[#1e3a8a] pl-[9px]"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Settings
              className={`w-5 h-5 ${pathname.startsWith("/freelancer/settings") ? "text-[#1e3a8a]" : "text-slate-400"}`}
              strokeWidth={1.5}
            />
            Configuración
          </Link>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? "ml-[72px]" : "ml-[260px]"} lg:ml-0`}
        style={{ marginLeft: isCollapsed ? "72px" : "260px" }}
      >
        <header className="flex flex-shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-6 py-2.5">
          <div className="flex flex-1 max-w-lg items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Buscar empleos, proyectos, servicios..."
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <button
              onClick={() => router.push("/freelancer/notifications")}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Bell className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#1B3A6B] text-xs font-bold text-white">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}