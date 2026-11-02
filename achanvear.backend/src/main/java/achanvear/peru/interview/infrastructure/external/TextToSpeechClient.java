package achanvear.peru.interview.infrastructure.external;

import achanvear.peru.interview.domain.model.InterviewerVoice;
import org.springframework.stereotype.Component;

@Component
public class TextToSpeechClient implements achanvear.peru.interview.application.port.InterviewAudioPort {

    @Override
    public String synthesizeQuestionAudio(String text, InterviewerVoice voice) {
        return "audio://" + voice.name().toLowerCase() + "/" + Math.abs(text.hashCode());
    }
}
