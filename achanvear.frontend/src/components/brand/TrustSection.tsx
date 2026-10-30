import Link from "next/link";
import { RecommendationComments } from "./RecommendationComments";
import { ArrowUpRight, FileCheck2, ShieldCheck } from "lucide-react";

export function TrustSection() {
  return (
    <section className="bg-[#f5f8f9] px-5 py-16 sm:px-8 sm:py-20" aria-labelledby="trust-title"><div className="mx-auto max-w-7xl">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-end"><div><p className="text-[11px] font-semibold uppercase tracking-[0.23em] text-teal-700">Confianza, por escrito</p><h2 id="trust-title" className="mt-4 max-w-lg text-3xl font-semibold leading-tight tracking-tight text-[#102c46] sm:text-4xl">La confianza también<br />se diseña.</h2></div><p className="max-w-xl text-sm leading-7 text-slate-600">Tu experiencia merece visibilidad. Tu identidad merece cuidado. Conoce las reglas de la plataforma y por qué se solicitan el DNI y el RUC, con referencias a la normativa peruana.</p></div>
      <RecommendationComments />
      <div className="mt-9 grid gap-4 md:grid-cols-2">{[
        { href: "/terms", icon: FileCheck2, title: "Reglas claras para empezar.", label: "Términos y condiciones", description: "Cuentas, publicaciones, evaluaciones con IA y acuerdos entre empresas y profesionales." },
        { href: "/privacy", icon: ShieldCheck, title: "Tus datos, con un propósito.", label: "Política de privacidad", description: "DNI, RUC, destinatarios, consentimientos y derechos sobre tu información personal." },
      ].map(({ href, icon: Icon, title, label, description }) => <Link key={href} href={href} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-900/5 sm:p-8"><div className="flex items-center justify-between"><Icon className="h-6 w-6 text-teal-700" /></div><h3 className="mt-6 text-xl font-semibold tracking-tight text-[#102c46]">{title}</h3><p className="mt-3 max-w-md text-sm leading-7 text-slate-500">{description}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-700">{label}<ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span></Link>)}</div>
    </div></section>
  );
}
