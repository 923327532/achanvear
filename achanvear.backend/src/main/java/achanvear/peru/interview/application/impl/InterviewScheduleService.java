package achanvear.peru.interview.application.impl;

import achanvear.peru.interview.application.*;
import achanvear.peru.interview.application.dto.*;
import achanvear.peru.interview.domain.model.*;
import achanvear.peru.interview.domain.repository.InterviewRepository;
import achanvear.peru.interview.domain.repository.InterviewScheduleRepository;
import achanvear.peru.notifications.infrastructure.external.BrevoEmailClient;
import achanvear.peru.shared.application.port.IdentityCandidateLookupPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class InterviewScheduleService implements
        GenerateScheduleUseCase,
        ChooseSlotUseCase,
        EnterInterviewUseCase {

    private static final Logger log = LoggerFactory.getLogger(InterviewScheduleService.class);
    private static final DateTimeFormatter SLOT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final InterviewScheduleRepository scheduleRepository;
    private final InterviewRepository interviewRepository;
    private final BrevoEmailClient brevoEmailClient;
    private final IdentityCandidateLookupPort candidateLookupPort;
    private final String frontendBaseUrl;

    public InterviewScheduleService(
            InterviewScheduleRepository scheduleRepository,
            InterviewRepository interviewRepository,
            BrevoEmailClient brevoEmailClient,
            IdentityCandidateLookupPort candidateLookupPort,
            @Value("${app.frontend-url:http://localhost:3000}") String frontendBaseUrl
    ) {
        this.scheduleRepository = scheduleRepository;
        this.interviewRepository = interviewRepository;
        this.brevoEmailClient = brevoEmailClient;
        this.candidateLookupPort = candidateLookupPort;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Override
    public InterviewScheduleResponse execute(GenerateScheduleCommand command) {
        // Verificar que no exista ya un schedule para este proceso y tipo
        var existing = scheduleRepository.findByHiringProcessIdAndType(
                command.hiringProcessId(), command.interviewType());
        if (existing.isPresent()) {
            InterviewSchedule existingSchedule = existing.get();
            return toResponse(existingSchedule);
        }

        // Generar 3 horarios: 1 prueba rapida + 2 originales
        LocalDateTime now = LocalDateTime.now();
        List<InterviewSlot> slots = List.of(
                new InterviewSlot(
                        now.plusMinutes(5),
                        InterviewSlot.SlotStatus.AVAILABLE
                ),
                new InterviewSlot(
                        now.plusHours(24).withHour(9).withMinute(0).withSecond(0).withNano(0),
                        InterviewSlot.SlotStatus.AVAILABLE
                ),
                new InterviewSlot(
                        now.plusHours(48).withHour(10).withMinute(0).withSecond(0).withNano(0),
                        InterviewSlot.SlotStatus.AVAILABLE
                )
        );

        InterviewSchedule schedule = new InterviewSchedule(
                UUID.randomUUID().toString(),
                command.hiringProcessId(),
                command.candidateId(),
                command.jobId(),
                InterviewType.valueOf(command.interviewType()),
                slots
        );

        scheduleRepository.save(schedule);

        // Enviar email con los 3 horarios
        sendScheduleEmail(command, schedule.getId(), slots);

        log.info("Schedule generado para proceso {} tipo {}", command.hiringProcessId(), command.interviewType());
        return toResponse(schedule);
    }

    @Override
    public ChooseSlotResponse execute(ChooseSlotCommand command) {
        InterviewSchedule schedule = scheduleRepository.findById(command.scheduleId())
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found: " + command.scheduleId()));

        schedule.chooseSlot(command.slotIndex());
        scheduleRepository.save(schedule);

        // Crear la entidad Interview para que aparezca en la lista del candidato
        InterviewId interviewId = InterviewId.of(UUID.randomUUID().toString());
        InterviewerProfile profile = new InterviewerProfile("PROFILE_1", "Carlos Mendoza", "Formal y directo", InterviewerVoice.MALE1);
        
        Interview interview = Interview.restore(
                interviewId,
                schedule.getCandidateId(),
                schedule.getJobId(),
                schedule.getInterviewType(),
                InterviewStatus.SCHEDULED,
                command.slotIndex(),
                null,
                profile,
                null,
                new RecordingSession(null, false),
                new ArrayList<>(),
                new ArrayList<>(),
                new ArrayList<>()
        );
        interviewRepository.save(interview);

        log.info("Slot {} elegido para schedule {} - Interview {} creada", command.slotIndex(), command.scheduleId(), interviewId);
        return new ChooseSlotResponse(
                schedule.getId(),
                schedule.getInterviewToken(),
                schedule.getChosenSlot().getDateTime(),
                "Horario elegido correctamente. Usa tu token para acceder.",
                interviewId.toString()
        );
    }

    @Override
    public EnterInterviewResponse execute(EnterInterviewCommand command) {
        InterviewSchedule schedule = scheduleRepository.findByToken(command.token())
                .orElseThrow(() -> new IllegalArgumentException("Token no valido: " + command.token()));

        // Validar ventana de tiempo (5 min antes, 5 tolerancia)
        schedule.validateEntry(LocalDateTime.now());
        scheduleRepository.save(schedule);

        log.info("Ingreso autorizado para schedule {} con token {}", schedule.getId(), command.token());
        return new EnterInterviewResponse(
                schedule.getId(),
                schedule.getHiringProcessId(),
                schedule.getCandidateId(),
                schedule.getInterviewType().name(),
                "Acceso autorizado. Puedes iniciar la entrevista."
        );
    }

    private void sendScheduleEmail(GenerateScheduleCommand command, String scheduleId, List<InterviewSlot> slots) {
        try {
            UUID candidateUuid = UUID.fromString(command.candidateId());
            IdentityCandidateLookupPort.CandidateSummary candidate = candidateLookupPort.findById(candidateUuid);

            if (candidate == null || candidate.email() == null || candidate.email().isBlank()) {
                log.warn("No se pudo obtener email del candidato {} para enviar horarios", command.candidateId());
                return;
            }

            String candidateName = command.candidateName();
            String interviewTypeLabel = command.interviewType().equals("THEORY") ? "Teorica" : "Practica";

            String subject = "Agenda tu entrevista " + interviewTypeLabel + " - " + command.jobTitle() + " - Achanvear";

            // Generar slots HTML dinamicamente
            StringBuilder slotsHtml = new StringBuilder();
            for (int i = 0; i < slots.size(); i++) {
                String slotLabel = slots.get(i).getDateTime().format(SLOT_FORMATTER);
                String slotUrl = buildSlotUrl(scheduleId, i);
                slotsHtml.append("""
                    <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                      <p style="margin: 0; font-size: 16px;"><strong>Opcion %d:</strong> %s</p>
                      <a href="%s" style="display: inline-block; margin-top: 8px; padding: 8px 20px; background-color: #1565c0; color: white; text-decoration: none; border-radius: 5px;">Elegir este horario</a>
                    </div>
                    """.formatted(i + 1, slotLabel, slotUrl));
            }

            String htmlContent = """
                    <html>
                      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                          <h2 style="color: #1565c0;">Hola %s!</h2>
                          <p>Has sido preseleccionado para la <strong>entrevista %s</strong> para el puesto de <strong>%s</strong> en <strong>Achanvear</strong>.</p>
                          <p>Elige uno de los siguientes horarios para tu entrevista. Solo puedes elegir uno y no se puede cambiar despues.</p>
                          <div style="margin: 20px 0;">
                            %s
                          </div>
                          <p style="color: #888; font-size: 13px;"><strong>Importante:</strong> Solo puedes elegir un horario. Una vez confirmado, no se puede cambiar. Recibiras un enlace de acceso unico minutos antes de tu entrevista.</p>
                          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                          <p style="color: #888; font-size: 12px;">Equipo de Achanvear</p>
                        </div>
                      </body>
                    </html>
                    """.formatted(
                    candidateName,
                    interviewTypeLabel,
                    command.jobTitle(),
                    slotsHtml.toString()
            );

            brevoEmailClient.sendEmail(candidate.email(), subject, htmlContent);
            log.info("Email con horarios enviado a {} para schedule {}", candidate.email(), scheduleId);

        } catch (Exception e) {
            log.error("Error al enviar email con horarios: {}", e.getMessage(), e);
        }
    }

    private String buildSlotUrl(String scheduleId, int slotIndex) {
        // Redirige al frontend, que luego llama a la API
        return frontendBaseUrl + "/freelancer/interviews/choose-slot?id=" + scheduleId + "&slot=" + slotIndex;
    }

    private InterviewScheduleResponse toResponse(InterviewSchedule schedule) {
        List<InterviewScheduleResponse.SlotDto> slotDtos = schedule.getProposedSlots().stream()
                .map(slot -> new InterviewScheduleResponse.SlotDto(
                        schedule.getProposedSlots().indexOf(slot),
                        slot.getDateTime().format(SLOT_FORMATTER),
                        slot.getStatus().name()
                ))
                .toList();

        return new InterviewScheduleResponse(
                schedule.getId(),
                schedule.getHiringProcessId(),
                schedule.getCandidateId(),
                schedule.getJobId(),
                schedule.getInterviewType().name(),
                slotDtos,
                schedule.getStatus().name()
        );
    }
}