package achanvear.peru.interview.domain.model;

import java.util.Objects;

public class InterviewerProfile {

    private final String code;
    private final String name;
    private final String style;
    private final InterviewerVoice voice;

    public InterviewerProfile(String code, String name, String style, InterviewerVoice voice) {
        this.code = Objects.requireNonNull(code, "Profile code cannot be null");
        this.name = Objects.requireNonNull(name, "Profile name cannot be null");
        this.style = Objects.requireNonNull(style, "Profile style cannot be null");
        this.voice = Objects.requireNonNull(voice, "Profile voice cannot be null");
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getStyle() {
        return style;
    }

    public InterviewerVoice getVoice() {
        return voice;
    }
}