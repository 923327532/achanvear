package achanvear.peru.interview.domain.model;

public class InterviewScore {

    private final int value;

    public InterviewScore(int value) {
        if (value < 0 || value > 100) {
            throw new IllegalArgumentException("Interview score must be between 0 and 100");
        }
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public boolean isApproved(int threshold) {
        return value >= threshold;
    }
}