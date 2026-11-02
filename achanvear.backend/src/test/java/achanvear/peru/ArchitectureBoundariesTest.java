package achanvear.peru;

import achanvear.peru.interview.application.CompanyInterviewer;
import achanvear.peru.interview.application.InterviewReportAccess;
import achanvear.peru.interview.application.impl.InterviewApplicationService;
import achanvear.peru.jobs.application.impl.CandidateInterviewReportsService;
import achanvear.peru.jobs.web.CandidateInterviewReportsController;
import achanvear.peru.notifications.application.InterviewReminderService;
import achanvear.peru.profile.application.ProfileCvAccess;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;

class ArchitectureBoundariesTest {
    @Test
    void applicationServicesAndReportControllerDependOnPortsInsteadOfPersistenceOrHttpClients() {
        var services = List.of(CompanyInterviewer.class, InterviewReportAccess.class,
                InterviewApplicationService.class, CandidateInterviewReportsService.class,
                CandidateInterviewReportsController.class, InterviewReminderService.class, ProfileCvAccess.class);
        for (var service : services) {
            for (var field : service.getDeclaredFields()) {
                String dependency = field.getType().getPackageName();
                boolean infrastructure = dependency.contains(".infrastructure.")
                        || dependency.startsWith("org.springframework.jdbc")
                        || dependency.startsWith("org.springframework.security");
                assertFalse(infrastructure, () -> service.getSimpleName() + " must use a port for " + field.getName());
            }
        }
    }
}
