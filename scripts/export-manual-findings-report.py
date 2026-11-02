"""Export the verified evidence into Markdown and a standalone Word report."""
import json
import re
import zipfile
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVIDENCE = ROOT / "evidencias-hallazgos"
backend = json.loads((EVIDENCE / "backend-tests.json").read_text(encoding="utf-8"))["resultado"]
agent = json.loads((EVIDENCE / "agent-tests.json").read_text(encoding="utf-8"))
api = json.loads((EVIDENCE / "api-local.json").read_text(encoding="utf-8"))["pruebas"]
browser = json.loads((EVIDENCE / "navegador-local.json").read_text(encoding="utf-8"))
assert backend["failures"] == backend["errors"] == backend["skipped"] == 0
assert agent["resultado"] == "PASS"
assert "PASS:" in (EVIDENCE / "audio-whisper.txt").read_text(encoding="utf-8")
assert json.loads((EVIDENCE / "frontend-build.json").read_text(encoding="utf-8"))["resultado"] == "PASS"

fixes = {
1: ("Contratación y moneda", "La cotización toma la moneda almacenada del servicio. PEN admite normalización; una moneda distinta muestra su valor real y explica en español que el profesional debe definir un precio en PEN. Se corrigieron las tildes. No se aplica conversión de importes."),
2: ("Presupuesto acordado", "La vista usa el importe de la propuesta aceptada, incluido el caso 3000–7000 con propuesta de 5000, y conserva el presupuesto inicial cuando todavía no existe acuerdo."),
3: ("Nombre del profesional", "La propuesta aceptada muestra freelancerName y deja de presentar el UUID como nombre."),
4: ("Singular de propuesta", "Las tarjetas y los detalles muestran 1 propuesta y el plural para el resto de cantidades."),
5: ("Portafolio en la postulación", "El formulario incluye portfolioUrl en el envío de la propuesta. La Empresa recupera el enlace de esa propuesta."),
6: ("Portafolio del registro", "La personalización usa el perfil persistido y guarda portfolioItems mediante PUT /freelance/profiles/{id}. Se dejó de depender del endpoint que solo confirmaba éxito sin guardar."),
7: ("Editar certificados", "Se añadió edición del nombre, emisor y enlace, con cancelación y guardado persistente. La prueba de navegador modifica, guarda y recarga el certificado."),
8: ("Evaluaciones ficticias", "Se retiró del perfil la sección con puntajes y promedio de agentes que no procedían del backend."),
9: ("Nombre y fecha del CV", "Se limpia el UUID del nombre del archivo. Si el backend no entrega la fecha específica del CV, se informa Fecha de actualización no registrada; no se inventa una fecha al recargar."),
10: ("Notificación de selección", "La aceptación de una propuesta que asigna al profesional genera una notificación persistente mediante la migración V76. El menú actualiza notificaciones periódicamente."),
11: ("Mensajes sin leer", "Los menús de Empresa y Profesional suman unreadCount de las conversaciones y muestran la burbuja también en la navegación adaptable."),
12: ("Consentimiento adaptable", "La tarjeta tiene desplazamiento y un alto flexible. Se verificaron el micrófono y los controles a 1366×768."),
13: ("Plan gratuito manual", "FREE muestra selección manual sin fases, puntuaciones, informes o controles de agentes. Aprobar cierra la selección con estado HIRED; descartar usa REJECTED. El backend rechaza automatización, agentes y creación o inicio de entrevistas sin un plan de pago activo."),
14: ("Configuración de ambos perfiles", "Se verificaron persistencia y efectos, y se corrigieron visibilidad de CV, disponibilidad, notificaciones, privacidad, formato regional, controles sin acción, umbral de avisos y 2FA. El detalle de cobertura se encuentra en la matriz de configuración."),
15: ("Preguntas antes del caso", "Una pregunta no se toma como confirmación aunque contenga sí. La IA contesta aclaraciones en la fase previa y el cronómetro empieza al recibir una confirmación explícita."),
16: ("Caso, empleo y empresa", "El historial resuelve la empresa real. Python Junior recibe un ejercicio en Python y el caso incorpora la descripción y los requisitos publicados."),
17: ("Reconocimiento de voz", "Whisper usa mayor búsqueda y contexto del empleo; el navegador dispone de respaldo de grabación si su reconocimiento no está disponible. Pasó una prueba con voz sintética en español. Falta la comprobación con el micrófono físico del equipo de exposición."),
18: ("Motivo de cancelación", "La entidad, el mapeador y V76 conservan abort_reason; el endpoint de aborto guarda el motivo recibido. El historial muestra Cancelada y el motivo de los 30 segundos. Un registro antiguo cuyo motivo se perdió se identifica sin inventar la causa."),
19: ("Agente elegido por la Empresa", "La programación normal, el acceso inmediato y el contexto del caso usan la selección de la Empresa. La práctica recibe ese perfil y su voz. Se verificaron los cuatro perfiles y la elección de Ana por API."),
20: ("Cierre al acabar el tiempo", "El límite se mide mediante una fecha de vencimiento real y envía automáticamente la evaluación una vez. Se verificó con 20 minutos simulados en Edge, sin pulsar Entregar."),
}
proof = {number: [] for number in fixes}
for item in api + browser:
    assert item["resultado"] == "PASS"
    proof[item["observacion"]].append(item["prueba"])
