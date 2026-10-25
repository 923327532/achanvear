package achanvear.peru.interview.web;
import achanvear.peru.interview.domain.repository.InterviewRepository;
import achanvear.peru.interview.domain.model.InterviewId;
import achanvear.peru.jobs.domain.repository.JobPostRepository;
import achanvear.peru.jobs.domain.model.JobPostId;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
@RequestMapping("/interviews")
public class InterviewContextController {
    private final InterviewRepository interviews;
    private final JobPostRepository jobs;
    public InterviewContextController(InterviewRepository interviews, JobPostRepository jobs) {
        this.interviews = interviews; this.jobs = jobs;
    }
    @GetMapping("/{interviewId}/job-context")
    @PreAuthorize("@interviewAccess.owns(#interviewId, authentication)")
    public ApiResponse<Map<String,String>> context(@PathVariable String interviewId) {
        var interview = interviews.findById(InterviewId.of(interviewId)).orElseThrow();
        var job = jobs.findById(JobPostId.from(interview.getJobId())).orElseThrow();
        return ApiResponse.success(Map.of("jobId", job.getId().toString(), "title", job.getTitle(),
                "description", job.getDescription(), "requirements", job.getRequirements() == null ? "" : job.getRequirements()), "Job context");
    }
}
