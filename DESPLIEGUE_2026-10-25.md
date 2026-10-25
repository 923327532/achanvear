# Despliegue de producción — 25 de octubre de 2026

Se publicaron backend, agente y frontend. Commit: `7f925d6249b3bc664f52d6021bddb063dd6a3add`.
Se integraron las correcciones sobre `7451142`, conservando la actualización de frontend que ya existía en GitHub.

## Servidor

- VPS: `142.11.235.7`, hostname `racknerd-264c021`.
- Configuración activa: `/opt/apps/achanvear/docker-compose.yml`.
- Backend: `achanvear-backend:20261025-observations`.
- Agente: `achanvear-ai-agent:20261025-observations`.
- Ambos contenedores saludables; Redis se conservó sin recrear.
- Flyway validó 68 migraciones y aplicó V67/V68 correctamente desde la versión 66.
- Se publicó el puerto del agente exclusivamente en `127.0.0.1:8001`; Nginx ya tenía las rutas configuradas. Esto corrigió el 502 del agente.
- El JAR transferido coincide con el probado localmente: SHA-256 `0a8f494611b8b045726233fa8af71801e47d9db89ace3bba6ee6616cde7604ae`.

## Respaldo

Directorio protegido en el VPS: `/root/achanvear-backups/20261025-observations/`.

- Base previa: `database-before.dump`, 479 917 bytes, formato PostgreSQL custom; `pg_restore --list` validó su contenido.
- Copias de Compose, archivos de entorno del servidor y configuración Nginx.
- Imágenes anteriores conservadas como `achanvear-backend:rollback-20261025` y `achanvear-ai-agent:rollback-20261025`.
- Código y JAR desplegados en `/opt/apps/achanvear/releases/20261025-observations/`.
- Registros de compilación, pruebas del agente y comprobaciones autenticadas dentro del directorio del respaldo.

No se copiaron las claves del servidor al repositorio. Restaurar la base requiere una decisión explícita y una ventana de mantenimiento: no debe sobrescribirse automáticamente la actividad posterior al despliegue.

## Frontend

- GitHub `main` actualizado sin force push.
- Vercel confirmó `success` para el commit indicado.
- Despliegue: https://vercel.com/923327532s-projects/achanvear/5ggqxkssD6FYSmHr2UQTJjxCXKz6
- Sitio público: https://achanvear.site
- El dominio público devuelve 200 y sus archivos JavaScript incluyen el componente nuevo que consulta `commission-policy`.
- La integración con el frontend reciente pasó compilación de producción y generó las 62 páginas.

## Comprobaciones en producción

| Comprobación | Resultado |
| --- | --- |
| API `/api/v1/actuator/health` | 200, UP |
| Agente `/agent-health` | 200, healthy, DeepSeek |
| Política `/api/v1/payments/commission-policy` | 200, versión 2026-10-25 |
| Candidato intenta enviar puntaje a `/hiring/theory/evaluate` | 403 |
| Consulta autenticada de servicios | 200 |
| Overview de pagos y plan actual | 200 |
| Conversaciones y estadísticas de contratación | 200 |
| Perfil público de Empresa consultado como Profesional | 200, sin DNI, RUC ni método de pago |
| Inicio de teoría con DeepSeek real, en una sesión temporal | 15 preguntas |
| Reto práctico para Desarrollador Junior HTML | Coding, HTML/CSS accesible |
| WebSocket público `wss://api.achanvear.site/practical-interview/ws/...` | 101, evento ready |
| Configuración Nginx | `nginx -t` aprobado |

Las sesiones temporales usadas para probar la generación de entrevistas se eliminaron de Redis. No se calificó ni alteró una postulación real durante estas comprobaciones. No había un proceso en THEORY_INTERVIEW para el candidato de prueba seleccionado; la verificación de 403 se hizo con el rol real y un ID temporal. Las pruebas automatizadas previas verificaron que la autorización ocurre antes de consultar la etapa.

Las 38 pruebas Java y 12 Python previas siguen documentadas en [la matriz A1–A25](OBSERVACIONES_BACKEND_2026-10-24.md); las 12 Python también pasaron en la imagen instalada en el VPS.

## Pendiente de aceptación funcional

La recepción real del correo de invitación y un recorrido humano completo de contratación no se verificaron. No se enviaron correos de prueba a personas ni se asignaron resultados a candidatos reales. La prueba con DeepSeek confirmó la generación de preguntas, no una entrevista humana completa.

La copia local se actualizó al commit publicado. La versión local anterior de las correcciones se conservó en un stash con el mensaje `Preserve local reviewed fixes before production integration 2026-10-25`.
