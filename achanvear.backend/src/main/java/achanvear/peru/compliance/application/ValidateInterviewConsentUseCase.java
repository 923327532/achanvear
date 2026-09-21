package achanvear.peru.compliance.application;

/**
 * Valida que exista el consentimiento específico vigente para poder iniciar
 * una entrevista. Sin consentimiento (o retirado) la entrevista queda bloqueada.
 */
public interface ValidateInterviewConsentUseCase {

    boolean hasValidConsent(String interviewId);

    void validateOrThrow(String interviewId);
}
