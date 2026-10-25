# Revisión de las 25 observaciones del backend

Fecha de trabajo: 25 de octubre de 2026. Documento de origen: `Achanvear_Pendientes_Backend_2026-10-24 (1).docx`.

Los cambios están en el código del repositorio. Las pruebas usan contenedores aislados, PostgreSQL temporal y proveedores simulados; no modifican las cuentas mencionadas en el documento ni prueban el sitio publicado. No se enviaron correos reales.

| Punto | Resolución y contrato | Evidencia local |
| --- | --- | --- |
| A1 | Empresa acepta `BANK_TRANSFER`, `CREDIT_CARD`, `DEBIT_CARD`, `YAPE`, `PLIN` y el valor anterior `CARD`. Un valor desconocido se rechaza; ya no se convierte silenciosamente en transferencia. También se corrigieron los valores `card` y `transfer` del selector del frontend. | Prueba de valores del enum; compilación de backend y tipos del frontend. |
| A2 | El paso de pago exige `acceptEscrowTerms: true` y `escrowTermsVersion` igual a la versión publicada de `TERMS`. Registra `ESCROW_TERMS`, usuario, versión y fecha en `consent_records`, dentro de la transacción del paso. Se reutiliza el documento TERMS vigente; no se inventa un documento legal nuevo. | Prueba rechaza casilla falsa y versión antigua; comprueba persistencia al aceptar. |
| A3 | `GET /payments/commission-policy` publica la política que usa `CommissionPolicy`: plataforma 5 % por hito; procesador Mercado Pago 3,99 % + S/ 0,50; comisión por empleo 0 %, con publicación sujeta al plan. `platform_fees` registra cobros, no tramos de política. Registro de Empresa, Profesional y Finanzas consultan el mismo endpoint. | Prueba compara el endpoint con el cálculo de un cobro. Se retiraron los tramos 5/4/3 de las pantallas. |
| A4 | `POST /company/onboarding/complete` acepta `selectedAgentId`; guarda la selección en la misma transacción. El frontend lo envía al terminar. | Prueba del controlador verifica la escritura del agente elegido. |
| A5 | Índice único sobre el par de usuarios sin depender del orden e inserción con `ON CONFLICT`. La migración reúne conversaciones duplicadas conservando sus mensajes. | PostgreSQL: 16 solicitudes simultáneas desde ambos participantes devuelven el mismo ID, sin 500. |
| A6 | `GET /companies/public/{id}` acepta ID de Empresa o usuario propietario y devuelve solo datos de perfil público a usuarios autenticados. La lista de conversaciones incluye `participantCompanyId`; el panel consulta el perfil real. | PostgreSQL verifica el ID de Empresa y del otro participante en la conversación; el frontend pasa la comprobación de tipos. |
| A7 | El último mensaje sin texto devuelve `Imagen` o `Archivo adjunto`, según el adjunto. | PostgreSQL: imagen y PDF producen los textos esperados. |
| A8 | Se persiste `chat_messages.read_at`; el contador cuenta mensajes del otro participante sin leer. `PATCH /chat/conversations/{id}/read` marca los recibidos. El frontend lo llama al consultar la conversación abierta. | PostgreSQL verifica 1→0, remitente con 0, mensajes nuevos posteriores y que un tercero no pueda marcar mensajes ajenos. |
| A9 | Las dos rutas de calificación usan la misma validación: debe existir un proyecto `COMPLETED` entre autor y destinatario. Sin contratación completada devuelve acceso denegado y no guarda la reseña. | Prueba del servicio verifica rechazo y ausencia de escritura sin contrato. |
| A10 | Se mantiene la calificación del profesional: las estrellas y el número de reseñas de servicios se calculan desde sus `profile_ratings`, la misma fuente que los comentarios. Una reseña del mismo autor se actualiza y no se duplica. | PostgreSQL verifica promedio 4 con dos reseñas 5/3; prueba del dominio verifica reemplazo de la reseña del mismo autor. |
| A11 | Las tarjetas consultan nombre del usuario, titular del perfil (con especialidad como alternativa), foto y verificación del perfil freelance `ACTIVE`. | PostgreSQL comprueba nombre, titular, verificación y cambio a no verificado con `PENDING_VALIDATION`. |
| A12 | `PATCH /companies/collaborators/{id}/activate` permite reactivar; comprueba pertenencia a la Empresa. El equipo dispone del botón Reactivar. | Prueba ACTIVE→INACTIVE→ACTIVE y rechazo al intentar reactivar desde otra Empresa. |
| A13 | El login rechaza colaboradores ausentes o `INACTIVE`; cada petición con JWT vuelve a consultar su estado aunque el token ya incluya companyId. | Pruebas de login con contraseña correcta y de token anterior al cambio; no se emite un token nuevo ni se ejecuta la petición bloqueada. |
| A14 | La invitación expone `emailSent` según el resultado del adaptador y conserva `tempPassword` únicamente en la respuesta de creación de una cuenta nueva. El listado no recupera la contraseña. Se corrigió el correo mostrado/copiado por el modal de credenciales. Usuarios existentes conservan su contraseña. | Prueba simula fallo del correo, obtiene credencial temporal en la invitación y confirma que no aparece en el listado. La entrega real a Gmail queda sin verificar. |
| A15 | Overview y plan actual usan el mismo conteo de empleos desde la creación de Empresa que `POST /jobs`. FREE: 2 empleos durante 30 días; los proyectos freelance mantienen su cuota separada de 1. Los campos históricos `publishedProjectsCount`, `remainingFreeProjects`, `projectsUsed` y `projectsLimit` en estas respuestas de Empresa describen empleos. Los créditos comprados permiten publicar cuando la cuota ordinaria se agota. | Pruebas comparan overview y plan con 2 empleos y 0 proyectos freelance; comprueban cuota agotada y vencimiento. |
| A16 | El servicio que recibe la última respuesta llama a completar. El publicador de entrevistas ahora entrega eventos Spring: antes solo imprimía en consola. El manejador persiste el puntaje real en la postulación, avanza el proceso y genera la técnica al aprobar. | Prueba 85→TECHNICAL_INTERVIEW con theoryScore=85; repetición no vuelve a generar la técnica; prueba de entrega del evento Spring. |
| A17 | `POST /hiring/theory/evaluate` queda denegado a todos los roles HTTP. Completar una entrevista tampoco acepta el puntaje del navegador: recupera el resultado del agente y verifica propiedad del candidato. | Prueba de seguridad con FREELANCER, COMPANY y SUPERADMIN antes de consultar etapas. Enviar 100 al completar una práctica con resultado real 22 guarda 22, también al repetir la llamada. |
| A18 | Al completar teoría o técnica se actualiza la nota de la postulación. Desaprobar deja proceso y postulación en `REJECTED`. El agente conserva el resultado práctico para que Java lo recupere directamente. | Pruebas teoría 60 y técnica 22: puntaje persistido y rechazo. Python rechaza obtener resultado antes de terminar y conserva el 22 calculado por el evaluador simulado. |
| A19 | Aprobar teoría crea la técnica automáticamente. Aprobar técnica lleva a `UNDER_REVIEW`; la Empresa usa el mismo `POST /jobs/{jobId}/applicants/{applicationId}/advance` con `action: ADVANCE`: primera decisión pasa a `APPROVED`, segunda a `HIRED`. No permite saltarse una entrevista en curso. Los botones muestran Aprobar candidato y Contratar. | Prueba de flujo técnico→revisión→aprobado→contratado y rechazo de contratación prematura. |
| A20 | Las estadísticas añaden `theoryInterviewsInProgress` y `technicalInterviewsInProgress`. El pipeline consume cada campo por separado. | Prueba con 2 teóricas y 3 técnicas devuelve valores distintos. |
| A21 | Estados de postulación: `SUBMITTED`, `IN_REVIEW`, `SHORTLISTED`, `REJECTED`, `HIRED`. Se añaden screeningScore, screeningResult y currentStage a las postulaciones embebidas de cada empleo. “Filtrados por IA” cuenta postulaciones con screeningScore; “Finalistas” cuenta currentStage APPROVED/HIRED. Se retiraron las comparaciones PENDING/REVIEWING/ACCEPTED de esos conteos. | Compilación de DTO y comprobación de tipos del frontend. Ver semántica debajo. |
| A22 | V68 guarda finalización de etapas mediante triggers. El detalle usa esos registros y appliedAt para la recepción de la postulación; nunca devuelve la hora de la consulta como fecha histórica. Las etapas anteriores cuya fecha no es recuperable devuelven null. | PostgreSQL comprueba fecha de recepción histórica y fecha de teoría estable tras consultas y actualizaciones posteriores. |
| A23 | Horarios API en ISO 8601 con UTC explícito. Se almacenan en UTC; los horarios futuros de 09:00 y 10:00 se generan en America/Lima y luego se convierten. “Dar ahora” usa UTC explícito. | Prueba analiza el offset y recupera 09:00/10:00 al convertir a Lima. No se modifican a ciegas las horas históricas ya elegidas. |
| A24 | Nuevas teóricas: 15 preguntas (8 técnicas, 3 psicológicas, 2 de equipo y 2 abiertas). Se limita la salida del proveedor a 15 y se completa si devuelve menos. Las sesiones ya iniciadas conservan sus preguntas. | Python: proveedor con 20 devuelve 15; proveedor con lista vacía completa las 15 y las cuatro categorías. |
| A25 | La práctica consulta `GET /interviews/{id}/job-context` con propiedad del candidato; recibe título, descripción y requisitos de la vacante. El área y puesto no se editan en el modal de una entrevista existente. HTML/CSS junior obtiene un reto de página semántica, accesible y adaptable, en lugar del reto backend sénior detectado por la prueba. | Python comprueba que el título HTML produce workspace coding y un reto HTML. Se probó el generador determinista con evaluador simulado; queda por repetir una entrevista humana completa con el proveedor real tras desplegar. |

