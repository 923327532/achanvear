package achanvear.peru.hiring.infrastructure.event;

import achanvear.peru.hiring.domain.event.TheoryInterviewPassedEvent;
import achanvear.peru.interview.application.GenerateScheduleCommand;
import achanvear.peru.interview.application.GenerateScheduleUseCase;
import achanvear.peru.shared.application.port.IdentityCandidateLookupPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Escucha TheoryInterviewPassedEvent y genera el schedule
 * para la entrevista tecnica con 3 horarios propuestos.
 */
@Component
public class TheoryInterviewPassedHandler {

    private static final Logger log = LoggerFactory.getLogger(TheoryInterviewPassedHandler.class);

    private final IdentityCandidateLookupPort candidateLookupPort;
    private final GenerateScheduleUseCase generateScheduleUseCase;
    private final achanvear.peru.payments.application.CompanyAiAccess aiAccess;

    public TheoryInterviewPassedHandler(
            IdentityCandidateLookupPort candidateLookupPort,
            GenerateScheduleUseCase generateScheduleUseCase,
            achanvear.peru.payments.application.CompanyAiAccess aiAccess
    ) {
        this.candidateLookupPort = candidateLookupPort;
        this.generateScheduleUseCase = generateScheduleUseCase;
        this.aiAccess = aiAccess;
    }

    @EventListener
    public void handleTheoryInterviewPassed(TheoryInterviewPassedEvent event) {
        // A subscription may expire during the interview. Preserve its report and skip new scheduling.
        try { aiAccess.requireJob(event.jobId()); }
        catch (achanvear.peru.shared.exception.ForbiddenOperationException expired) { return; }
        try {
            UUID candidateUuid = UUID.fromString(event.candidateId());
            IdentityCandidateLookupPort.CandidateSummary candidate = candidateLookupPort.findById(candidateUuid);

            if (candidate == null) {
                log.warn("No se pudo obtener datos del candidato {} para generar schedule tecnico", event.candidateId());
                return;
            }

            String candidateName = candidate.fullName() != null ? candidate.fullName() : "Candidato";

            // Generar schedule con 3 horarios para entrevista tecnica
            generateScheduleUseCase.execute(new GenerateScheduleCommand(
                    event.hiringProcessId(),
                    event.candidateId(),
                    event.jobId(),
                    "TECHNICAL",
                    candidateName,
                    event.jobId()
            ));

            log.info("Schedule de entrevista tecnica generado para candidato {} en proceso {}",
                    event.candidateId(), event.hiringProcessId());

        } catch (Exception e) {
            log.error("Error al generar schedule tecnico para candidato {}: {}", event.candidateId(), e.getMessage(), e);
        }
    }
}
