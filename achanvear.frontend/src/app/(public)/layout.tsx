"use client";

// src/app/(public)/layout.tsx
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Star, ChevronDown } from "lucide-react";

// ─────────────────────────────────────────────
// DATOS ESTÁTICOS DROPDOWNS
// ─────────────────────────────────────────────
const freelancers = [
  { name: "Ana García", role: "Full Stack Developer", rating: 4.9 },
  { name: "Pedro López", role: "UI/UX Designer", rating: 4.8 },
  { name: "Sofia Martínez", role: "Digital Marketer", rating: 5.0 },
];

const jobs = [
  { title: "Backend Developer Senior", company: "TechCorp", salary: "S/. 5,000 - S/. 7,000", urgent: true },
  { title: "Diseñador Gráfico", company: "CreativeHub", salary: "S/. 3,000 - S/. 4,500", urgent: false },
  { title: "Contador Senior", company: "FinanzasPeru", salary: "S/. 4,000 - S/. 6,000", urgent: true },
];

const soluciones = [
  { icon: "👥", title: "Gestión de Talento para Empresas", desc: "Reclutamiento IA + ATS integrado" },
  { icon: "🔒", title: "Validación de Skills con Proctoring", desc: "Entrevistas anti-fraude con agentes IA" },
  { icon: "💳", title: "Sistema de Escrow Seguro", desc: "Pagos protegidos por hitos completados" },
];

// ─────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────
type DropdownKey = "freelancers" | "jobs" | "soluciones" | null;

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Cierra dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (key: DropdownKey) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div ref={navRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: "#1B3A6B" }}>
              A
            </div>
            <span className="text-lg font-semibold" style={{ color: "#1B3A6B" }}>Achanvear</span>
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            {/* Contrata Freelancers */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("freelancers")}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Contrata Freelancers
                <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === "freelancers" ? "rotate-180" : ""}`} />
              </button>

              {activeDropdown === "freelancers" && (
                <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Marketplace de Profesionales Certificados por IA
                  </p>
                  <div className="space-y-2">
                    {freelancers.map((f) => (
                      <div key={f.name} className="flex items-center justify-between rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                          <p className="text-xs text-gray-500">{f.role}</p>
                          <div className="mt-1 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-gray-600">{f.rating}</span>
                          </div>
                        </div>
                        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">IA</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/register"
                    className="mt-3 block w-full rounded-xl py-2.5 text-center text-sm font-semibold text-white transition-colors"
                    style={{ background: "linear-gradient(to right, #1B3A6B, #0EA5A0)" }}
                    onClick={() => setActiveDropdown(null)}
                  >
                    Regístrate para ver el Marketplace completo
                  </Link>
                </div>
              )}
            </div>

            {/* Encuentra Trabajo */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("jobs")}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Encuentra Trabajo
                <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === "jobs" ? "rotate-180" : ""}`} />
              </button>

              {activeDropdown === "jobs" && (
                <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Buscador de Empleos y Gigs
                  </p>
                  <div className="space-y-2">
                    {jobs.map((j) => (
                      <div key={j.title} className="flex items-start justify-between rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{j.title}</p>
                          <p className="text-xs text-gray-500">{j.company}</p>
                          <p className="mt-1 text-xs font-medium" style={{ color: "#0EA5A0" }}>{j.salary}</p>
                        </div>
                        {j.urgent && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Urgente</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/register"
                    className="mt-3 block w-full rounded-xl py-2.5 text-center text-sm font-semibold text-white transition-colors"
                    style={{ background: "linear-gradient(to right, #1B3A6B, #0EA5A0)" }}
                    onClick={() => setActiveDropdown(null)}
                  >
                    Regístrate para explorar todas las ofertas
                  </Link>
                </div>
              )}
            </div>

            {/* Soluciones */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("soluciones")}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Soluciones
                <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === "soluciones" ? "rotate-180" : ""}`} />
              </button>

              {activeDropdown === "soluciones" && (
                <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Soluciones Empresariales
                  </p>
                  <div className="space-y-2">
                    {soluciones.map((s) => (
                      <div key={s.title} className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xl">
                          {s.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                          <p className="text-xs text-gray-500">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/register"
                    className="mt-3 block w-full rounded-xl py-2.5 text-center text-sm font-semibold text-white transition-colors"
                    style={{ background: "linear-gradient(to right, #1B3A6B, #0EA5A0)" }}
                    onClick={() => setActiveDropdown(null)}
                  >
                    Solicita una demo empresarial
                  </Link>
                </div>
              )}
            </div>

            {/* Nosotros — scroll a sección misión */}
            <a
              href="#mision"
              className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              onClick={() => setActiveDropdown(null)}
            >
              Nosotros
            </a>
          </nav>

          {/* CTA buttons — desktop */}
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: "#0EA5A0" }}
            >
              Crear cuenta
            </Link>
          </div>

          {/* Hamburger — mobile */}
          <button
            className="flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-gray-100 bg-white py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {["Contrata Freelancers", "Encuentra Trabajo", "Soluciones"].map((item) => (
                <button key={item} className="py-2 px-2 text-left text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {item}
                </button>
              ))}
              <a href="#mision" className="py-2 px-2 text-left text-sm text-gray-600 hover:text-gray-900 transition-colors" onClick={() => setMenuOpen(false)}>
                Nosotros
              </a>
            </nav>
            <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
              <Link href="/login" className="py-2 text-center text-sm font-medium text-gray-700 hover:text-gray-900">
                Iniciar sesión
              </Link>
              <Link href="/register" className="rounded-lg px-4 py-2 text-center text-sm font-semibold text-white" style={{ backgroundColor: "#0EA5A0" }}>
                Crear cuenta
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-10">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold text-white">A</div>
              <span className="text-base font-semibold text-white">Achanvear</span>
            </div>
            <p className="mb-5 max-w-xs text-sm leading-relaxed text-gray-400">
              La plataforma líder en Perú para conectar talento certificado con oportunidades laborales.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-teal-600 hover:text-white transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" aria-label="X" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-teal-600 hover:text-white transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-teal-600 hover:text-white transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-teal-400">Para Profesionales</h4>
            <ul className="space-y-2.5">
              {["Buscar empleos", "Proyectos freelance", "Certificación IA", "Mi wallet"].map((item) => (
                <li key={item}>
                  <Link href="/register" className="text-sm text-gray-400 hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-teal-400">Para Empresas</h4>
            <ul className="space-y-2.5">
              {["Publicar vacante", "Planes y precios", "Pipeline IA", "API Empresarial"].map((item) => (
                <li key={item}>
                  <Link href="/register" className="text-sm text-gray-400 hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-6 sm:flex-row lg:mt-12">
          <p className="text-center text-xs text-gray-500 sm:text-left">
            © 2026 Achanvear. Conectando talento peruano con oportunidades.
          </p>
          <div className="flex gap-4 sm:gap-5">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacidad</Link>
            <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Términos</Link>
            <Link href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">SUNAT</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// LAYOUT
// ─────────────────────────────────────────────
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}