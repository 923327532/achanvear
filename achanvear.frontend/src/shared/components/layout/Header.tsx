"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES, homeRouteForRole } from "@/lib/constants";

export function Header() {
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menuItems = [
    {
      id: "freelancers",
      label: "Contrata Freelancers",
      items: [
        { label: "Buscar Freelancers", href: "/freelancers" },
        { label: "Por Categoría", href: "/categories" },
        { label: "Top Talent", href: "/top-talent" },
      ],
    },
    {
      id: "jobs",
      label: "Encuentra Trabajo",
      items: [
        { label: "Buscar Trabajos", href: "/jobs" },
        { label: "Por Categoría", href: "/job-categories" },
        { label: "Trabajos Destacados", href: "/featured-jobs" },
      ],
    },
    {
      id: "solutions",
      label: "Soluciones",
      items: [
        { label: "Para Empresas", href: "/enterprise" },
        { label: "Para Freelancers", href: "/freelancer-solutions" },
        { label: "Validación de Skills", href: "/skills-validation" },
      ],
    },
  ];

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href={ROUTES.home} className="-m-1.5 p-1.5 flex items-center">
            <span className="sr-only">Achanvear</span>
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-teal-600 text-white font-bold text-lg">
              A
            </div>
            <span className="ml-3 text-xl font-bold text-blue-900">Achanvear</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setOpenMenu(openMenu === "mobile" ? null : "mobile")}
          >
            <span className="sr-only">Abrir menú principal</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {menuItems.map((item) => (
            <div key={item.id} className="relative">
              <button
                type="button"
                className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 hover:text-teal-600 transition-colors"
                onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
              >
                {item.label}
                <svg className={`h-5 w-5 flex-none text-gray-400 transition-transform ${openMenu === item.id ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              {openMenu === item.id && (
                <div className="absolute left-0 top-full z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-gray-900/5">
                  <div className="py-2">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                        onClick={() => setOpenMenu(null)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <Link href="/about" className="text-sm font-semibold leading-6 text-gray-900 hover:text-teal-600 transition-colors">
            Nosotros
          </Link>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          {user ? (
            <div className="flex items-center gap-x-4">
              <Link href={user ? homeRouteForRole(user.role) : "/dashboard"} className="text-sm font-semibold leading-6 text-gray-900 hover:text-teal-600">
                Mi panel
              </Link>
              <button
                onClick={logout}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-teal-600"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <>
              <Link href={ROUTES.login} className="text-sm font-semibold leading-6 text-gray-900 hover:text-teal-600 flex items-center">
                Iniciar sesión
                <span aria-hidden="true" className="ml-1">→</span>
              </Link>
              <Link
                href="/onboarding/freelancer"
                className="rounded-md bg-gradient-to-r from-blue-900 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-blue-800 hover:to-teal-500 transition-all"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </nav>
      {openMenu === "mobile" && (
        <div className="lg:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-sm font-semibold leading-6 text-gray-900"
                  onClick={() => setOpenMenu(openMenu === `mobile-${item.id}` ? "mobile" : `mobile-${item.id}`)}
                >
                  {item.label}
                  <svg className={`h-5 w-5 flex-none text-gray-400 transition-transform ${openMenu === `mobile-${item.id}` ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {openMenu === `mobile-${item.id}` && (
                  <div className="mt-2 space-y-1 pl-4">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className="block py-2 text-sm font-medium text-gray-700 hover:text-teal-600"
                        onClick={() => setOpenMenu(null)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/about" className="block py-2 text-sm font-semibold leading-6 text-gray-900 hover:text-teal-600" onClick={() => setOpenMenu(null)}>
              Nosotros
            </Link>
            {user ? (
              <>
                <Link href={user ? homeRouteForRole(user.role) : "/dashboard"} className="block py-2 text-sm font-semibold leading-6 text-gray-900 hover:text-teal-600" onClick={() => setOpenMenu(null)}>
                  Mi panel
                </Link>
                <button onClick={() => { logout(); setOpenMenu(null); }} className="block w-full text-left py-2 text-sm font-semibold leading-6 text-gray-900 hover:text-teal-600">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href={ROUTES.login} className="block py-2 text-sm font-semibold leading-6 text-gray-900 hover:text-teal-600" onClick={() => setOpenMenu(null)}>
                  Iniciar sesión
                </Link>
                <Link href={ROUTES.register} className="block py-2 text-sm font-semibold leading-6 text-teal-600" onClick={() => setOpenMenu(null)}>
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
