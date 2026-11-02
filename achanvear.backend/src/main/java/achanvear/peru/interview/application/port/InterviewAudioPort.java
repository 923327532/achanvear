package achanvear.peru.interview.application.port;

import achanvear.peru.interview.domain.model.InterviewerVoice;

public interface InterviewAudioPort {
    String synthesizeQuestionAudio(String text, InterviewerVoice voice);
}
