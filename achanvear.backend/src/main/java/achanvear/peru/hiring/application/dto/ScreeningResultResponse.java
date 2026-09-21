package achanvear.peru.hiring.application.dto;

import achanvear.peru.hiring.domain.model.HiringProcess;

public record ScreeningResultResponse(
        String hiringProcessId,
        String jobId,
        String candidateId,
        String currentStage,
        Double score,
        String summary
) {

    public static ScreeningResultResponse from(HiringProcess hiringProcess) {
        return new ScreeningResultResponse(
                hiringProcess.getId().toString(),
                hiringProcess.getJobId(),
                hiringProcess.getCandidateId(),
                hiringProcess.getStage().name(),
                null,
                null
        );
    }

    public static ScreeningResultResponse from(HiringProcess hiringProcess, Double score, String summary) {
        return new ScreeningResultResponse(
                hiringProcess.getId().toString(),
                hiringProcess.getJobId(),
                hiringProcess.getCandidateId(),
                hiringProcess.getStage().name(),
                score,
                summary
        );
    }
}
