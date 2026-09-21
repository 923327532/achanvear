package achanvear.peru.interview.domain.service;

import achanvear.peru.interview.domain.model.InterviewerProfile;
import achanvear.peru.interview.domain.model.InterviewerVoice;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class InterviewerProfileSelector {

    private static final InterviewerProfile PROFILE_1 = new InterviewerProfile(
            "PROFILE_1",
            "Carlos Mendoza",
            "Formal y directo. Preguntas cortas y precisas",
            InterviewerVoice.MALE1
    );

    private static final InterviewerProfile PROFILE_2 = new InterviewerProfile(
            "PROFILE_2",
            "Ana Quispe",
            "Amigable y exploratorio. Profundiza con por que",
            InterviewerVoice.FEMALE1
    );

    private static final InterviewerProfile PROFILE_3 = new InterviewerProfile(
            "PROFILE_3",
            "Diego Torres",
            "Muy tecnico y detallista. Pide ejemplos especificos",
            InterviewerVoice.MALE2
    );

    private static final InterviewerProfile PROFILE_4 = new InterviewerProfile(
            "PROFILE_4",
            "Sofia Vargas",
            "Estrategico. Enfocado en impacto y decision",
            InterviewerVoice.FEMALE2
    );

    public InterviewerProfile selectForTheoryInterview(int theoryScore, boolean conciseAnswers, boolean leadershipProfile) {
        if (leadershipProfile) {
            return PROFILE_4;
        }

        if (theoryScore >= 85) {
            return PROFILE_3;
        }

        if (conciseAnswers) {
            return PROFILE_1;
        }

        return PROFILE_2;
    }

    public InterviewerProfile selectByCode(String code) {
        return allProfiles().stream()
                .filter(profile -> profile.getCode().equals(code))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown interviewer profile code: " + code));
    }

    public List<InterviewerProfile> allProfiles() {
        return List.of(PROFILE_1, PROFILE_2, PROFILE_3, PROFILE_4);
    }
}