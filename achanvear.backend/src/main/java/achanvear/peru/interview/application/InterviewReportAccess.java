package achanvear.peru.interview.application;

import achanvear.peru.shared.exception.ForbiddenOperationException;
import achanvear.peru.shared.application.port.CurrentActorPort;
import achanvear.peru.interview.application.port.InterviewReportQueryPort;
import org.springframework.stereotype.Component;

@Component
public class InterviewReportAccess {
    private final InterviewReportQueryPort reports;
    private final CurrentActorPort actors;

    public InterviewReportAccess(InterviewReportQueryPort reports, CurrentActorPort actors) {
        this.reports = reports;
        this.actors = actors;
    }

    public void require(String interviewId) {
        var actor = actors.current().orElseThrow(InterviewReportAccess::forbidden);
        if (!actor.administrator() && !reports.canRead(interviewId, actor.userId(), actor.companyId())) {
            throw forbidden();
        }
    }

    private static ForbiddenOperationException forbidden() {
        return new ForbiddenOperationException("No tienes acceso a este informe");
    }
}
