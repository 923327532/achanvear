-- Legal content drafts. Preserve published versions and historical consents.

INSERT INTO legal_document_versions (id, document_id, version, title, content, status, created_at)
SELECT gen_random_uuid(), d.id, '1.1', 'Términos y condiciones de Achanvear', '## 01. Una plataforma para conectar talento y oportunidades

Achanvear es una plataforma que conecta profesionales y empresas. Integra publicaciones, postulaciones, servicios y herramientas de evaluación asistidas por inteligencia artificial.

El uso de la plataforma está sujeto a estas condiciones y al respeto de los derechos de sus usuarios. El tratamiento de datos personales requiere información previa, una finalidad definida y una base jurídica válida.

## 02. Una cuenta representa a una persona

Para participar debes contar con capacidad legal para aceptar estas condiciones. La experiencia está dirigida a personas mayores de edad. Mantén tus credenciales en reserva y comunica cualquier uso no autorizado.

La información de tu perfil, experiencia y publicaciones debe ser veraz. Si registras una empresa, declara únicamente datos que estés autorizado a proporcionar y no atribuyas una representación que no tienes.

## 03. Identidad y representación de empresas

El DNI del profesional o del representante se utiliza en los flujos de identificación y validación disponibles. El RUC permite asociar el perfil de Empresa con el contribuyente declarado. La política de privacidad explica estos tratamientos por separado.

Comprobar la identidad de una persona no acredita, por sí solo, poderes de representación de una empresa. Del mismo modo, aceptar un RUC de once dígitos no acredita su estado tributario, su condición de habido ni la validez de una representación ante SUNAT. Achanvear no se presenta como RENIEC ni como SUNAT.

## 04. Oportunidades que se pueden tomar en serio

Publica ofertas claras: describe funciones, requisitos, modalidad y condiciones relevantes. No solicites pagos para acceder a una entrevista, no suplantes identidades y no publiques contenido discriminatorio, engañoso o ilícito.

Solo incorpora CV, trabajos, imágenes y documentos propios o sobre los que tengas autorización. Conservas los derechos sobre tu contenido; su uso en la plataforma debe limitarse a las funciones y finalidades informadas.

## 05. La IA acompaña; las personas deciden

Las herramientas de IA pueden ayudar a revisar postulaciones, proponer preguntas, evaluar respuestas y generar reportes. Sus resultados pueden contener errores y no equivalen a un título profesional, una certificación estatal ni una garantía de contratación.

Las entrevistas deben informar previamente el uso de IA y solicitar los consentimientos específicos que correspondan para tratar respuestas y realizar grabaciones. Una aceptación general no sustituye estos consentimientos. La Empresa debe revisar la información antes de tomar una decisión de contratación; el participante puede solicitar revisión de datos o resultados que considere incorrectos.

## 06. Trabajo, servicios y pagos

Crear una cuenta o aprobar una evaluación no crea automáticamente una relación laboral. Empresa y profesional deben acordar las condiciones de cualquier contratación y cumplir las obligaciones laborales, tributarias y de otra naturaleza que correspondan.

Si un flujo habilita pagos, las comisiones, moneda, hitos y condiciones deben mostrarse antes de confirmar la operación. Las condiciones de cada operación deben indicar el alcance del servicio y las responsabilidades de las partes.

Las reglas de publicación dependen del plan vigente. Cancelaciones, controversias y devoluciones se deben analizar según lo pactado, la evidencia disponible y la normativa aplicable, sin excluir derechos irrenunciables.

## 07. Si algo no sale como se esperaba

El equipo puede restringir el acceso ante indicios de fraude, suplantación o afectación a otros usuarios, procurando comunicar el motivo y permitir una revisión. El servicio puede presentar interrupciones por mantenimiento o actualizaciones; no se garantiza un resultado laboral o comercial específico.

Estas condiciones no eliminan responsabilidades que la ley imponga al responsable del servicio ni el derecho de los usuarios a presentar solicitudes o reclamaciones.

## 08. El marco que nos orienta

El tratamiento de datos se enmarca en la Ley N.° 29733, Ley de Protección de Datos Personales (2011, Congreso de la República del Perú), y su Reglamento, aprobado por Decreto Supremo N.° 016-2024-JUS (2024, Ministerio de Justicia y Derechos Humanos). Citar estas normas no implica que una autoridad haya certificado o avalado la plataforma.