proof[15].append("Pruebas del agente: preguntas y aclaraciones mantienen case_ready; la confirmación explícita avanza a working.")
proof[17].append("audio-whisper.txt: Estoy listo para iniciar la entrevista de Programador Python.")
assert all(proof.values())

lines = [
"# Achanvear — Levantamiento y pruebas de las 20 observaciones",
"Fecha de revisión: 1 de noviembre de 2026 (Lima). Documento de origen: Achanvear_Hallazgos_Pruebas_2026-10-30.docx.",
"## Resultado y alcance",
f"Se implementaron correcciones para los 20 puntos y se reunieron evidencias locales: {backend['tests']} pruebas de backend sin fallos ni omisiones, {agent['pruebas']} pruebas del agente aprobadas, comprobaciones HTTP, navegador Edge y compilación de producción del frontend.",
"El cierre corresponde al código y al entorno local aislado. La publicación en producción y la comprobación del micrófono físico de la exposición siguen pendientes. La prueba de audio adjunta usa voz sintética real procesada por Whisper.",
"La base temporal de las pruebas se creó por separado. Las cuentas, proyectos, candidatos, suscripciones y pagos simulados de la validación son datos locales de prueba. No se efectuaron cobros reales ni se enviaron invitaciones por correo.",
"## Revisión punto por punto",
]
matrix = []
for number, (title, fix) in fixes.items():
    lines.extend([f"### {number}. {title}", fix, "Prueba: " + " ".join(proof[number])])
    matrix.append({"observacion": number, "titulo": title, "estado": "VERIFICADO LOCAL; micrófono físico pendiente" if number == 17 else "VERIFICADO LOCAL", "correccion": fix, "evidencias": proof[number]})
