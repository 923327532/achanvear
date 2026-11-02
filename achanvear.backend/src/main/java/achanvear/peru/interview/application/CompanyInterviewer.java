package achanvear.peru.interview.application;

import achanvear.peru.shared.application.port.CompanyInterviewSettingsPort;
import achanvear.peru.interview.domain.model.InterviewerProfile;
import achanvear.peru.interview.domain.service.InterviewerProfileSelector;
import achanvear.peru.jobs.domain.model.JobPostId;
import achanvear.peru.jobs.domain.repository.JobPostRepository;
import org.springframework.stereotype.Service;

@Service
public class CompanyInterviewer {
    private final JobPostRepository jobs;
    private final CompanyInterviewSettingsPort companies;
    private final InterviewerProfileSelector profiles;
    private final achanvear.peru.payments.application.CompanyAiAccess aiAccess;
    public CompanyInterviewer(JobPostRepository jobs, CompanyInterviewSettingsPort companies, InterviewerProfileSelector profiles,
            achanvear.peru.payments.application.CompanyAiAccess aiAccess) {
        this.jobs = jobs; this.companies = companies; this.profiles = profiles;
        this.aiAccess = aiAccess;
    }
    public InterviewerProfile forJob(String jobId) {
        aiAccess.requireJob(jobId);
        var job = jobs.findById(JobPostId.from(jobId)).orElseThrow();
        String selected = companies.selectedAgent(job.getCompanyId());
        String code = selected == null ? "PROFILE_1" : switch (selected.toLowerCase(java.util.Locale.ROOT)) {
            case "ana", "profile_2" -> "PROFILE_2";
            case "diego", "profile_3" -> "PROFILE_3";
            case "sofia", "profile_4" -> "PROFILE_4";
            default -> "PROFILE_1";
        };
        return profiles.selectByCode(code);
    }
}
