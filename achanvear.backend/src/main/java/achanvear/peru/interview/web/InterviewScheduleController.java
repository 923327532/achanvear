package achanvear.peru.interview.web;

import achanvear.peru.interview.application.*;
import achanvear.peru.interview.application.dto.ChooseSlotResponse;
import achanvear.peru.interview.application.dto.EnterInterviewResponse;
import achanvear.peru.interview.application.dto.InterviewScheduleResponse;
import achanvear.peru.interview.domain.model.InterviewSchedule;
import achanvear.peru.interview.domain.repository.InterviewScheduleRepository;
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

@RestController
@RequestMapping("/interviews/schedule")
@Validated
public class InterviewScheduleController {

    private final GenerateScheduleUseCase generateScheduleUseCase;
    private final ChooseSlotUseCase chooseSlotUseCase;
    private final EnterInterviewUseCase enterInterviewUseCase;
    private final InterviewScheduleRepository scheduleRepository;

    public InterviewScheduleController(
            GenerateScheduleUseCase generateScheduleUseCase,
            ChooseSlotUseCase chooseSlotUseCase,
            EnterInterviewUseCase enterInterviewUseCase,
            InterviewScheduleRepository scheduleRepository
    ) {
        this.generateScheduleUseCase = generateScheduleUseCase;
        this.chooseSlotUseCase = chooseSlotUseCase;
        this.enterInterviewUseCase = enterInterviewUseCase;
        this.scheduleRepository = scheduleRepository;
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