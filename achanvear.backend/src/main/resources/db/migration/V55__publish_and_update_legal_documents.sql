-- V55: Publica Términos y Condiciones y Política de Privacidad con la versión vigente definitiva.
-- Actualiza la versión v1 existente (creada como DRAFT en V52) a PUBLISHED con el contenido final,
-- establece la fecha de publicación y enlaza la versión vigente en legal_documents.current_version_id.

UPDATE legal_document_versions lv
SET
    title    = 'Términos y Condiciones de Achanvear',
    status   = 'PUBLISHED',
    published_at = NOW(),
    content  = '## Términos y Condiciones de Achanvear

Versión 1.0 — Vigente desde el 25 de agosto de 2026.

## 1. Identidad del responsable

El presente documento regula el uso de la plataforma Achanvear (en adelante, "la Plataforma"), operada por Achanvear. Para consultas y comunicaciones sobre este documento, puedes escribir a soporte@achanvear.com.

## 2. Aceptación de los Términos

Al crear una cuenta y marcar la casilla de aceptación, el usuario declara haber leído y aceptado estos Términos y Condiciones. La aceptación es independiente de la Política de Privacidad y ambos documentos deben aceptarse por separado.

## 3. Objeto de la Plataforma

Achanvear conecta a profesionales y empresas para la búsqueda de empleo, proyectos freelance y servicios. La Plataforma incluye procesos de selección asistidos por inteligencia artificial, entrevistas teóricas y entrevistas técnicas o prácticas.

## 4. Cuentas y registro

Para usar la Plataforma el usuario debe registrarse con información veraz y mantener sus datos actualizados. El usuario es responsable de la confidencialidad de sus credenciales. El registro requiere la aceptación expresa e informada de estos Términos y de la Política de Privacidad.

## 5. Uso de datos personales y consentimiento

El tratamiento de datos personales se realiza conforme a la Ley N.° 29733, Ley de Protección de Datos Personales, y su Reglamento aprobado mediante el Decreto Supremo N.° 016-2024-JUS, vigente desde el 31 de marzo de 2025, así como según la Política de Privacidad de Achanvear. Achanvear solicitará un consentimiento previo, informado, expreso e inequívoco antes de recopilar y utilizar los datos de los usuarios, e informará la finalidad del tratamiento: crear el perfil, postular a empleos o proyectos y evaluar durante los procesos de selección. La Plataforma solo solicitará los datos necesarios para brindar estos servicios, aplicando el principio de minimización de datos.

## 6. Procesos de selección e inteligencia artificial

La Plataforma puede utilizar servicios de inteligencia artificial para el análisis de postulaciones, la generación de preguntas, el screening y la evaluación de entrevistas. El postulante otorga consentimiento específico antes de cada entrevista respecto del tratamiento de sus respuestas, el uso de IA y la grabación de la sesión cuando corresponda.

## 7. Grabación de sesiones

Durante las entrevistas pueden grabarse pantalla, audio o video con fines de evaluación y control de integridad. Estas grabaciones se almacenan de forma segura y solo se accede a ellas conforme a la finalidad autorizada y a lo establecido en la Política de Privacidad.

## 8. Obligaciones del usuario

El usuario se compromete a usar la Plataforma de forma lícita, a no suplantar identidades, a no introducir datos falsos y a no interferir con el funcionamiento de los procesos de selección, incluyendo cualquier intento de fraude o elusión de las medidas anti-trampa.

## 9. Propiedad intelectual

Los contenidos de la Plataforma, marcas, software y materiales asociados pertenecen a Achanvear o a sus licenciantes. El usuario no adquiere ningún derecho de explotación sobre los mismos.

## 10. Limitación de responsabilidad

Achanvear actúa como intermediario y no garantiza la contratación de ningún postulante ni la disponibilidad permanente del servicio. La responsabilidad de Achanvear se limita a los términos permitidos por la ley aplicable.

## 11. Suspensión y cancelación de cuenta

Achanvear puede suspender o cancelar cuentas que incumplan estos Términos, sin perjuicio de las acciones legales correspondientes.

## 12. Modificaciones

Achanvear puede actualizar estos Términos. La versión vigente se publicará en esta página con su fecha y número de versión. Los cambios materiales se comunicarán a los usuarios.

## 13. Legislación aplicable

Estos Términos se rigen por la legislación de la República del Perú. Para cualquier controversia, las partes se someten a la jurisdicción de los jueces y tribunales de Lima, Perú.

## 14. Seguridad de la información

Para autenticar las solicitudes y evitar modificaciones no autorizadas, Achanvear utiliza tokens JWT firmados mediante el algoritmo RS256, compuestos por un Header, un Payload y una Signature, con un tiempo de expiración definido. Las contraseñas se almacenan cifradas y el acceso se controla mediante autenticación y permisos según el tipo de usuario. Los CV, portafolios y grabaciones se almacenan en servicios protegidos, y las empresas solo acceden a la información de los postulantes que participan en sus procesos de selección autorizados.

Última actualización: 25 de agosto de 2026.'
WHERE EXISTS (
    SELECT 1 FROM legal_documents d WHERE d.id = lv.document_id AND d.type = 'TERMS'
);

UPDATE legal_document_versions lv
SET
    title    = 'Política de Privacidad de Achanvear',
    status   = 'PUBLISHED',
    published_at = NOW(),
    content  = '## Política de Privacidad de Achanvear

Versión 1.0 — Vigente desde el 25 de agosto de 2026.

## 1. Responsable del tratamiento

