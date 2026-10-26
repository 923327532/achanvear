package achanvear.peru.interview.web;

import achanvear.peru.interview.application.impl.InterviewAttendanceService;
import achanvear.peru.compliance.application.ValidateInterviewConsentUseCase;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/interviews")
public class InterviewAttendanceController {
    private final InterviewAttendanceService attendance;
    private final ValidateInterviewConsentUseCase consent;
    public InterviewAttendanceController(InterviewAttendanceService attendance, ValidateInterviewConsentUseCase consent) {
        this.attendance = attendance; this.consent = consent;
    }
    @PostMapping("/{interviewId}/attendance")
    @PreAuthorize("@interviewAccess.owns(#interviewId, authentication)")
    public ApiResponse<Void> beginPractical(@PathVariable String interviewId) {
        consent.validateOrThrow(interviewId);
        attendance.beginPractical(interviewId);
        return ApiResponse.success(null, "Ingreso registrado");
    }
}
