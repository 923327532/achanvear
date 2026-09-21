package achanvear.peru.compliance.domain.model;

/**
 * Tipos de consentimiento registrados por la plataforma.
 * El consentimiento es explícito, informado y separado por documento o finalidad.
 */
public enum ConsentType {
    /** Aceptación de los Términos y Condiciones durante el registro. */
    REGISTRATION_TERMS,
    /** Aceptación de la Política de Privacidad durante el registro. */
    REGISTRATION_PRIVACY,
    /** Aceptación de que las respuestas y datos de la entrevista se traten para fines de evaluación. */
    INTERVIEW_DATA_PROCESSING,
    /** Aceptación de que la evaluación use servicios de inteligencia artificial. */
    INTERVIEW_AI_EVALUATION,
    /** Aceptación de la grabación de pantalla, audio o video de la sesión. */
    INTERVIEW_RECORDING
}
