package achanvear.peru.interview.web;
import achanvear.peru.compliance.application.RecordInterviewConsentUseCase;
import achanvear.peru.compliance.application.command.RecordInterviewConsentCommand;
import achanvear.peru.compliance.application.dto.InterviewConsentResponse;
import achanvear.peru.interview.application.*;
import achanvear.peru.interview.application.command.AbortInterviewCommand;
import achanvear.peru.interview.application.command.CompleteInterviewCommand;
import achanvear.peru.interview.application.command.SaveRecordingKeyCommand;
import achanvear.peru.interview.application.command.StartInterviewSessionCommand;
import achanvear.peru.interview.application.command.SubmitAnswerCommand;
import achanvear.peru.interview.application.command.ReportViolationCommand;
import achanvear.peru.interview.application.command.AbortInterviewSessionCommand;
import achanvear.peru.interview.application.dto.InterviewReportResponse;
import achanvear.peru.interview.application.dto.InterviewSessionResponse;
import achanvear.peru.interview.application.dto.InterviewSummaryResponse;
import achanvear.peru.interview.application.dto.QuestionResponse;
import achanvear.peru.interview.web.request.AbortInterviewRequest;
import achanvear.peru.interview.web.request.ReportViolationRequest;
import achanvear.peru.interview.web.request.AbortInterviewSessionRequest;
import achanvear.peru.interview.web.request.SaveRecordingKeyRequest;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/interviews")
@Validated
public class InterviewController {

    private final ScheduleInterviewUseCase scheduleInterviewUseCase;
    private final StartInterviewSessionUseCase startInterviewSessionUseCase;
    private final SubmitAnswerUseCase submitAnswerUseCase;
    private final CompleteInterviewUseCase completeInterviewUseCase;
    private final ReportViolationUseCase reportViolationUseCase;
    private final AbortInterviewUseCase abortInterviewUseCase;
    private final AbortInterviewSessionUseCase abortInterviewSessionUseCase;
    private final SaveRecordingKeyUseCase saveRecordingKeyUseCase;
    private final GetInterviewReportUseCase getInterviewReportUseCase;
    private final GetMyInterviewsUseCase getMyInterviewsUseCase;
    private final RecordInterviewConsentUseCase recordInterviewConsentUseCase;

    public InterviewController(
            ScheduleInterviewUseCase scheduleInterviewUseCase,
            StartInterviewSessionUseCase startInterviewSessionUseCase,
            @Qualifier("submitAnswerUseCase") SubmitAnswerUseCase submitAnswerUseCase,
            CompleteInterviewUseCase completeInterviewUseCase,
            ReportViolationUseCase reportViolationUseCase,
            AbortInterviewUseCase abortInterviewUseCase,
            AbortInterviewSessionUseCase abortInterviewSessionUseCase,
            SaveRecordingKeyUseCase saveRecordingKeyUseCase,
            GetInterviewReportUseCase getInterviewReportUseCase,
            GetMyInterviewsUseCase getMyInterviewsUseCase,
            RecordInterviewConsentUseCase recordInterviewConsentUseCase
    ) {
        this.scheduleInterviewUseCase = scheduleInterviewUseCase;
        this.startInterviewSessionUseCase = startInterviewSessionUseCase;
        this.submitAnswerUseCase = submitAnswerUseCase;
        this.completeInterviewUseCase = completeInterviewUseCase;
        this.reportViolationUseCase = reportViolationUseCase;
        this.abortInterviewUseCase = abortInterviewUseCase;
        this.abortInterviewSessionUseCase = abortInterviewSessionUseCase;
        this.saveRecordingKeyUseCase = saveRecordingKeyUseCase;
        this.getInterviewReportUseCase = getInterviewReportUseCase;
        this.getMyInterviewsUseCase = getMyInterviewsUseCase;
        this.recordInterviewConsentUseCase = recordInterviewConsentUseCase;
    }