Los cambios sustanciales deben identificarse mediante una nueva versión y comunicarse según corresponda. La versión asociada a tus consentimientos se puede consultar al final de esta página.

Ley N.° 29733 · Protección de Datos Personales (2011, Congreso de la República del Perú). https://www.gob.pe/institucion/congreso-de-la-republica/normas-legales/243470-29733

Decreto Supremo N.° 016-2024-JUS (2024, Ministerio de Justicia y Derechos Humanos). https://www3.congreso.gob.pe/Docs/DGP/DIDP/files/ds_016-2024-jus.pdf

Derechos ARCO (Autoridad Nacional de Protección de Datos Personales, MINJUSDH). https://www.gob.pe/9270-que-son-los-derechos-arco

Registro Único de Contribuyentes (SUNAT). https://centrovirtual.sunat.gob.pe/tramites/inscribete-ruc', 'DRAFT', CURRENT_TIMESTAMP
FROM legal_documents d WHERE d.type = 'TERMS'
ON CONFLICT (document_id, version) DO NOTHING;

INSERT INTO legal_document_versions (id, document_id, version, title, content, status, created_at)
SELECT gen_random_uuid(), d.id, '1.1', 'Política de privacidad de Achanvear', '## 01. De quién son los datos y quién debe responder

Esta política describe cómo Achanvear trata la información de quienes utilizan la plataforma. El contacto del equipo para consultas de privacidad es roberto.lopez@tecsup.edu.pe. Puedes utilizar este canal para realizar consultas sobre el tratamiento de tus datos y ejercer tus derechos.

La información personal se utiliza para las finalidades descritas en esta política. No incorpores información de terceros sin autorización ni datos que no sean necesarios para utilizar el servicio.

## 02. DNI: identificar a la persona

Los flujos de registro y validación pueden tratar el DNI del profesional y el DNI del representante de una Empresa, junto con los nombres asociados. Se utilizan para contrastar la identidad declarada y apoyar la prevención de suplantaciones.

Cuando se ejecuta la consulta de identidad, el número se transmite al proveedor externo de validación configurado, API Perú. Esta consulta no debe confundirse con una integración institucional directa ni con un aval de RENIEC. Una validación de DNI tampoco demuestra que alguien tenga poderes para representar una empresa.

El DNI identifica a una persona natural y es un dato personal. La Ley N.° 29733 exige tratarlo con una finalidad legítima y de manera proporcional; no obliga, por sí sola, a entregar el DNI a cualquier plataforma privada (2011, Congreso de la República del Perú).

- No publiques tu DNI en la biografía, el portafolio o una conversación pública.
- El perfil público de Empresa utiliza una respuesta separada que no incluye el DNI del representante.
- La información identificativa no debe reutilizarse para una finalidad incompatible con la informada.

## 03. RUC: identificar al contribuyente

El RUC declarado se registra en el perfil de Empresa para asociarlo al contribuyente correspondiente. En la implementación actual se comprueba su formato de once dígitos. Esto no equivale a verificar su inscripción, estado, condición tributaria o representación legal ante SUNAT.

El RUC puede corresponder a una persona natural o a una persona jurídica. El de una persona jurídica no es automáticamente un dato personal; cuando identifica o permite identificar a una persona natural, su tratamiento debe observar las reglas de protección de datos. La información del representante sigue siendo información de una persona natural.

Que exista una consulta pública no autoriza a usar sus resultados para cualquier fin. Achanvear no debe exigir la Clave SOL para identificar el RUC. La definición del registro y sus modalidades se puede contrastar en la fuente oficial de SUNAT.

## 04. El resto de tu recorrido

La plataforma también puede tratar correo, teléfono, perfil profesional, CV, portafolio, propuestas, publicaciones, mensajes y archivos que decidas incorporar. Estos datos permiten gestionar la cuenta, presentar postulaciones, coordinar servicios y mantener la comunicación entre participantes.

Las entrevistas pueden generar respuestas, resultados, reportes y registros de incidencias. Las grabaciones de pantalla, audio o video requieren información previa y los consentimientos específicos aplicables. No adjuntes información sensible o ajena que no resulte necesaria para el proceso.

## 05. Una finalidad concreta para cada uso

Las finalidades operativas son gestionar la cuenta, contrastar la identidad en los flujos habilitados, conectar perfiles con oportunidades, tramitar postulaciones o propuestas y apoyar la evaluación de entrevistas. Los análisis para mejorar el servicio deben priorizar información anonimizada.

