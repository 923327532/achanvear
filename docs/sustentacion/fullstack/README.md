# Ejemplo completo para la prueba fullstack

Este ejemplo corresponde a «Desarrollador fullstack - Prueba del editor», cuyo caso es `buildPipelineSummary`. Sirve para comprobar las herramientas y la entrega de evidencias; no garantiza una nota ni reemplaza explicar las decisiones.

```text
proyecto-entrevista/
├── db/
│   └── schema.sql
├── src/
│   ├── models.ts
│   └── pipeline.service.ts
├── tests/
│   └── pipeline.test.ts
├── main.ts
└── README.md
```

Crear tres carpetas y seis archivos. Copiar el contenido de cada archivo en la ruta equivalente del editor de entrevista. Borrar el archivo inicial `hello.ts` para conservar exactamente esta estructura: el punto de entrada de este ejemplo es `main.ts`.

1. En el explorador, usar «Crear desde la raiz» antes de introducir una ruta completa como `src/models.ts`. Las carpetas permiten desplegar y contraer sus archivos.
2. Seleccionar `main.ts` y pulsar Ejecutar. Se compilan los archivos TypeScript y se ejecutan doce comprobaciones, seguidas del resumen: `new` tiene un postulante y promedio 72; `interview` tiene dos y promedio 89.5.
3. Seleccionar `db/schema.sql` y pulsar Ejecutar. Se crean tabla, indice y vista, se cargan ejemplos y se comprueban las consultas de agrupacion y promedio. El programa SQL se ejecuta en un esquema temporal; los cambios se revierten al terminar esa ejecucion. TypeScript y SQL son comprobaciones independientes: el programa TypeScript no abre una conexion a PostgreSQL.
4. Antes de Entregar, volver a seleccionar `main.ts` y ejecutarlo otra vez. Se entregan todos los archivos, incluido SQL y las pruebas. Explicar por voz que se ejecutaron ambas partes; la terminal y `lastRun` muestran la ultima ejecucion.

## Decisiones

- `main.ts`: punto de entrada y demostracion.
- `src/models.ts`: contratos de entrada y salida.
- `src/pipeline.service.ts`: reglas de agrupacion, promedio, acciones y validaciones. Utiliza Map para acumular sin colisiones de claves; tiempo O(n) y espacio O(k) para k estados.
- `tests/pipeline.test.ts`: doce comprobaciones ejecutables, sin instalar un framework.
- `db/schema.sql`: persistencia de ejemplo con restricciones de integridad y consultas SQL equivalentes.

Las acciones son una politica de ejemplo: `new` recomienda revisar perfil; `interview`, realizar entrevista; otros estados, revisar etapa. Una empresa podria definir un catalogo mas completo. La comunicacion y cualquier otro requisito de la vacante tambien forman parte de la evaluacion.
