package achanvear.peru.interview.web;

import achanvear.peru.hiring.application.AdvanceCandidateToTheoryInterviewUseCase;
import achanvear.peru.interview.application.*;
import achanvear.peru.interview.application.dto.ChooseSlotResponse;
import achanvear.peru.interview.application.dto.EnterInterviewResponse;
import achanvear.peru.interview.application.dto.InterviewScheduleResponse;
import achanvear.peru.interview.domain.model.Interview;
import achanvear.peru.interview.domain.model.InterviewId;
import achanvear.peru.interview.domain.model.InterviewSchedule;
import achanvear.peru.interview.domain.model.InterviewStatus;
import achanvear.peru.interview.domain.model.InterviewerProfile;
import achanvear.peru.interview.domain.model.InterviewerVoice;
import achanvear.peru.interview.domain.model.RecordingSession;
import achanvear.peru.interview.domain.repository.InterviewRepository;
import achanvear.peru.interview.domain.repository.InterviewScheduleRepository;
import achanvear.peru.jobs.domain.model.ApplicationStatus;
import achanvear.peru.jobs.domain.model.JobPost;
import achanvear.peru.jobs.domain.model.JobPostId;
import achanvear.peru.jobs.domain.repository.ApplicationRepository;
import achanvear.peru.jobs.domain.repository.JobPostRepository;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;
import java.util.UUID;

@RestController
@RequestMapping("/interviews/schedule")
@Validated
public class InterviewScheduleController {

    private final GenerateScheduleUseCase generateScheduleUseCase;
    private final ChooseSlotUseCase chooseSlotUseCase;
    private final EnterInterviewUseCase enterInterviewUseCase;
    private final InterviewScheduleRepository scheduleRepository;
    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final JobPostRepository jobPostRepository;
    private final AdvanceCandidateToTheoryInterviewUseCase advanceCandidateToTheoryInterviewUseCase;

