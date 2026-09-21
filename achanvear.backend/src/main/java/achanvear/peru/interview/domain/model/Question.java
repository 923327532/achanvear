package achanvear.peru.interview.domain.model;

import java.util.Objects;

public class Question {

    private final String id;
    private final String content;
    private final int orderNumber;

    public Question(String id, String content, int orderNumber) {
        this.id = Objects.requireNonNull(id, "Question id cannot be null");
        this.content = Objects.requireNonNull(content, "Question content cannot be null");

        if (orderNumber < 0) {
            throw new IllegalArgumentException("Question order number must be non-negative");
        }

        this.orderNumber = orderNumber;
    }

    public String getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public int getOrderNumber() {
        return orderNumber;
    }
}