## Semántica de selección

- SUBMITTED: recibida, sin evaluación curricular concluida.
- IN_REVIEW: evaluación/recomendación curricular pendiente de decisión manual.
- SHORTLISTED: admitido al proceso; la etapa precisa está en currentStage.
- REJECTED: descartado manualmente o entrevista desaprobada.
- HIRED: contratación confirmada por la Empresa.
- UNDER_REVIEW y APPROVED son etapas de hiring, no estados adicionales de postulación.
- El umbral predeterminado de aprobación es 75/100. La teoría utiliza HiringConfig; el flujo técnico actual utiliza 75/100.

## Validación y reproducción

Resultado local: **38 pruebas Java aprobadas, sin fallos, errores ni omisiones**
(12 regresiones, 21 observaciones y 5 casos con PostgreSQL), **12 pruebas Python
aprobadas**, comprobación TypeScript aprobada y compilación de producción Next.js
aprobada con 62 páginas generadas. `git diff --check` también pasó.

Pruebas Java: `BackendRegressionTest`, `BackendObservationsTest`, `ChatDatabaseTest`, `ServiceDatabaseTest`. Las dos últimas solo se ejecutan si existe `REVIEW_DB_URL`; requieren PostgreSQL vacío y desechable. Crean tablas mínimas para probar el SQL real de V33/V34/V67/V68 y las consultas modificadas; no equivalen a una migración completa de una copia de producción.

