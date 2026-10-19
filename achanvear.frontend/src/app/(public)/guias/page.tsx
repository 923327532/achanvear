import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/seo/guides";

export const metadata: Metadata = {
  title: "Guías para buscar empleo, ser freelancer y contratar profesionales",
  description: "Orientación para encontrar tu primer empleo, buscar trabajo, brindar servicios profesionales y publicar ofertas de empleo en Perú.",
  alternates: { canonical: "/guias" },
};

export default function GuidesPage() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
      <h1 className="text-3xl font-bold text-slate-900">Guías de empleo y servicios profesionales</h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-600">Prepara tu primer trabajo, da el paso al trabajo independiente o encuentra talento para tu empresa.</p>
      <div className="mt-9 grid gap-5 sm:grid-cols-2">
        {GUIDES.map((guide) => (
          <Link key={guide.slug} href={`/guias/${guide.slug}`} className="rounded-2xl border border-slate-200 p-6 transition-colors hover:border-teal-600">
            <h2 className="text-xl font-semibold text-teal-800">{guide.title}</h2>
            <p className="mt-3 leading-relaxed text-slate-600">{guide.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
