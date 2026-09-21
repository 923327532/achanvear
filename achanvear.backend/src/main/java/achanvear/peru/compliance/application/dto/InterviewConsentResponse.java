package achanvear.peru.compliance.application.dto;

import java.util.List;

public record InterviewConsentResponse(
        String interviewId,
        List<String> acceptedTypes,
        boolean readyToStart
) {
}