```powershell
docker build --target regression-tests -t achanvear-backend-regression ./achanvear.backend
docker run --rm -d --name achanvear-observations-db -e POSTGRES_PASSWORD=review-local-only -e POSTGRES_DB=observations -p 127.0.0.1:55439:5432 postgres:16-alpine
docker run --rm -e REVIEW_DB_URL=jdbc:postgresql://host.docker.internal:55439/observations achanvear-backend-regression mvn test -B '-Dtest=BackendRegressionTest,BackendObservationsTest,ChatDatabaseTest,ServiceDatabaseTest'
docker stop achanvear-observations-db
```

Pruebas Python: 6 regresiones teóricas, 4 observaciones nuevas y 2 de conexión práctica, con IA y correo simulados. Ejecutar en el entorno del agente:

```text
python -m unittest tests.test_theory_regression tests.test_backend_observations tests.test_practical_connection -v
```

Frontend: `npx tsc --noEmit` y `npm.cmd run build`.

## Aplicación de cambios y comprobaciones pendientes

Es necesario desplegar backend, agente y frontend juntos. Flyway aplicará V67/V68 al iniciar la nueva versión; hasta entonces el backend que ya está ejecutándose conserva su comportamiento anterior. No se reconstruyeron los servicios conectados a Supabase durante estas pruebas.

Después del despliegue deben verificarse con cuentas de prueba: recepción real del correo de invitación, recorrido visual completo de registro/chat/equipo/facturación y entrevista completa con el proveedor de IA real. No se puede afirmar que el correo llegó a Gmail o que una entrevista humana completa ya se repitió a partir de las pruebas simuladas.