Achanvear (en adelante, "la Plataforma") es el responsable del tratamiento de los datos personales recopilados a través de la Plataforma. Para ejercer tus derechos o resolver cualquier consulta sobre el tratamiento de tus datos, puedes escribir a soporte@achanvear.com.

## 2. Datos personales recopilados

Recopilamos los datos que nos proporcionas al registrarte y usar la Plataforma: nombres, DNI, RUC, correo electrónico, teléfono, datos del representante legal, información profesional, CV, postulaciones y respuestas a entrevistas. También podemos recopilar datos de uso, registro de cambios de pestaña durante entrevistas y, con consentimiento específico, grabaciones de pantalla, audio o video.

## 3. Finalidades del tratamiento

Tratamos tus datos personales para: (a) gestionar tu cuenta y autenticación; (b) gestionar postulaciones y procesos de selección; (c) conectar profesionales y empresas; (d) evaluar entrevistas teóricas y técnicas; (e) generar reportes para las empresas; (f) cumplir obligaciones legales y prevenir fraude; y (g) mejorar la Plataforma. Solo recopilamos los datos necesarios para estas finalidades, aplicando el principio de minimización.

## 4. Base legal del tratamiento

El tratamiento se sustenta en la Ley N.° 29733, Ley de Protección de Datos Personales, y su Reglamento aprobado mediante el Decreto Supremo N.° 016-2024-JUS, vigente desde el 31 de marzo de 2025, así como en el consentimiento del titular y la ejecución de la relación contractual derivada del uso de la Plataforma. El consentimiento es libre, previo, expreso, informado e inequívoco, y puede ser revocado. Achanvear solo solicitará los datos necesarios para brindar los servicios, aplicando el principio de minimización de datos.

## 5. Uso de datos para empleo, freelance y selección

Los datos de los profesionales se utilizan para evaluar postulaciones y enviar invitaciones a entrevistas. Los datos de las empresas se utilizan para publicar ofertas y administrar procesos de selección.

## 6. Servicios tecnológicos y proveedores externos

La Plataforma utiliza proveedores tecnológicos (almacenamiento en la nube, servicios de correo, servicios de pago, entre otros). Estos proveedores actúan como encargados del tratamiento y solo procesan datos según nuestras instrucciones y bajo medidas de seguridad adecuadas.

## 7. Uso de inteligencia artificial

Podemos utilizar servicios de inteligencia artificial para el screening de postulaciones, la generación de preguntas y la evaluación de respuestas en entrevistas. Antes de cada entrevista se solicita consentimiento específico para el uso de IA en la evaluación.

## 8. Grabación de pantalla, audio, video y respuestas

Con tu consentimiento previo, podemos grabar la sesión de entrevista, incluida la pantalla, el audio o el video, con la finalidad de evaluar el desempeño y resguardar la integridad del proceso. Las grabaciones se almacenan de forma segura y solo se accede a ellas conforme a la finalidad autorizada.

## 9. Plazos de conservación

Conservamos tus datos personales solo durante el tiempo necesario para cumplir las finalidades descritas y los plazos legales aplicables. Las evidencias de consentimiento se conservan como soporte del cumplimiento normativo. Las grabaciones se conservan el plazo definido internamente y luego se eliminan o anonimizan.

## 10. Derechos del titular

De conformidad con la Ley N° 29733, puedes ejercer los derechos de acceso, rectificación, cancelación, oposición, revocación del consentimiento y, cuando corresponda, los derechos previstos en la normativa vigente. Puedes ejercerlos a través de los canales habilitados por Achanvear. La revocación del consentimiento para una entrevista impide iniciar o continuar la entrevista correspondiente.

## 11. Transferencias o encargos a terceros

Tus datos pueden ser comunicados a encargados de tratamiento y a las empresas que participan en los procesos de selección, únicamente cuando sea necesario para las finalidades descritas y bajo las garantías exigidas por la normativa.

## 12. Medidas de seguridad

Achanvear implementa medidas técnicas, organizativas y legales adecuadas para proteger tus datos personales frente a acceso no autorizado, pérdida o alteración. El acceso se controla mediante autenticación y permisos según el tipo de usuario; los tokens JWT son firmados con el algoritmo RS256, compuestos por un Header, un Payload y una Signature, y tienen un tiempo de expiración; las contraseñas se almacenan cifradas; y los CV, portafolios y grabaciones se almacenan en servicios protegidos. Además se aplica cifrado en tránsito, control de acceso y registro de auditoría. Las empresas solo acceden a la información de los postulantes que participan en sus procesos autorizados.

## 13. Actualización de esta política

Esta política puede actualizarse. Toda modificación se publicará en esta página indicando la fecha y número de versión. Si los cambios afectan tus derechos, se te informará por los canales habituales.

## 14. Contacto y autoridad de control

Para consultas sobre esta política o para ejercer tus derechos, contacta al responsable del tratamiento a través de los canales habilitados por Achanvear (soporte@achanvear.com). Ante discrepancias, puedes acudir a la Autoridad Nacional de Protección de Datos Personales del Perú.

Última actualización: 25 de agosto de 2026.'
WHERE EXISTS (
    SELECT 1 FROM legal_documents d WHERE d.id = lv.document_id AND d.type = 'PRIVACY'
);

-- Enlazar la versión vigente (PUBLISHED) de cada documento legal
UPDATE legal_documents ld
SET current_version_id = (
        SELECT lv.id
        FROM legal_document_versions lv
        WHERE lv.document_id = ld.id
          AND lv.status = 'PUBLISHED'
        ORDER BY lv.published_at DESC NULLS LAST
        LIMIT 1
    )
WHERE ld.type IN ('TERMS', 'PRIVACY');