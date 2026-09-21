// src/app/(public)/page.tsx
import {
  Users,
  DollarSign,
  Code2,
  TrendingUp,
  Palette,
  Scale,
  Calculator,
  MoreHorizontal,
  Star,
} from "lucide-react";
import Link from "next/link";

// ─────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700/85 via-teal-800/75 to-teal-600/70" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-xs text-white/90">✦ Plataforma #1 de Talento en Perú</span>
          </div>

          <h1 className="mb-4 text-2xl font-extrabold leading-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
            Contrata en línea al mejor
            <br />
            talento del Perú{" "}
            <span className="text-emerald-400">para</span>
            <br />
            <span className="text-amber-400">cualquier trabajo</span>
          </h1>

          <p className="mb-7 text-sm text-slate-200 sm:text-base lg:text-lg">
            Conecta con profesionales certificados por IA, gestiona proyectos con Escrow seguro
            y reduce el tiempo de contratación hasta en un 70%.
          </p>

          <ul className="mb-8 space-y-2.5">
            {[
              "El mercado más grande de especialistas certificados por IA",
              "Paga solo cuando el hito esté 100% completado (Escrow)",
              "Ahorra hasta un 70% en tiempos de reclutamiento",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-400">
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-slate-200 sm:text-base">{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-teal-700 transition-colors">
              <Users className="h-4 w-4" />
              Contrata a un profesional
            </Link>
            <Link href="/register" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
              <DollarSign className="h-4 w-4" />
              Gana dinero como freelancer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// STATS BAR
// ─────────────────────────────────────────────
const stats = [
  { value: "3,400+", label: "Empleos activos" },
  { value: "1,200+", label: "Freelancers certificados" },
  { value: "800+", label: "Servicios profesionales" },
  { value: "98%", label: "Empresas satisfechas" },
];

function StatsBar() {
  return (
    <section className="bg-gradient-to-r from-slate-800 to-teal-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={stat.label} className={`py-8 text-center ${i !== stats.length - 1 ? "border-r border-white/10" : ""}`}>
              <p className="text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-300 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// SECTORES
// ─────────────────────────────────────────────
const sectores = [
  { icon: Code2, label: "Tecnología" },
  { icon: TrendingUp, label: "Marketing" },
  { icon: Palette, label: "Diseño" },
  { icon: Scale, label: "Legal" },
  { icon: Calculator, label: "Contabilidad" },
  { icon: MoreHorizontal, label: "Otros" },
];

function SectoresSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">Sectores que cubrimos</h2>
          <p className="mt-3 text-sm text-gray-500 sm:text-base">
            Profesionales certificados en todas las industrias clave del Perú
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {sectores.map(({ icon: Icon, label }) => (
            <button key={label} className="group flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition-all hover:border-teal-300 hover:shadow-md sm:p-6">
              <Icon className="h-6 w-6 text-gray-400 transition-colors group-hover:text-teal-600 sm:h-7 sm:w-7" />
              <span className="text-xs font-medium text-gray-700 sm:text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// TESTIMONIOS
// ─────────────────────────────────────────────
const testimonios = [
  { stars: 5, text: "Encontré mi primer empleo como desarrollador en menos de 2 semanas. El proceso fue transparente y rápido.", name: "Carlos Mendoza", role: "Desarrollador Full Stack" },
  { stars: 5, text: "Como MYPE, la selección automatizada nos ahorró semanas. Contratamos al candidato perfecto en días.", name: "María Torres", role: "CEO, TechSolutions Peru" },
  { stars: 5, text: "El sistema de Escrow me dio la confianza para trabajar con clientes internacionales. Cobro seguro y a tiempo.", name: "Luis Ramírez", role: "Diseñador UX/UI" },
];

function TestimoniosSection() {
  return (
    <section className="bg-gray-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">Lo que dicen nuestros usuarios</h2>
          <p className="mt-3 text-sm text-gray-500 sm:text-base">Miles de profesionales y empresas ya confían en Achanvear</p>
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {testimonios.map((t) => (
            <div key={t.name} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex gap-1">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 sm:h-5 sm:w-5" />
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">"{t.text}"</p>
              <p className="text-sm font-semibold text-gray-900">{t.name}</p>
              <p className="text-xs text-gray-400">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// MISIÓN
// ─────────────────────────────────────────────
const misionFeatures = [
  { emoji: "🎯", title: "Certificación IA", desc: "Validamos skills reales con entrevistas proctoring" },
  { emoji: "🔒", title: "Pagos Seguros", desc: "Sistema Escrow que protege a ambas partes" },
  { emoji: "⚡", title: "Rapidez", desc: "Contrata en días, no en semanas" },
];

function MisionSection() {
  return (
    <section id="mision" className="bg-gradient-to-br from-teal-700 to-teal-500 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs text-white backdrop-blur-sm">
            ✦ Nuestra Misión
          </span>
        </div>
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl xl:text-5xl">
            Reduciendo la informalidad laboral en Perú
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-teal-100 sm:text-base">
            Achanvear nació con una misión clara: transformar el mercado laboral peruano mediante
            tecnología de misión crítica. Conectamos talento verificado con empresas que buscan
            excelencia, eliminando la incertidumbre del proceso de contratación.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          {misionFeatures.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/20 bg-white/10 p-5 text-center backdrop-blur-sm sm:p-6">
              <div className="mb-3 text-3xl">{f.emoji}</div>
              <h3 className="mb-2 text-sm font-bold text-white sm:text-base">{f.title}</h3>
              <p className="text-xs text-teal-100 sm:text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// CTA FINAL
// ─────────────────────────────────────────────
function CtaSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">Comienza hoy mismo</h2>
        <p className="mb-8 text-sm text-gray-500 sm:text-base">
          Únete a miles de profesionales y empresas que ya están transformando su forma de trabajar
        </p>
        <Link href="/register" className="inline-block rounded-xl bg-teal-600 px-8 py-4 text-sm font-semibold text-white shadow-md hover:bg-teal-700 transition-colors sm:text-base">
          Crear cuenta gratis
        </Link>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// PAGE ROOT
// ─────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <SectoresSection />
      <TestimoniosSection />
      <MisionSection />
      <CtaSection />
    </>
  );
}