package achanvear.peru.hiring.web;

import achanvear.peru.hiring.application.EvaluateTheoryResultUseCase;
import achanvear.peru.hiring.application.GenerateFinalReportUseCase;
import achanvear.peru.hiring.application.StartScreeningUseCase;
import achanvear.peru.hiring.application.command.EvaluateTheoryResultCommand;
import achanvear.peru.hiring.application.command.StartScreeningCommand;
import achanvear.peru.hiring.application.dto.HiringReportResponse;
import achanvear.peru.hiring.application.dto.ScreeningResultResponse;
import achanvear.peru.hiring.web.request.EvaluateTheoryResultRequest;
import achanvear.peru.hiring.web.request.StartScreeningRequest;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hiring")
public class HiringController {

    private final StartScreeningUseCase startScreeningUseCase;
    private final EvaluateTheoryResultUseCase evaluateTheoryResultUseCase;
    private final GenerateFinalReportUseCase generateFinalReportUseCase;

    public HiringController(
            StartScreeningUseCase startScreeningUseCase,
            EvaluateTheoryResultUseCase evaluateTheoryResultUseCase,
            GenerateFinalReportUseCase generateFinalReportUseCase
    ) {
        this.startScreeningUseCase = startScreeningUseCase;
        this.evaluateTheoryResultUseCase = evaluateTheoryResultUseCase;
        this.generateFinalReportUseCase = generateFinalReportUseCase;
    }

    @PostMapping("/screening/start")
    public ResponseEntity<ApiResponse<ScreeningResultResponse>> startScreening(
            @Valid @RequestBody StartScreeningRequest request
    ) {
        StartScreeningCommand command = new StartScreeningCommand(
                request.jobId(),
                request.candidateId(),
                request.candidateName(),
                request.jobTitle(),
                request.jobDescription(),
                request.requiredSkills(),
                request.experienceMin(),
                request.career(),
                request.candidateSkills(),
                request.candidateExperienceYears(),
                request.candidateCareer(),
                request.candidateBiography(),
                request.candidateCvUrl(),
                request.candidateCvData(),
                request.coverLetter()
        );

        ScreeningResultResponse response = startScreeningUseCase.execute(command);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Screening started successfully"));
    }

    @PostMapping("/theory/evaluate")
    public ResponseEntity<ApiResponse<ScreeningResultResponse>> evaluateTheoryResult(
            @Valid @RequestBody EvaluateTheoryResultRequest request
    ) {
        EvaluateTheoryResultCommand command = new EvaluateTheoryResultCommand(
                request.hiringProcessId(),
                request.theoryScore()
        );

        ScreeningResultResponse response = evaluateTheoryResultUseCase.execute(command);

        return ResponseEntity.ok(ApiResponse.success(response, "Theory interview evaluated successfully"));
    }

    @GetMapping("/report/{jobId}")
    public ResponseEntity<ApiResponse<HiringReportResponse>> generateFinalReport(
            @PathVariable String jobId
    ) {
        HiringReportResponse response = generateFinalReportUseCase.execute(jobId);

        return ResponseEntity.ok(ApiResponse.success(response, "Hiring report generated successfully"));
    }
}
