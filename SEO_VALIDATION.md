# SEO de Achanvear

Dominio principal confirmado: https://achanvear.site.
La variable NEXT_PUBLIC_SITE_URL del frontend configura los enlaces canónicos,
el sitemap y los datos estructurados. Debe tener ese valor también en producción.

## Contenido público

- /guias: índice de orientación laboral y servicios.
- /guias/buscar-trabajo: CV, vacantes, postulaciones y entrevistas.
- /guias/primer-empleo: primeros trabajos, egresados y proyectos académicos.
- /guias/ser-freelancer: portafolio, alcance y propuestas para primeros clientes.
- /guias/servicios-profesionales: ofrecer servicios y comparar profesionales.
- /guias/publicar-empleo: funciones, requisitos y selección para empresas.

Cada guía tiene contenido visible renderizado en el servidor, un título y una
descripción propios, encabezados, URL canónica, enlaces relacionados y acceso al
registro. La portada enlaza las guías y el sitemap las incluye. Las preguntas
frecuentes visibles y sus datos estructurados comparten la misma fuente.

El favicon de Achanvear reemplaza el de Vercel.

## Verificación local

- Portada, índice y cinco guías: HTTP 200, un H1 por página y enlaces canónicos.
- Sitemap XML válido y enlaces bajo achanvear.site.
- Guía inexistente: HTTP 404.
- ESLint aprobado para los archivos SEO modificados.
- El chequeo global de TypeScript detecta tres errores fuera de este cambio:
  comparaciones de MilestoneStatus con HELD en EscrowTab.tsx y PaymentsPage.tsx.

## Publicación

Publicar el frontend con NEXT_PUBLIC_SITE_URL=https://achanvear.site.
En Google Search Console, enviar https://achanvear.site/sitemap.xml y solicitar
inspección de las páginas publicadas. El cambio local no actualiza el sitio
desplegado ni garantiza una posición en los resultados de búsqueda.