Cuando corresponda consentimiento, este debe ser previo, informado, expreso e inequívoco y distinguir los usos opcionales de los necesarios. Negarse a un tratamiento necesario puede impedir completar esa función; no equivale a autorizar otras finalidades. La aceptación de términos y la de privacidad se registran por separado.

## 06. Quiénes intervienen

Según la función y configuración, pueden intervenir proveedores de alojamiento y base de datos, almacenamiento de archivos, correo, validación de identidad y procesamiento de IA. En entrevistas, las preguntas y respuestas pueden enviarse al proveedor de IA habilitado, como DeepSeek. Las funciones de voz también pueden requerir servicios externos.

Algunos proveedores pueden procesar información fuera del Perú. Antes de habilitar esos tratamientos, el responsable debe informar los destinatarios y transferencias que correspondan y adoptar las garantías exigibles. No debe afirmarse que los datos permanecen exclusivamente en el Perú ni que existe un contrato o garantía que no se haya verificado.

Las empresas reciben la información pertinente de las postulaciones y evaluaciones que gestionan. Los números de identificación no deben incorporarse a resultados públicos de búsqueda por el solo hecho de existir en el registro.

## 07. Conservación, seguridad y límites

Los datos deben mantenerse durante el tiempo necesario para las finalidades informadas y las obligaciones aplicables. El calendario de conservación y el procedimiento de eliminación deben definirse para cada categoría antes de ampliar la operación; no se promete un borrado automático en un plazo que el sistema no tenga implementado.

La aplicación utiliza autenticación, controles de acceso y contraseñas con hash. Ningún sistema está exento de riesgos; estas medidas no constituyen una garantía absoluta de seguridad. La atención de incidentes y el acceso del equipo deben limitarse a lo necesario.

El navegador guarda un token para mantener la sesión. Proveedores de autenticación y otros servicios pueden utilizar mecanismos adicionales; no debe interpretarse esta página como una autorización general de seguimiento publicitario.

## 08. Tus derechos siguen siendo tuyos

Puedes solicitar acceso a tus datos, rectificación de información incorrecta, cancelación cuando proceda y oposición a determinados tratamientos. También puedes retirar un consentimiento, sin afectar por ello la licitud del tratamiento previo, y solicitar revisión humana de una evaluación que te afecte.

Escribe a roberto.lopez@tecsup.edu.pe con el asunto Privacidad Achanvear e indica el derecho que deseas ejercer y la información necesaria para localizar tu caso. La verificación de identidad debe ser proporcional: no incluyas contraseñas, Clave SOL ni una copia completa del DNI en el primer mensaje. El equipo podrá solicitar la información estrictamente necesaria por un canal acordado.

La Autoridad Nacional de Protección de Datos Personales ofrece orientación y mecanismos de tutela cuando corresponda. Es una autoridad pública independiente de Achanvear, no su servicio de soporte (Autoridad Nacional de Protección de Datos Personales, Ministerio de Justicia y Derechos Humanos).

## 09. Referencias, sin letra pequeña

La referencia principal es la Ley N.° 29733, Ley de Protección de Datos Personales (2011, Congreso de la República del Perú). Su Reglamento fue aprobado mediante el Decreto Supremo N.° 016-2024-JUS (2024, Ministerio de Justicia y Derechos Humanos). Estas normas orientan las obligaciones y los derechos aplicables al tratamiento de datos personales.

Las actualizaciones de esta política se comunicarán según su alcance y las exigencias aplicables. La documentación publicada que respalda los consentimientos actuales permanece identificada por su propia versión.

Ley N.° 29733 · Protección de Datos Personales (2011, Congreso de la República del Perú). https://www.gob.pe/institucion/congreso-de-la-republica/normas-legales/243470-29733

Decreto Supremo N.° 016-2024-JUS (2024, Ministerio de Justicia y Derechos Humanos). https://www3.congreso.gob.pe/Docs/DGP/DIDP/files/ds_016-2024-jus.pdf

Derechos ARCO (Autoridad Nacional de Protección de Datos Personales, MINJUSDH). https://www.gob.pe/9270-que-son-los-derechos-arco

Registro Único de Contribuyentes (SUNAT). https://centrovirtual.sunat.gob.pe/tramites/inscribete-ruc', 'DRAFT', CURRENT_TIMESTAMP
FROM legal_documents d WHERE d.type = 'PRIVACY'
ON CONFLICT (document_id, version) DO NOTHING;

