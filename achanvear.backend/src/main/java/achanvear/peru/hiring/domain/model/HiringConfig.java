package achanvear.peru.hiring.domain.model;

public class HiringConfig {

    private final int theoryInterviewPassScore;
    private final int technicalInterviewPassScore;
    private final int maxCandidatesPerScreeningRequest;

    public HiringConfig(int theoryInterviewPassScore, int technicalInterviewPassScore, int maxCandidatesPerScreeningRequest) {
        if (theoryInterviewPassScore < 0 || theoryInterviewPassScore > 100) {
            throw new IllegalArgumentException("Theory interview pass score must be between 0 and 100");
        }

        if (technicalInterviewPassScore < 0 || technicalInterviewPassScore > 100) {
            throw new IllegalArgumentException("Technical interview pass score must be between 0 and 100");
        }

        if (maxCandidatesPerScreeningRequest <= 0 || maxCandidatesPerScreeningRequest > 50) {
            throw new IllegalArgumentException("Max candidates per screening request must be between 1 and 50");
        }

        this.theoryInterviewPassScore = theoryInterviewPassScore;
        this.technicalInterviewPassScore = technicalInterviewPassScore;
        this.maxCandidatesPerScreeningRequest = maxCandidatesPerScreeningRequest;
    }

    public int getTheoryInterviewPassScore() {
        return theoryInterviewPassScore;
    }

    public int getTechnicalInterviewPassScore() {
        return technicalInterviewPassScore;
    }

    public int getMaxCandidatesPerScreeningRequest() {
        return maxCandidatesPerScreeningRequest;
    }

    public static HiringConfig defaultConfig() {
        return new HiringConfig(75, 75, 50);
    }
}