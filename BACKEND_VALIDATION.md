# Verificacion del backend

Entorno local: Supabase PostgreSQL, backend y agente IA en Docker, frontend en Next.js.

Verificado el 18 de octubre de 2026: 12 pruebas Java y 6 pruebas Python aprobadas;
entrevista real de 20 preguntas con DeepSeek completada; endpoints de perfiles,
proyectos, resenas, edicion de fecha vencida y cierre automatico comprobados contra
Supabase. Los datos temporales de estas pruebas se eliminaron al finalizar.

## Observaciones del 17 de octubre

| Punto | Cambio |
| --- | --- |
| Cierre de vacantes | El ultimo postulante cierra el cupo; las fechas vencidas rechazan nuevas postulaciones. Una tarea cada 15 segundos persiste cierres pendientes. Las postulaciones concurrentes bloquean la fila de la vacante. |
| Edicion de vacantes vencidas | Se permite conservar la misma fecha vencida y editar empleos cerrados. Una fecha nueva debe ser futura. El empleo conserva su estado. |
| Perfil profesional | PUT conserva los campos omitidos o nulos, incluidas preferencias, fotos, certificados, habilidades y portafolio. Enviar una lista vacia elimina su contenido; texto opcional vacio permite limpiar ese campo. |
| Notificaciones | El repositorio actualiza notification_preferences al guardar una entidad existente. |
| Reputacion de empresa | CompanyResponse devuelve averageRating, totalRatings, reputationScore y ratings. Los proyectos usan la misma fuente real de calificaciones. |
| Identidad del freelancer | Proyectos incluyen selectedFreelancerName y selectedFreelancerPhotoUrl; propuestas incluyen freelancerName y freelancerPhotoUrl. Los nombres y fotos se consultan en un lote por pagina. |

## Calificar una empresa

`POST /api/v1/companies/{companyId}/ratings`, con autenticacion FREELANCER:

```json
{"stars": 5, "recommended": true, "comment": "Buena comunicacion"}
```

Se requiere un proyecto COMPLETED con ese freelancer seleccionado y esa empresa
como cliente. La resena del mismo autor se actualiza al repetirla. Las consultas
`GET /companies/profile` y `GET /companies/{id}` incluyen las calificaciones.

## Entrevistas teoricas

- Corregido el 500 por recording_active nulo: la entidad usa boolean primitivo,
  normaliza asignaciones nulas a false y el mapper conserva el estado real de la
  grabacion, el codigo y el estilo del entrevistador.
- Comprobado con una entrevista THEORY/SCHEDULED temporal: POST /interviews/{id}/start,
  /violations y /abort devolvieron 200. Supabase guardo IN_PROGRESS, recording_active=false,
  sesion Python y los datos del entrevistador; tras abortar conservo false.
- El proveedor activo se selecciona con LLM_PROVIDER; el entorno local usa deepseek.
- Reiniciar una sesion del agente conserva la pregunta actual y sus puntuaciones.
- No se aceptan respuestas vacias, respuestas antes del inicio ni resultados de entrevistas incompletas.
- Un fallo del proveedor responde 503 y conserva el progreso. No genera puntuaciones de aprobacion de respaldo.
- La prueba del agente cubre inicio, 20 respuestas y resultado final con DeepSeek real.

## Ejecutar

### Entrevista práctica en producción

Diagnóstico de achanvear.site: su frontend tiene configurado el agente en
https://api.achanvear.site. Las rutas /practical-interview/start y /health devuelven
404 de Java, mientras /api/v1/actuator/health devuelve UP. La práctica necesita
que el proxy enrute sus rutas HTTP y WebSocket a Python; ver
deploy/nginx/agent-routes.conf y DOCKER_DEPLOY.md.

Además, edge-tts 7.0.0 devolvía 403 al sintetizar voz. La prueba aislada con 7.3.1
generó audio correctamente. Se actualizó la dependencia y se limitó la espera de
síntesis a 8 segundos. El frontend ofrece activar la voz cuando el navegador
bloquea reproducción automática, y muestra errores de conexión sin espera infinita.

Prueba local posterior: dos pruebas de conexión aprobadas; saludo por WebSocket
recibido inmediatamente y audio real a los 2,84 segundos. Una respuesta del
candidato recibió texto y audio del entrevistador. Compilación de producción del
frontend aprobada.

Estos cambios requieren actualizar el agente y el proxy del servidor y desplegar
el frontend. La validación local no sustituye comprobar el endpoint público.

```powershell
docker compose up -d --build
docker compose ps
docker build --target regression-tests -t achanvear-backend-regression ./achanvear.backend
docker compose exec -T ai-agent python -m unittest discover -s tests -p test_theory_regression.py -v
```

Frontend: ejecutar `npm run dev` dentro de `achanvear.frontend`.

- Web: http://localhost:3000
- Swagger backend: http://localhost:8081/api/v1/swagger-ui/index.html
- Agente IA: http://localhost:8001/docs

Al cambiar claves del .env raiz, ejecutar
`docker compose up -d --force-recreate ai-agent backend` para cargarlas.