    /**
     * Registra el consentimiento específico previo a la entrevista.
     * Sin esta aceptación no se puede iniciar la sesión (ni WebSocket, ni Python).
     */
    @PostMapping("/{interviewId}/consent")
    public ResponseEntity<ApiResponse<InterviewConsentResponse>> recordConsent(
            @PathVariable String interviewId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody RecordInterviewConsentRequest request
    ) {
        InterviewConsentResponse response = recordInterviewConsentUseCase.record(
                new RecordInterviewConsentCommand(
                        interviewId,
                        authenticatedUser.getUserId().toString(),
                        request.acceptDataProcessing(),
                        request.acceptAiEvaluation(),
                        request.acceptRecording()
                )
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Interview consent recorded successfully"));
    }

    @PostMapping("/schedule")
    public ResponseEntity<ApiResponse<InterviewSessionResponse>> scheduleInterview(
            @Valid @RequestBody ScheduleInterviewRequest request
    ) {
        InterviewSessionResponse response = scheduleInterviewUseCase.execute(
                new ScheduleInterviewCommand(
                        request.hiringProcessId(),
                        request.candidateId(),
                        request.interviewType(),
                        request.theoryScore(),
                        request.conciseAnswers(),
                        request.leadershipProfile(),
                        request.interviewerProfileCode()
                )
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Interview scheduled successfully"));
    }

    @PostMapping("/{interviewId}/start")
    public ResponseEntity<ApiResponse<InterviewSessionResponse>> startInterview(
            @PathVariable String interviewId
    ) {
        InterviewSessionResponse response = startInterviewSessionUseCase.execute(
                new StartInterviewSessionCommand(interviewId)
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Interview session started"));
    }

    @PostMapping("/{interviewId}/answers")
    public ResponseEntity<ApiResponse<QuestionResponse>> submitAnswer(
            @PathVariable String interviewId,
            @Valid @RequestBody SubmitAnswerRequest request
    ) {
        QuestionResponse response = submitAnswerUseCase.execute(
                new SubmitAnswerCommand(
                        interviewId,
                        request.questionId(),
                        request.answerContent()
                )
        ).nextQuestion();

        return ResponseEntity.ok(ApiResponse.success(response, "Answer submitted successfully"));
    }

    @PostMapping("/{interviewId}/complete")
    public ResponseEntity<ApiResponse<InterviewReportResponse>> completeInterview(
            @PathVariable String interviewId
    ) {
        InterviewReportResponse response = completeInterviewUseCase.execute(
                new CompleteInterviewCommand(interviewId)
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Interview completed successfully"));
    }

    @PostMapping("/{interviewId}/violations")
    public ResponseEntity<ApiResponse<Void>> reportViolation(
            @PathVariable String interviewId,
            @Valid @RequestBody ReportViolationRequest request
    ) {
        reportViolationUseCase.execute(new ReportViolationCommand(
                interviewId,
                request.type(),
                request.count(),
                request.timestamp()
        ));

        return ResponseEntity.ok(
                ApiResponse.success(null, "Violation reported successfully")
        );
    }

    @PostMapping("/{interviewId}/abort")
    public ResponseEntity<ApiResponse<Void>> abortInterview(
            @PathVariable String interviewId,
            @Valid @RequestBody AbortInterviewRequest request
    ) {
        abortInterviewUseCase.execute(new AbortInterviewCommand(
                interviewId,
                request.reason()
        ));

        return ResponseEntity.ok(
                ApiResponse.success(null, "Interview aborted successfully")
        );
    }

    @PostMapping("/{interviewId}/recording")
    public ResponseEntity<ApiResponse<Void>> saveRecordingKey(
            @PathVariable String interviewId,
            @Valid @RequestBody SaveRecordingKeyRequest request
    ) {
        saveRecordingKeyUseCase.execute(
                new SaveRecordingKeyCommand(interviewId, request.fileKey())
        );

        return ResponseEntity.ok(
                ApiResponse.success(null, "Recording key saved successfully")
        );
    }

    @GetMapping("/{interviewId}/report")
    public ResponseEntity<ApiResponse<InterviewReportResponse>> getInterviewReport(
            @PathVariable String interviewId
    ) {
        InterviewReportResponse response = getInterviewReportUseCase.execute(interviewId);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Interview report fetched successfully")
        );
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<InterviewSummaryResponse>>> getMyInterviews(
            @RequestParam String candidateId
    ) {
        List<InterviewSummaryResponse> response = getMyInterviewsUseCase.getMyInterviews(candidateId);
        return ResponseEntity.ok(
                ApiResponse.success(response, "Interviews fetched successfully")
        );
    }

    public record ScheduleInterviewRequest(
            @NotBlank String hiringProcessId,
            @NotBlank String candidateId,
            @NotBlank String interviewType,
            Integer theoryScore,
            Boolean conciseAnswers,
            Boolean leadershipProfile,
            String interviewerProfileCode
    ) {
    }

    public record SubmitAnswerRequest(
            @NotBlank String questionId,
            @NotBlank String answerContent
    ) {
    }

    public record RecordInterviewConsentRequest(
            boolean acceptDataProcessing,
            boolean acceptAiEvaluation,
            boolean acceptRecording
    ) {
    }
}