package achanvear.peru.hiring.domain.model;

import java.util.Objects;

public class CandidateScreening {

    private final String candidateId;
    private final String candidateName;
    private ScreeningResult screeningResult;

    public CandidateScreening(String candidateId, String candidateName) {
        this.candidateId = Objects.requireNonNull(candidateId, "Candidate id cannot be null");
        this.candidateName = Objects.requireNonNull(candidateName, "Candidate name cannot be null");
    }

    public void assignResult(ScreeningResult screeningResult) {
        this.screeningResult = Objects.requireNonNull(screeningResult, "Screening result cannot be null");
    }

    public String getCandidateId() {
        return candidateId;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public ScreeningResult getScreeningResult() {
        return screeningResult;
    }

    public boolean hasResult() {
        return screeningResult != null;
    }
}