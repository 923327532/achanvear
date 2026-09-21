package achanvear.peru.interview.infrastructure.external;

import org.springframework.stereotype.Component;

@Component
public class S3RecordingClient {

    public String saveRecording(String interviewId, String fileKey) {
        return fileKey != null ? fileKey : "interview-recordings/" + interviewId + ".webm";
    }
}