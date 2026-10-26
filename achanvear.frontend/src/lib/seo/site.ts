import { GUIDES } from "./guides";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://achanvear.site"
).replace(/\/$/, "");

export const SITE_NAME = "Achanvear";

export const SITE_LOCALE = "es_PE";

export const SITE_TAGLINE =
  "Publica empleos y contrata profesionales independientes en Perú";

export const SITE_DESCRIPTION =
  "Busca trabajo, prepara tu primer empleo y ofrece servicios profesionales en Perú. Encuentra freelancers o publica empleos para tu empresa en Achanvear.";

/**
 * Palabras clave orientadas a las búsquedas reales de los usuarios en Perú.
 */
export const SITE_KEYWORDS: string[] = [
  "publicar empleo",
  "publicar oferta de empleo",
  "buscar empleo",
  "buscar trabajo",
  "cómo buscar trabajo",
  "mi primer empleo",
  "mi primer trabajo",
  "empleo para egresados",
  "primeros trabajos",
  "servicios profesionales",
  "brindar servicios profesionales",
  "buscar profesionales",
  "ser freelancer",
  "empleos en Perú",
  "bolsa de trabajo Perú",
  "freelancer",
  "freelancers Perú",
  "trabajo freelance",
  "proyectos freelance",
  "profesionales independientes",
  "conseguir ser independiente",
  "ser freelance",
  "trabajar como independiente",
  "contratar freelancer",
  "talento independiente",
  "marketplace de servicios profesionales",
  "Achanvear",
];

/** Rutas públicas que deben indexarse en buscadores (para sitemap y robots). */
export const PUBLIC_ROUTES: Array<{
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/guias", changeFrequency: "monthly", priority: 0.8 },
  ...GUIDES.map(({ slug }) => ({ path: `/guias/${slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  { path: "/register", changeFrequency: "weekly", priority: 0.9 },
  { path: "/login", changeFrequency: "monthly", priority: 0.5 },
  { path: "/nosotros", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

/**
 * Rutas que NO deben indexarse (áreas privadas / autenticadas).
 */
export const PRIVATE_ROUTES: string[] = [
  "/dashboard",
  "/onboarding",
  "/payments",
  "/api",
  "/ping-backend",
];
