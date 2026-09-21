package achanvear.peru.hiring.infrastructure.event;

import achanvear.peru.hiring.domain.event.ScreeningCompletedEvent;
import achanvear.peru.interview.application.GenerateScheduleCommand;
import achanvear.peru.interview.application.GenerateScheduleUseCase;
import achanvear.peru.jobs.domain.model.JobPost;
import achanvear.peru.jobs.domain.model.JobPostId;
import achanvear.peru.jobs.domain.model.NotificationTiming;
import achanvear.peru.jobs.domain.model.RecruitmentAutomationConfig;
import achanvear.peru.jobs.domain.repository.JobPostRepository;
import achanvear.peru.jobs.domain.repository.RecruitmentAutomationConfigRepository;
import achanvear.peru.notifications.infrastructure.external.BrevoEmailClient;
import achanvear.peru.shared.application.port.IdentityCandidateLookupPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Escucha ScreeningCompletedEvent:
 * - Si PASO: genera schedule con horarios + email (usando el titulo real del puesto)
 * - Si NO PASO: email informativo
 */
@Component
public class ScreeningNotificationHandler {

    private static final Logger log = LoggerFactory.getLogger(ScreeningNotificationHandler.class);

    private final BrevoEmailClient brevoEmailClient;
    private final IdentityCandidateLookupPort candidateLookupPort;
    private final GenerateScheduleUseCase generateScheduleUseCase;
    private final RecruitmentAutomationConfigRepository automationConfigRepository;
    private final JobPostRepository jobPostRepository;

    public ScreeningNotificationHandler(
            BrevoEmailClient brevoEmailClient,
            IdentityCandidateLookupPort candidateLookupPort,
            GenerateScheduleUseCase generateScheduleUseCase,
            RecruitmentAutomationConfigRepository automationConfigRepository,
            JobPostRepository jobPostRepository
    ) {
        this.brevoEmailClient = brevoEmailClient;
        this.candidateLookupPort = candidateLookupPort;
        this.generateScheduleUseCase = generateScheduleUseCase;
        this.automationConfigRepository = automationConfigRepository;
        this.jobPostRepository = jobPostRepository;
    }

    private String resolveJobTitle(String jobId) {
        try {
            return jobPostRepository.findById(JobPostId.from(jobId))
                    .map(JobPost::getTitle)
                    .orElse("Vacante");
        } catch (Exception e) {
            log.warn("No se pudo resolver el titulo del job post {}", jobId);
            return "Vacante";
        }
    }

    @EventListener
    public void handleScreeningCompleted(ScreeningCompletedEvent event) {
        try {
            UUID candidateUuid = UUID.fromString(event.candidateId());
            IdentityCandidateLookupPort.CandidateSummary candidate = candidateLookupPort.findById(candidateUuid);

            if (candidate == null || candidate.email() == null || candidate.email().isBlank()) {
                log.warn("No se pudo obtener email del candidato {}", event.candidateId());
                return;
            }

            String candidateName = candidate.fullName() != null ? candidate.fullName() : "Candidato";
            String jobTitle = resolveJobTitle(event.jobId());

            NotificationTiming timing = getNotificationTiming(event.jobId());

            if (timing == NotificationTiming.IMMEDIATE) {
                if (event.selected()) {
                    notifyPassed(event, candidateName, jobTitle);
                } else {
                    sendRejectedEmail(candidate.email(), candidateName, jobTitle, event);
                }
            } else {
                log.info("Screening completado. Notificacion diferida ({})", timing);
                if (event.selected()) {
                    generateScheduleUseCase.execute(new GenerateScheduleCommand(
                            event.hiringProcessId(),
                            event.candidateId(),
                            event.jobId(),
                            "THEORY",
                            candidateName,
                            jobTitle
                    ));
                }
                if (timing == NotificationTiming.AFTER_2_HOURS) {
                    if (!event.selected()) {
                        sendRejectedEmail(candidate.email(), candidateName, jobTitle, event);
                    }
                }
            }

        } catch (Exception e) {
            log.error("Error al notificar screening: {}", e.getMessage(), e);
        }
    }

    private void notifyPassed(ScreeningCompletedEvent event, String candidateName, String jobTitle) {
        generateScheduleUseCase.execute(new GenerateScheduleCommand(
                event.hiringProcessId(),
                event.candidateId(),
                event.jobId(),
                "THEORY",
                candidateName,
                jobTitle
        ));
        log.info("Schedule generado con titulo '{}' para candidato {}", jobTitle, event.candidateId());
    }

    private NotificationTiming getNotificationTiming(String jobId) {
        try {
            UUID jobPostUuid = UUID.fromString(jobId);
            return automationConfigRepository.findByJobPostId(jobPostUuid)
                    .map(RecruitmentAutomationConfig::getNotificationTiming)
                    .orElse(NotificationTiming.IMMEDIATE);
        } catch (Exception e) {
            return NotificationTiming.IMMEDIATE;
        }
    }

    private void sendRejectedEmail(String email, String name, String jobTitle, ScreeningCompletedEvent event) {
        String subject = "Resultados de tu postulacion a " + jobTitle + " - Achanvear";

        String htmlContent = """
                <html>
                  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                      <h2 style="color: #e65100;">Hola %s,</h2>
                      <p>Gracias por postular al puesto de <strong>%s</strong> en <strong>Achanvear</strong>.</p>
                      <p>Despues de evaluar tu perfil, hemos decidido no continuar con tu postulacion en esta oportunidad.</p>
                      <div style="background-color: #fff3e0; border-left: 4px solid #e65100; padding: 15px; margin: 20px 0; border-radius: 5px;">
                        <p style="margin: 0; color: #555;">Puntaje obtenido: <strong>%.1f/100</strong></p>
                      </div>
                      <p>No te desanimes, tu proxima oportunidad te espera en Achanvear.</p>
                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                      <p style="color: #888; font-size: 12px;">Equipo de Achanvear</p>
                    </div>
                  </body>
                </html>
                """.formatted(name, jobTitle, event.score());

        try {
            brevoEmailClient.sendEmail(email, subject, htmlContent);
            log.info("Correo de rechazo enviado a {} para {}", email, jobTitle);
        } catch (Exception e) {
            log.error("Error enviando correo de rechazo: {}", e.getMessage());
        }
    }
}