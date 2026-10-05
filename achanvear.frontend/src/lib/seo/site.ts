
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://achanvear.com"
).replace(/\/$/, "");

export const SITE_NAME = "Achanvear";

export const SITE_LOCALE = "es_PE";

export const SITE_TAGLINE =
  "Publica empleos y contrata profesionales independientes en Perú";

export const SITE_DESCRIPTION =
  "Achanvear es la plataforma peruana de talento freelance y empleo donde puedes publicar empleos, buscar empleo, encontrar freelancers y profesionales independientes verificados por IA. Consigue proyectos y trabaja como independiente con pagos seguros (Escrow).";

/**
 * Palabras clave orientadas a las búsquedas reales de los usuarios en Perú.
 */
export const SITE_KEYWORDS: string[] = [
  "publicar empleo",
  "publicar oferta de empleo",
  "buscar empleo",
  "buscar trabajo",
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
  { path: "/register", changeFrequency: "weekly", priority: 0.9 },
  { path: "/login", changeFrequency: "monthly", priority: 0.5 },
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
