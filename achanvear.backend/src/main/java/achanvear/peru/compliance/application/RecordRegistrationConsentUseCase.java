package achanvear.peru.compliance.application;

import achanvear.peru.compliance.application.command.RecordRegistrationConsentCommand;

/**
 * Registra las evidencias de aceptación de Términos y Condiciones y de
 * Política de Privacidad durante el registro. El usuario debe aceptar cada
 * documento de forma independiente.
 */
public interface RecordRegistrationConsentUseCase {

    void record(RecordRegistrationConsentCommand command);
}