    public InterviewScheduleController(
            GenerateScheduleUseCase generateScheduleUseCase,
            ChooseSlotUseCase chooseSlotUseCase,
            EnterInterviewUseCase enterInterviewUseCase,
            InterviewScheduleRepository scheduleRepository,
            InterviewRepository interviewRepository,
            ApplicationRepository applicationRepository,
            JobPostRepository jobPostRepository,
            AdvanceCandidateToTheoryInterviewUseCase advanceCandidateToTheoryInterviewUseCase
    ) {
        this.generateScheduleUseCase = generateScheduleUseCase;
        this.chooseSlotUseCase = chooseSlotUseCase;
        this.enterInterviewUseCase = enterInterviewUseCase;
        this.scheduleRepository = scheduleRepository;
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.jobPostRepository = jobPostRepository;
        this.advanceCandidateToTheoryInterviewUseCase = advanceCandidateToTheoryInterviewUseCase;
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<InterviewScheduleResponse>> generateSchedule(
            @Valid @RequestBody GenerateScheduleRequest request
    ) {
        InterviewScheduleResponse response = generateScheduleUseCase.execute(
                new GenerateScheduleCommand(
                        request.hiringProcessId(),
                        request.candidateId(),
                        request.jobId(),
                        request.interviewType(),
                        request.candidateName(),
                        request.jobTitle()
                )
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Schedule generated successfully"));
    }

    @PostMapping("/{scheduleId}/choose")
    public ResponseEntity<ApiResponse<ChooseSlotResponse>> chooseSlot(
            @PathVariable String scheduleId,
            @Valid @RequestBody ChooseSlotRequest request
    ) {
        try {
            ChooseSlotResponse response = chooseSlotUseCase.execute(
                    new ChooseSlotCommand(scheduleId, request.slotIndex())
            );
            return ResponseEntity.ok(ApiResponse.success(response, response.message()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{scheduleId}/choose")
    public ResponseEntity<ApiResponse<ChooseSlotResponse>> chooseSlotGet(
            @PathVariable String scheduleId,
            @RequestParam @Min(0) @Max(2) int slot
    ) {
        try {
            ChooseSlotResponse response = chooseSlotUseCase.execute(
                    new ChooseSlotCommand(scheduleId, slot)
            );
            return ResponseEntity.ok(ApiResponse.success(response, response.message()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{scheduleId}/choose-now")
    public ResponseEntity<ApiResponse<ChooseSlotResponse>> chooseNow(
            @PathVariable String scheduleId
    ) {
        try {
            InterviewSchedule schedule = scheduleRepository.findById(scheduleId)
                    .orElseThrow(() -> new IllegalArgumentException("Schedule not found: " + scheduleId));

            schedule.chooseNow();
            scheduleRepository.save(schedule);

            InterviewId interviewId = InterviewId.of(UUID.randomUUID().toString());
            InterviewerProfile profile = new InterviewerProfile("PROFILE_1", "Carlos Mendoza", "Formal y directo", InterviewerVoice.MALE1);

            Interview interview = Interview.restore(
                    interviewId,
                    schedule.getCandidateId(),
                    schedule.getJobId(),
                    schedule.getInterviewType(),
                    InterviewStatus.SCHEDULED,
                    0,
                    schedule.getChosenSlot() != null ? schedule.getChosenSlot().getDateTime() : null,
                    null,
                    profile,
                    null,
                    new RecordingSession(null, false),
                    new ArrayList<>(),
                    new ArrayList<>(),
                    new ArrayList<>()
            );
            interviewRepository.save(interview);

            ChooseSlotResponse response = new ChooseSlotResponse(
                    schedule.getId(),
                    schedule.getInterviewToken(),
                    schedule.getChosenSlot().getDateTime(),
                    "Entrevista activada para dar ahora.",
                    interviewId.toString()
            );
            return ResponseEntity.ok(ApiResponse.success(response, response.message()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/enter")
    public ResponseEntity<ApiResponse<EnterInterviewResponse>> enterInterview(
            @Valid @RequestBody EnterInterviewRequest request
    ) {
        try {
            EnterInterviewResponse response = enterInterviewUseCase.execute(
                    new EnterInterviewCommand(request.token())
            );
            return ResponseEntity.ok(ApiResponse.success(response, response.message()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            String msg = e.getMessage();
            if (msg.contains("ya fue utilizado")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(msg));
            }
            if (msg.contains("expirado") || msg.contains("descalificado")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(msg));
            }
            if (msg.contains("no es tu horario")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(msg));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(msg));
        }
    }

    @GetMapping("/my/{candidateId}")
    public ResponseEntity<ApiResponse<List<InterviewScheduleResponse>>> getMySchedules(
            @PathVariable String candidateId
    ) {
        repairMissingTheorySchedules(candidateId);
        List<InterviewSchedule> schedules = scheduleRepository.findByCandidateId(candidateId);
        List<InterviewScheduleResponse> result = schedules.stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(result, "Schedules fetched successfully"));
    }

    private InterviewScheduleResponse toResponse(InterviewSchedule schedule) {
        java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        List<InterviewScheduleResponse.SlotDto> slotDtos = schedule.getProposedSlots().stream()
                .map(slot -> new InterviewScheduleResponse.SlotDto(
                        schedule.getProposedSlots().indexOf(slot),
                        slot.getDateTime().format(fmt),
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

    private void repairMissingTheorySchedules(String candidateId) {
        UUID candidateUuid;
        try {
            candidateUuid = UUID.fromString(candidateId);
        } catch (IllegalArgumentException ignored) {
            return;
        }

        List<InterviewSchedule> currentSchedules = scheduleRepository.findByCandidateId(candidateId);
        var scheduledTheoryJobIds = currentSchedules.stream()
                .filter(schedule -> "THEORY".equals(schedule.getInterviewType().name()))
                .map(InterviewSchedule::getJobId)
                .collect(java.util.stream.Collectors.toSet());

        applicationRepository.findByCandidateUserId(candidateUuid).stream()
                .filter(application -> Boolean.TRUE.equals(application.getScreeningResult()))
                .filter(application -> application.getStatus() != ApplicationStatus.REJECTED)
                .filter(application -> !scheduledTheoryJobIds.contains(application.getJobPostId().toString()))
                .forEach(application -> {
                    var response = advanceCandidateToTheoryInterviewUseCase.execute(
                            application.getJobPostId().toString(),
                            candidateId,
                            application.getScreeningScore(),
                            application.getScreeningSummary()
                    );

                    application.registerScreeningResult(
                            application.getScreeningScore() != null ? application.getScreeningScore() : 0.0,
                            true,
                            true,
                            application.getScreeningSummary()
                    );
                    applicationRepository.save(application);

                    String jobTitle = jobPostRepository.findById(JobPostId.from(application.getJobPostId().toString()))
                            .map(JobPost::getTitle)
                            .orElse("Vacante");
                    generateScheduleUseCase.execute(new GenerateScheduleCommand(
                            response.hiringProcessId(),
                            candidateId,
                            application.getJobPostId().toString(),
                            "THEORY",
                            "Candidato",
                            jobTitle
                    ));
                    scheduledTheoryJobIds.add(application.getJobPostId().toString());
                });
    }

    public record GenerateScheduleRequest(
            @NotBlank String hiringProcessId,
            @NotBlank String candidateId,
            @NotBlank String jobId,
            @NotBlank String interviewType,
            @NotBlank String candidateName,
            @NotBlank String jobTitle
    ) {}

    public record ChooseSlotRequest(
            @Min(0) @Max(2) int slotIndex
    ) {}

    public record EnterInterviewRequest(
            @NotBlank String token
    ) {}
}
