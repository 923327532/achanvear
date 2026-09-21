package achanvear.peru.interview.application.impl;

import achanvear.peru.interview.application.SubmitAnswerUseCase;
import achanvear.peru.interview.application.command.SubmitAnswerCommand;
import achanvear.peru.interview.application.dto.QuestionResponse;
import achanvear.peru.interview.application.dto.SubmitAnswerResponse;
import achanvear.peru.interview.domain.model.Answer;
import achanvear.peru.interview.domain.model.Interview;
import achanvear.peru.interview.domain.model.InterviewId;
import achanvear.peru.interview.domain.model.Question;
import achanvear.peru.interview.domain.repository.InterviewRepository;
import achanvear.peru.interview.domain.service.InterviewSlotManager;
import achanvear.peru.interview.infrastructure.external.AiInterviewerClient;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service("submitAnswerUseCase")
@Transactional
public class SubmitAnswerService implements SubmitAnswerUseCase {

    private final InterviewRepository interviewRepository;
    private final AiInterviewerClient aiInterviewerClient;
    private final InterviewSlotManager slotManager;

    public SubmitAnswerService(
            InterviewRepository interviewRepository,
            AiInterviewerClient aiInterviewerClient,
            InterviewSlotManager slotManager
    ) {
        this.interviewRepository = interviewRepository;
        this.aiInterviewerClient = aiInterviewerClient;
        this.slotManager = slotManager;
    }

    @Override
    public SubmitAnswerResponse execute(SubmitAnswerCommand command) {
        Interview interview = interviewRepository.findById(InterviewId.of(command.interviewId()))
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        AiInterviewerClient.AiAnswerEvaluation evaluation =
                aiInterviewerClient.evaluateAnswer(interview, command.questionId(), command.answerContent());

        Answer answer = interview.submitAnswer(
                command.questionId(),
                command.answerContent(),
                evaluation.score()
        );

        Question nextQuestion = evaluation.nextQuestion();
        if (nextQuestion != null) {
            interview.addNextQuestion(nextQuestion);
        }

        if (evaluation.interviewCompleted()) {
            interview.complete();
            slotManager.releaseSlot(command.interviewId());
        }

        interviewRepository.save(interview);

        return new SubmitAnswerResponse(
                command.interviewId(),
                command.questionId(),
                answer.getId(),
                evaluation.score(),
                evaluation.feedback(),
                nextQuestion != null
                        ? new QuestionResponse(nextQuestion.getId(), nextQuestion.getContent(), null) // Question no tiene getAudioUrl()
                        : null,
                evaluation.interviewCompleted()
        );
    }
}
