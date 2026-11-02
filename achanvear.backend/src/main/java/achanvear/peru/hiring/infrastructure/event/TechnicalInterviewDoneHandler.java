package achanvear.peru.hiring.infrastructure.event;

import achanvear.peru.hiring.domain.event.TechnicalInterviewDoneEvent;
import achanvear.peru.notifications.infrastructure.external.BrevoEmailClient;
import achanvear.peru.shared.application.port.IdentityCandidateLookupPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Escucha TechnicalInterviewDoneEvent y notifica a la empresa
 * con los resultados del candidato que completo todo el proceso.
 */
@Component
public class TechnicalInterviewDoneHandler {

    private static final Logger log = LoggerFactory.getLogger(TechnicalInterviewDoneHandler.class);

    private final BrevoEmailClient brevoEmailClient;
    private final IdentityCandidateLookupPort candidateLookupPort;

    private final achanvear.peru.jobs.domain.repository.JobPostRepository jobs;
    private final achanvear.peru.shared.application.port.CompanyLookupPort companies;

    public TechnicalInterviewDoneHandler(
            BrevoEmailClient brevoEmailClient,
            IdentityCandidateLookupPort candidateLookupPort,
            achanvear.peru.jobs.domain.repository.JobPostRepository jobs,
            achanvear.peru.shared.application.port.CompanyLookupPort companies
    ) {
        this.brevoEmailClient = brevoEmailClient;
        this.candidateLookupPort = candidateLookupPort;
        this.jobs = jobs; this.companies = companies;
    }

    @EventListener
    public void handleTechnicalInterviewDone(TechnicalInterviewDoneEvent event) {
        try {
            UUID candidateUuid = UUID.fromString(event.candidateId());
            IdentityCandidateLookupPort.CandidateSummary candidate = candidateLookupPort.findById(candidateUuid);

            if (candidate == null || candidate.email() == null || candidate.email().isBlank()) {
                log.warn("No se pudo obtener datos del candidato {} para notificar a la empresa", event.candidateId());
                return;
            }

            String candidateName = candidate.fullName() != null ? candidate.fullName() : "Candidato";

            var owner = jobs.findById(achanvear.peru.jobs.domain.model.JobPostId.from(event.jobId()))
                    .flatMap(job -> companies.findById(job.getCompanyId()))
                    .map(company -> candidateLookupPort.findById(company.ownerUserId()));
            if (owner.isEmpty() || owner.get().email() == null || owner.get().email().isBlank()) return;
            String companyEmail = owner.get().email();
            candidateName = org.springframework.web.util.HtmlUtils.htmlEscape(candidateName);
            if (event.approved()) {
                sendApprovedToCompany(candidate.email(), candidateName, event, companyEmail);
            } else {
                sendRejectedToCompany(candidate.email(), candidateName, event, companyEmail);
            }

        } catch (Exception e) {
            log.error("Error al notificar resultado de entrevista tecnica para candidato {}: {}", 
                      event.candidateId(), e.getMessage(), e);
        }
    }

    private void sendApprovedToCompany(String candidateEmail, String candidateName, TechnicalInterviewDoneEvent event, String companyEmail) {
        String subject = "Candidato aprobado - " + candidateName + " para " + event.jobId() + " - Achanvear";

        String htmlContent = """
                <html>
                  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                      <h2 style="color: #2e7d32;">Candidato aprobado en el proceso de seleccion</h2>
                      <p>El candidato <strong>%s</strong> ha completado exitosamente todas las etapas del proceso de seleccion para el puesto de <strong>%s</strong>.</p>
                      <div style="background-color: #e8f5e9; border-left: 4px solid #2e7d32; padding: 15px; margin: 20px 0; border-radius: 5px;">
                        <h3 style="color: #2e7d32; margin-top: 0;">Resultados finales</h3>
                        <p><strong>Puntaje en entrevista tecnica:</strong> %d/100</p>
                        <p><strong>Estado:</strong> Aprobado</p>
                        <p><strong>Email del candidato:</strong> %s</p>
                      </div>
                      <p>Puedes contactar al candidato directamente para coordinar los siguientes pasos y ajustar detalles de la contratacion.</p>
                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                      <p style="color: #888; font-size: 12px;">Equipo de Achanvear</p>
                    </div>
                  </body>
                </html>
                """.formatted(candidateName, event.jobId(), event.score(), candidateEmail);

        try {
            brevoEmailClient.sendEmail(companyEmail, subject, htmlContent);
            log.info("Notificacion de candidato aprobado enviada para {} en proceso {}", 
                     candidateEmail, event.hiringProcessId());
        } catch (Exception e) {
            log.error("Error enviando notificacion de candidato aprobado: {}", e.getMessage());
        }
    }

    private void sendRejectedToCompany(String candidateEmail, String candidateName, TechnicalInterviewDoneEvent event, String companyEmail) {
        String subject = "Candidato no aprobado - " + candidateName + " para " + event.jobId() + " - Achanvear";

        String htmlContent = """
                <html>
                  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                      <h2 style="color: #e65100;">Resultado de evaluacion tecnica</h2>
                      <p>El candidato <strong>%s</strong> ha completado la entrevista tecnica para el puesto de <strong>%s</strong> pero no alcanzo el puntaje minimo requerido.</p>
                      <div style="background-color: #fff3e0; border-left: 4px solid #e65100; padding: 15px; margin: 20px 0; border-radius: 5px;">
                        <h3 style="color: #e65100; margin-top: 0;">Resultados</h3>
                        <p><strong>Puntaje en entrevista tecnica:</strong> %d/100</p>
                        <p><strong>Estado:</strong> No aprobado</p>
                      </div>
                      <p>El proceso de seleccion continua con los demas candidatos.</p>
                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                      <p style="color: #888; font-size: 12px;">Equipo de Achanvear</p>
                    </div>
                  </body>
                </html>
                """.formatted(candidateName, event.jobId(), event.score());

        try {
            brevoEmailClient.sendEmail(companyEmail, subject, htmlContent);
            log.info("Notificacion de candidato no aprobado enviada para {} en proceso {}", 
                     candidateEmail, event.hiringProcessId());
        } catch (Exception e) {
            log.error("Error enviando notificacion de candidato no aprobado: {}", e.getMessage());
        }
    }
}
