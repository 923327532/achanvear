// src/lib/seo/jsonld.ts
// Generadores de JSON-LD (schema.org) para mejorar la presencia en Google.
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  PUBLIC_ROUTES,
} from "./site";

/**
 * Organization: muestra el logo, la marca y los perfiles sociales
 * en los resultados de búsqueda de Google (Knowledge Panel / rich results).
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: "Achanvear Perú",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo/logo-512.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/opengraph-image.png`,
    description: SITE_DESCRIPTION,
    slogan: "Conectando talento peruano con oportunidades",
    areaServed: {
      "@type": "Country",
      name: "Perú",
    },
    knowsAbout: [
      "empleo",
      "trabajo freelance",
      "freelancers",
      "profesionales independientes",
      "reclutamiento",
      "proyectos freelance",
    ],
    sameAs: [
      "https://www.linkedin.com/company/achanvear",
      "https://x.com/achanvear",
      "https://www.facebook.com/achanvear",
    ],
  };
}

/**
 * WebSite con SearchAction: habilita el cuadro de búsqueda (sitelinks searchbox)
 * y refuerza la marca "Achanvear" en Google.
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "Achanvear Perú",
    url: SITE_URL,
    inLanguage: "es-PE",
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS.join(", "),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: `${SITE_URL}/logo/logo-512.png`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/register?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * ItemList con las secciones públicas principales del sitio.
 */
export function itemListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: PUBLIC_ROUTES.map((route, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}${route.path}`,
    })),
  };
}

/**
 * FAQPage: responde a las búsquedas reales de los usuarios
 * ("cómo publicar empleo", "cómo buscar trabajo", "cómo ser freelance").
 */
export const FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "¿Cómo publicar empleo o una oferta de trabajo en Achanvear?",
    answer:
      "Para publicar empleo en Achanvear crea tu cuenta de empresa gratis, completa el perfil y publica tu oferta de trabajo. Nuestra IA analiza el puesto, sugiere el perfil ideal y te conecta con profesionales independientes verificados en Perú.",
  },
  {
    question: "¿Cómo buscar empleo o trabajo freelance en Perú?",
    answer:
      "Buscar empleo en Achanvear es gratis: regístrate, certifica tus habilidades con nuestra evaluación por IA con proctoring y postula a empleos y proyectos freelance disponibles en Perú.",
  },
  {
    question: "¿Cómo encontrar freelancers y profesionales independientes?",
    answer:
      "Encuentra freelancers y profesionales independientes certificados por IA en Achanvear. Publica tu proyecto, revisa perfiles verificados y contrata en días, no en semanas, con pagos protegidos por Escrow.",
  },
  {
    question: "¿Cómo conseguir ser independiente y trabajar por mi cuenta?",
    answer:
      "Para conseguir ser independiente y trabajar por tu cuenta, crea tu perfil de freelancer en Achanvear, publica tus servicios profesionales y recibe propuestas de proyectos con pagos seguros.",
  },
  {
    question: "¿Qué es Achanvear?",
    answer:
      "Achanvear es la plataforma peruana que conecta talento freelancer y profesionales independientes con empresas. Ofrece publicación de empleos, búsqueda de trabajo, proyectos freelance y un sistema de pagos seguro (Escrow).",
  },
];

export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
