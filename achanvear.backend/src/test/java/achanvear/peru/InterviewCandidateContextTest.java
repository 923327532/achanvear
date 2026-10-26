package achanvear.peru;
import achanvear.peru.interview.domain.model.*;
import achanvear.peru.interview.domain.repository.InterviewRepository;
import achanvear.peru.interview.web.InterviewContextController;
import achanvear.peru.jobs.domain.model.*;
import achanvear.peru.jobs.domain.repository.JobPostRepository;
import achanvear.peru.shared.application.port.IdentityCandidateLookupPort;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class InterviewCandidateContextTest {
    @Test void candidateNameAndJobRequirementsComeFromTheSystem() {
        var interviews=mock(InterviewRepository.class);var jobs=mock(JobPostRepository.class);var candidates=mock(IdentityCandidateLookupPort.class);
        var id=InterviewId.of(UUID.randomUUID().toString());var candidate=UUID.randomUUID();var job=JobPostId.from(UUID.randomUUID().toString());
        when(interviews.findById(id)).thenReturn(Optional.of(new Interview(id,candidate.toString(),job.toString(),InterviewType.TECHNICAL)));
        var post=mock(JobPost.class);when(post.getId()).thenReturn(job);when(post.getTitle()).thenReturn("Java con Spring");
        when(post.getDescription()).thenReturn("Desarrollar APIs");when(post.getRequirements()).thenReturn("Java 17 y Spring Framework");
        when(jobs.findById(job)).thenReturn(Optional.of(post));
        when(candidates.findById(candidate)).thenReturn(new IdentityCandidateLookupPort.CandidateSummary(candidate,"test@example.invalid","FREELANCER","ACTIVE","Ana Torres"));
        var context=new InterviewContextController(interviews,jobs,candidates).context(id.toString()).getData();
        assertEquals("Ana Torres",context.get("candidateName"));assertEquals("Java con Spring",context.get("title"));
        assertEquals("Java 17 y Spring Framework",context.get("requirements"));
    }
}
