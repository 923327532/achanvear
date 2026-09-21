package achanvear.peru.compliance.application;

import achanvear.peru.compliance.application.command.RecordInterviewConsentCommand;
import achanvear.peru.compliance.application.dto.InterviewConsentResponse;

/**
 * Registra el consentimiento específico previo a una entrevista
 * (tratamiento de datos, uso de IA y grabación cuando corresponda).
 */
public interface RecordInterviewConsentUseCase {

    InterviewConsentResponse record(RecordInterviewConsentCommand command);
}
