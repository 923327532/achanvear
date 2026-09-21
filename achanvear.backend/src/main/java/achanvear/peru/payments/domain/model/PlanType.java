package achanvear.peru.payments.domain.model;

public enum PlanType {
    FREE(0, 1, 0),
    BASIC(29, 10, 5),
    PREMIUM(99, 50, 10),
    ENTERPRISE(299, Integer.MAX_VALUE, 20);

    private final int monthlyPrice;
    private final int maxProjects;
    private final int maxInvitesPerProject;

    PlanType(int monthlyPrice, int maxProjects, int maxInvitesPerProject) {
        this.monthlyPrice = monthlyPrice;
        this.maxProjects = maxProjects;
        this.maxInvitesPerProject = maxInvitesPerProject;
    }

    public int monthlyPrice() { return monthlyPrice; }
    public int maxProjects() { return maxProjects; }
    public int maxInvitesPerProject() { return maxInvitesPerProject; }

    public boolean canPublishProject(int currentProjectCount) {
        return currentProjectCount < maxProjects;
    }
}
