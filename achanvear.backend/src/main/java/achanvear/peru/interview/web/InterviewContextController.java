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
    private final achanvear.peru.shared.application.port.IdentityCandidateLookupPort candidates;
    public InterviewContextController(InterviewRepository interviews, JobPostRepository jobs,
            achanvear.peru.shared.application.port.IdentityCandidateLookupPort candidates) {
        this.interviews = interviews; this.jobs = jobs;
        this.candidates = candidates;
    }
    @GetMapping("/{interviewId}/job-context")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @PreAuthorize("@interviewAccess.owns(#interviewId, authentication)")
    public ApiResponse<Map<String,String>> context(@PathVariable String interviewId) {
        var interview = interviews.findById(InterviewId.of(interviewId)).orElseThrow();
        if (interview.getStatus() == achanvear.peru.interview.domain.model.InterviewStatus.ABORTED
                || interview.getStatus() == achanvear.peru.interview.domain.model.InterviewStatus.COMPLETED) {
            throw new IllegalStateException("Esta entrevista esta cerrada y su ID esta bloqueado. No puedes volver a rendirla");
        }
        var job = jobs.findById(JobPostId.from(interview.getJobId())).orElseThrow();
        var candidate = candidates.findById(java.util.UUID.fromString(interview.getCandidateId()));
        return ApiResponse.success(Map.of("jobId", job.getId().toString(), "title", job.getTitle(),
                "candidateName", candidate != null && candidate.fullName() != null ? candidate.fullName() : "postulante",
                "description", job.getDescription(), "requirements", job.getRequirements() == null ? "" : job.getRequirements()), "Job context");
    }
}
