package achanvear.peru.interview.domain.factory;

import achanvear.peru.interview.domain.model.Interview;
import achanvear.peru.interview.domain.model.InterviewId;
import achanvear.peru.interview.domain.model.InterviewType;
import achanvear.peru.interview.domain.model.InterviewerProfile;
import achanvear.peru.interview.domain.service.InterviewerProfileSelector;
import org.springframework.stereotype.Component;

@Component
public class InterviewFactory {

    private final InterviewerProfileSelector interviewerProfileSelector;

    public InterviewFactory(InterviewerProfileSelector interviewerProfileSelector) {
        this.interviewerProfileSelector = interviewerProfileSelector;
    }

    public Interview scheduleTheoryInterview(
            String hiringProcessId,
            String candidateId,
            int theoryScore,
            boolean conciseAnswers,
            boolean leadershipProfile
    ) {
        InterviewerProfile interviewerProfile = interviewerProfileSelector.selectForTheoryInterview(
                theoryScore,
                conciseAnswers,
                leadershipProfile
        );

        return Interview.schedule(
                InterviewId.newId(),
                hiringProcessId,
                candidateId,
                InterviewType.THEORY,
                interviewerProfile
        );
    }

    public Interview scheduleTechnicalInterview(
            String hiringProcessId,
            String candidateId,
            String interviewerProfileCode
    ) {
        InterviewerProfile interviewerProfile = interviewerProfileSelector.selectByCode(interviewerProfileCode);

        return Interview.schedule(
                InterviewId.newId(),
                hiringProcessId,
                candidateId,
                InterviewType.TECHNICAL,
                interviewerProfile
        );
    }
}