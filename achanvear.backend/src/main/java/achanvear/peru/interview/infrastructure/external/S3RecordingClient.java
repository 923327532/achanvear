package achanvear.peru.interview.infrastructure.external;

import org.springframework.stereotype.Component;

@Component
public class S3RecordingClient implements achanvear.peru.interview.application.port.InterviewRecordingPort {

    @Override
    public String saveRecording(String interviewId, String fileKey) {
        return fileKey != null ? fileKey : "interview-recordings/" + interviewId + ".webm";
    }
}
