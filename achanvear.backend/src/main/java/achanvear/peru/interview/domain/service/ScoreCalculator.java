package achanvear.peru.interview.domain.service;

import achanvear.peru.interview.domain.model.Answer;
import achanvear.peru.interview.domain.model.Interview;
import achanvear.peru.interview.domain.model.InterviewScore;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ScoreCalculator {

    public InterviewScore calculateTheoryScore(List<Answer> answers, List<Integer> answerScores) {
        validateInputs(answers, answerScores);

        int average = (int) Math.round(
                answerScores.stream()
                        .mapToInt(Integer::intValue)
                        .average()
                        .orElse(0)
        );

        return new InterviewScore(average);
    }

    public InterviewScore calculateTechnicalScore(
            List<Answer> answers,
            List<Integer> answerScores,
            int antiCheatViolations
    ) {
        validateInputs(answers, answerScores);

        int average = (int) Math.round(
                answerScores.stream()
                        .mapToInt(Integer::intValue)
                        .average()
                        .orElse(0)
        );

        int penalty = Math.max(0, antiCheatViolations) * 5;
        int finalScore = Math.max(0, average - penalty);

        return new InterviewScore(finalScore);
    }

    public InterviewScore calculate(Interview interview) {
        List<Answer> answers = interview.getAnswers();
        if (answers == null || answers.isEmpty()) {
            return new InterviewScore(0);
        }

        List<Integer> scores = answers.stream()
                .map(Answer::getScore)
                .filter(score -> score != null && score >= 0 && score <= 100)
                .toList();

        if (scores.isEmpty()) {
            return new InterviewScore(0);
        }

        int average = (int) Math.round(
                scores.stream()
                        .mapToInt(Integer::intValue)
                        .average()
                        .orElse(0)
        );

        return new InterviewScore(average);
    }

    private void validateInputs(List<Answer> answers, List<Integer> answerScores) {
        if (answers == null || answers.isEmpty()) {
            throw new IllegalArgumentException("Answers cannot be null or empty");
        }

        if (answerScores == null || answerScores.isEmpty()) {
            throw new IllegalArgumentException("Answer scores cannot be null or empty");
        }

        if (answers.size() != answerScores.size()) {
            throw new IllegalArgumentException("Answers and answer scores must have the same size");
        }

        boolean invalidScore = answerScores.stream().anyMatch(score -> score < 0 || score > 100);
        if (invalidScore) {
            throw new IllegalArgumentException("Each answer score must be between 0 and 100");
        }
    }
}