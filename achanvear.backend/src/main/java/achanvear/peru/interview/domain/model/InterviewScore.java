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

    public static Integer validatedValue(Object value) {
        if (value == null) return null;
        if (!(value instanceof Number number) || !Double.isFinite(number.doubleValue())
                || number.doubleValue() < 0 || number.doubleValue() > 100) {
            throw new IllegalStateException("Invalid interview score");
        }
        return (int) Math.round(number.doubleValue());
    }

    public boolean isApproved(int threshold) {
        return value >= threshold;
    }
}
