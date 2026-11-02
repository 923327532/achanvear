package achanvear.peru.interview.application.port;

import java.util.List;
import java.util.UUID;

public interface InterviewReportQueryPort {
    List<String> findCompletedIds(String candidateId, String jobId, String hiringProcessId);

    String findJobTitle(String jobId);

    boolean canRead(String interviewId, UUID userId, UUID companyId);
}
