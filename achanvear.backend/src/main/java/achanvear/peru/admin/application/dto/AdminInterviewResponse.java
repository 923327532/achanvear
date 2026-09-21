package achanvear.peru.admin.application.dto;

import achanvear.peru.interview.domain.model.Interview;

public record AdminInterviewResponse(
        String id,
        String candidateId,
        String jobId,
        String interviewType,
        String status,
        Integer score,
        String result,
        int totalQuestions,
        int totalAnswers,
        int totalViolations,
        String recordingFileKey,
        boolean usedAi
) {

    public static AdminInterviewResponse from(Interview interview) {
        Integer scoreValue = interview.getScore() != null ? interview.getScore().getValue() : null;
        String result = scoreValue != null ? (interview.getScore().isApproved(60) ? "APPROVED" : "REJECTED") : null;
        return new AdminInterviewResponse(
                interview.getId().toString(),
                interview.getCandidateId(),
                interview.getJobId(),
                interview.getType().name(),
                interview.getStatus().name(),
                scoreValue,
                result,
                interview.getQuestions().size(),
                interview.getAnswers().size(),
                interview.getViolations().size(),
                interview.getRecordingSession() != null ? interview.getRecordingSession().getFileKey() : null,
                interview.getPythonSessionId() != null && !interview.getPythonSessionId().isBlank()
        );
    }
}
