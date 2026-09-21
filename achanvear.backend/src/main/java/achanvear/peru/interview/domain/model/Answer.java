package achanvear.peru.interview.domain.model;

import java.time.Instant;
import java.util.Objects;

public class Answer {

    private final String id;
    private final String questionId;
    private final String content;
    private final Integer score;
    private final Instant answeredAt;

    public Answer(String id, String questionId, String content, Integer score, Instant answeredAt) {
        this.id = Objects.requireNonNull(id, "Answer id cannot be null");
        this.questionId = Objects.requireNonNull(questionId, "Question id cannot be null");
        this.content = Objects.requireNonNull(content, "Answer content cannot be null");
        this.score = score;
        this.answeredAt = Objects.requireNonNull(answeredAt, "Answered at cannot be null");
    }

    public String getId() {
        return id;
    }

    public String getQuestionId() {
        return questionId;
    }

    public String getContent() {
        return content;
    }

    public Integer getScore() {
        return score;
    }

    public Instant getAnsweredAt() {
        return answeredAt;
    }
}