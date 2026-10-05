// src/app/robots.ts
import type { MetadataRoute } from "next";
import { SITE_URL, PRIVATE_ROUTES } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_ROUTES.map((route) => `${route}/`),
      },
      {
        // Permitir explícitamente a los principales crawlers y evitar
        // que la zona privada se indexe.
        userAgent: ["Googlebot", "Bingbot"],
        allow: "/",
        disallow: PRIVATE_ROUTES.map((route) => `${route}/`),
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