lines.extend([
"## Configuración: cobertura y efectos",
"| Perfil y apartado | Comprobación y comportamiento |",
"| --- | --- |",
"| Profesional — General | Guardar, recargar y comprobar formato en-US y UTC-4 en horarios de entrevistas. La opción se identifica como formato regional de fechas; la interfaz continúa en español. Derechos ARCO informativos enlazan a la política. |",
"| Profesional — Trabajo | VERIFIED_COMPANIES_ONLY coincide con el enum del backend. CV privado se oculta en ambos endpoints de perfiles; el propietario conserva su acceso. No disponible excluye al profesional de búsquedas. |",
"| Profesional — Finanzas | Cobros en PEN, sin una opción USD que sugiera conversión. Comisiones y saldo contrastados mediante las pruebas financieras. El flujo de escrow se prueba con fondos simulados locales. |",
"| Ambos — Seguridad | Cancelar limpia el formulario; se retiró un Guardar sin acción. Se verifica cambio de contraseña y 2FA por API en las dos cuentas locales. Los nuevos secretos usan Base32, el QR se genera en el navegador y 2FA solo se activa al validar el código. Se conserva compatibilidad con secretos antiguos. |",
"| Profesional — Notificaciones | Las preferencias de avisos se guardan y filtran la bandeja y su contador. V77 genera oportunidades relacionadas; el recordatorio de entrevistas se genera dentro de los 15 minutos previos, sin duplicados. |",
"| Empresa — General | Preferencias persistentes; las fechas del historial usan formato regional y zona horaria. |",
"| Empresa — Privacidad | Contacto visible/oculto en el perfil consultado desde el chat, exclusión del directorio al activar incógnito u ocultarlo y notificación de visitas al habilitarla. |",
"| Empresa — Agente | FREE no muestra ni permite editar agentes. Con la suscripción de prueba local, Ana se guarda y llega al caso. El umbral 95 oculta un aviso con puntaje 82 y el umbral 50 lo muestra. |",
"| Empresa — Equipo | Listado API y regresión que impide iniciar sesión a colaboradores inactivos. El envío de invitaciones a un proveedor de correo no se ejecutó; esta integración requiere una comprobación separada. |",
"| Empresa — Facturación | Plan, comisiones y saldo se consultan desde API. Contratación, aceptación, entrega, liberación y saldo se comprueban localmente. Una transacción real con tarjeta o un retiro real no forma parte de estas pruebas. |",
"## Evidencias y reproducción",
"- evidencias-hallazgos/api-local.json: comprobaciones HTTP y persistencia.",
"- evidencias-hallazgos/navegador-local.json: acciones y recargas realizadas en Edge.",
"- evidencias-hallazgos/backend-tests.json y agent-tests.json: resultados de las suites.",
"- evidencias-hallazgos/audio-whisper.txt: audio sintético y transcripción.",
"- evidencias-hallazgos/frontend-build.json: imagen de producción compilada.",
"- Capturas PNG: consentimiento-1366x768, empresa-free, seleccion-manual-free, proyecto-acordado-5000, perfil-certificado y fin-tiempo-simulado.",
"- Scripts de reproducción: validate-manual-findings.py, validate-manual-findings-browser.py, check-interview-audio.py y check-practical-dialogue.py, dentro de scripts/.",
"Las credenciales locales permanecen en el archivo ignorado .env.docker.smoke.json; no se incluyen en este informe ni en las evidencias.",
"## Antes de exponer en producción",
"Publicar backend con V76 y V77, agente y frontend de esta revisión. Comprobar el dominio publicado con Empresa y Profesional; un cambio local no actualiza automáticamente la plataforma pública.",
"Realizar una entrevista breve con el micrófono físico y los permisos del navegador del equipo de exposición. La transcripción sintética y la prueba del cronómetro no sustituyen esta comprobación del dispositivo.",
"Para mostrar el resultado local, usar http://localhost:3001. Se mantienen datos ficticios de prueba claramente identificados. No presentar estos registros como evaluaciones o contrataciones reales.",
])
dialogue = EVIDENCE / "dialogo-real.txt"
if dialogue.exists() and "PASS: la IA responde" in dialogue.read_text(encoding="utf-8"):
    lines.insert(lines.index("## Evidencias y reproducción") + 1, "También se ejecutó una aclaración mediante el proveedor real de IA: dialogo-real.txt registra la respuesta y la confirmación posterior sin iniciar el tiempo antes de consentir.")
markdown = ROOT / "LEVANTAMIENTO_HALLAZGOS_2026-11-01.md"
markdown.write_text(re.sub(r"\|\n\n(?=\|)", "|\n", "\n\n".join(lines)) + "\n", encoding="utf-8")
(EVIDENCE / "matriz-20-observaciones.json").write_text(json.dumps(matrix, ensure_ascii=False, indent=2), encoding="utf-8")

def paragraph(text, style="Normal"):
    text = text.replace("`", "")
    return f'<w:p><w:pPr><w:pStyle w:val="{style}"/></w:pPr><w:r><w:t xml:space="preserve">{escape(text)}</w:t></w:r></w:p>'

body = []
for line in lines:
    if line.startswith("| "):  # Markdown audit table becomes readable paragraphs in Word.
        if "---" not in line:
            body.append(paragraph(" — ".join(part.strip() for part in line.strip("|").split("|"))))
    elif line.startswith("### "): body.append(paragraph(line[4:], "Heading2"))
    elif line.startswith("## "): body.append(paragraph(line[3:], "Heading1"))
    elif line.startswith("# "): body.append(paragraph(line[2:], "Title"))
    else: body.append(paragraph(line))
document = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + "".join(body) + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1000" w:right="1000" w:bottom="1000" w:left="1000"/></w:sectPr></w:body></w:document>'
styles = '<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="21"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="34"/><w:color w:val="163A63"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="Heading 1"/><w:pPr><w:keepNext/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="163A63"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="Heading 2"/><w:pPr><w:keepNext/></w:pPr><w:rPr><w:b/><w:sz w:val="23"/></w:rPr></w:style></w:styles>'
output = ROOT / "Achanvear_Levantamiento_y_Pruebas_2026-11-01.docx"
with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as package:
    package.writestr("[Content_Types].xml", '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>')
    package.writestr("_rels/.rels", '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')
    package.writestr("word/_rels/document.xml.rels", '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>')
    package.writestr("word/document.xml", document)
    package.writestr("word/styles.xml", styles)
print("PASS: informe Word, Markdown y matriz de 20 observaciones exportados")
