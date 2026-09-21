package achanvear.peru.interview.domain.model;

import java.util.Objects;

public class RecordingSession {

    private String fileKey;
    private boolean active;

    public RecordingSession(String fileKey, boolean active) {
        this.fileKey = fileKey;
        this.active = active;
    }

    public static RecordingSession inactive() {
        return new RecordingSession(null, false);
    }

    public void start() {
        this.active = true;
    }

    public void finish(String fileKey) {
        this.fileKey = Objects.requireNonNull(fileKey, "Recording file key cannot be null");
        this.active = false;
    }

    public String getFileKey() {
        return fileKey;
    }

    public boolean isActive() {
        return active;
    }
}