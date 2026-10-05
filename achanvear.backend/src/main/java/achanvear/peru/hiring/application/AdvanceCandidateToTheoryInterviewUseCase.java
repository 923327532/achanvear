package achanvear.peru.hiring.application;

import achanvear.peru.hiring.application.dto.ScreeningResultResponse;

public interface AdvanceCandidateToTheoryInterviewUseCase {

    ScreeningResultResponse execute(String jobId, String candidateId, Double screeningScore, String summary);
}
