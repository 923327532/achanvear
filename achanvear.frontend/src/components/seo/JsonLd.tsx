// src/components/seo/JsonLd.tsx
// Inserta datos estructurados JSON-LD (schema.org) en el HTML para Google.
import { organizationSchema, websiteSchema } from "@/lib/seo/jsonld";

interface JsonLdProps {
  /** Datos estructurados ya construidos (cualquier objeto schema.org). */
  data: Record<string, unknown>;
}

/**
 * Renderiza un bloque <script type="application/ld+json">.
 * Se usa en componentes de servidor para que Google lea los datos en el HTML.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // El contenido proviene de nuestro propio código, no de input del usuario.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Bloque por defecto con Organization + WebSite para el layout raíz.
 */
export function SiteJsonLd() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
    </>
  );
}
