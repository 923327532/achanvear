package achanvear.peru.hiring.domain.model;
import java.util.Objects;

public class ScreeningResult {

    private final String candidateId;
    private final boolean selected;
    private final Double score;
    private final String summary;

    public ScreeningResult(String candidateId, boolean selected, Double score, String summary) {
        this.candidateId = Objects.requireNonNull(candidateId, "Candidate id cannot be null");
        this.selected = selected;
        this.score = score;
        this.summary = summary;
    }

    public String getCandidateId() {
        return candidateId;
    }

    public boolean isSelected() {
        return selected;
    }

    public Double getScore() {
        return score;
    }

    public String getSummary() {
        return summary;
    }
}