import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, findGuide } from "@/lib/seo/guides";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = findGuide((await params).slug);
  if (!guide) notFound();
  const path = `/guias/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: path },
    openGraph: {
      title: `${guide.title} | Achanvear`, description: guide.description,
      url: path, type: "article", images: ["/opengraph-image.png"],
    },
    twitter: { card: "summary_large_image", title: guide.title, description: guide.description, images: ["/opengraph-image.png"] },
  };
}

export default async function GuidePage({ params }: Props) {
  const guide = findGuide((await params).slug);
  if (!guide) notFound();
  return (
    <article className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
      <nav aria-label="Ruta de navegación" className="mb-8 text-sm text-teal-700">
        <Link href="/">Inicio</Link> / <Link href="/guias">Guías</Link>
      </nav>
      <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">{guide.title}</h1>
      <p className="mt-6 text-lg leading-relaxed text-slate-600">{guide.intro}</p>
      <div className="mt-10 space-y-9">
        {guide.steps.map((step, index) => (
          <section key={step.title}>
            <h2 className="text-xl font-semibold text-slate-900">{index + 1}. {step.title}</h2>
            <p className="mt-3 leading-relaxed text-slate-600">{step.text}</p>
          </section>
        ))}
      </div>
      <Link href="/register" className="mt-10 inline-block rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800">{guide.cta}</Link>
      <aside className="mt-14 border-t border-slate-200 pt-8">
        <h2 className="text-xl font-semibold text-slate-900">Más guías para tu siguiente paso</h2>
        <ul className="mt-4 space-y-3">
          {GUIDES.filter((item) => item.slug !== guide.slug).map((item) => (
            <li key={item.slug}><Link href={`/guias/${item.slug}`} className="text-teal-700 underline underline-offset-4">{item.title}</Link></li>
          ))}
        </ul>
      </aside>
    </article>
  );
}
