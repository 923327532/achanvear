package achanvear.peru.interview.web;
import achanvear.peru.interview.domain.repository.InterviewRepository;
import achanvear.peru.interview.domain.model.InterviewId;
import achanvear.peru.shared.security.AuthenticatedUser;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
@Component("interviewAccess")
public class InterviewAccess {
    private final InterviewRepository interviews;
    public InterviewAccess(InterviewRepository interviews) { this.interviews = interviews; }
    public boolean owns(String id, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) return false;
        return interviews.findById(InterviewId.of(id))
                .map(i -> i.getCandidateId().equals(user.getUserId().toString())).orElse(false);
    }
}
