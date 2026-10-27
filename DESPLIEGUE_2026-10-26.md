# Despliegue de producción

Publicado el 25 de octubre de 2026, aproximadamente a las 20:29 de Lima (26 de octubre UTC).

- Código: `360badffe8fd4a8ef8f5309e01549a179e13959c`, ya publicado en `main`.
- Frontend: Vercel confirmó `success`: https://vercel.com/923327532s-projects/achanvear/8T1Mq6yeRG9tGvXHKHxQJhuzAAWE
- Sitio: https://www.achanvear.site
- VPS: `142.11.235.7`, Compose en `/opt/apps/achanvear/docker-compose.yml`.
- Backend: `achanvear-backend:360badf`.
- Agente: `achanvear-ai-agent:360badf-validated`, construido sobre la imagen anterior con el código completo actualizado; las dependencias no cambiaron.
- Ambos servicios saludables. Redis se conservó sin recrear.
- Flyway validó 71 migraciones y aplicó V71 desde V70.
- SHA-256 del JAR: `a48c5c860d23cbb61321bf289d70095f9a848005f741f82a5f220f74f53ab5a3`.

## Respaldo y recuperación

Directorio protegido: `/root/achanvear-backups/20261026-360badf/`.

Contiene respaldo PostgreSQL custom de 591412 bytes validado mediante `pg_restore --list`, configuración anterior, archivos de entorno protegidos, Compose posterior y registros de compilación/pruebas.

Imágenes anteriores: `achanvear-backend:rollback-360badf` y `achanvear-ai-agent:rollback-360badf`. Código y JAR: `/opt/apps/achanvear/releases/20261026-360badf/`.

No restaurar automáticamente toda la base: sobrescribiría actividad posterior. V71 agrega almacenamiento de resultados y se conserva al revertir imágenes.

## Validación

- 57 pruebas Java aprobadas, incluidas pruebas de persistencia en PostgreSQL aislado.
- 17 pruebas Python aprobadas con `MOCK_LLM=true` y Redis desactivado para las pruebas unitarias. Usar un cliente Redis global entre distintos bucles de TestClient produjo un fallo del entorno de pruebas; la conexión real se verificó por WebSocket de producción.
- TypeScript sin errores.
- Verificaciones del frontend: una sola voz, cronómetro después del anuncio, interrupciones y reconocimiento sin envíos duplicados.
- API pública y agente: HTTP 200.
- Consultas autenticadas de los reportes teórico y práctico: HTTP 200. Envío manual de nota con el contrato válido: HTTP 403.
- Inicio, Nosotros, términos, privacidad, publicaciones y proyectos: HTTP 200. Términos incluye el título y contacto actualizados.
- Nginx: configuración válida.
- WebSocket público: bienvenida con nombre y puesto, interrupción, reglas, experiencia, caso Java y fase de trabajo verificados con una sesión sintética; sesión retirada de Redis.

El recorrido físico de micrófono/cámara y la recepción de correos por personas no forman parte de esta comprobación automática.
