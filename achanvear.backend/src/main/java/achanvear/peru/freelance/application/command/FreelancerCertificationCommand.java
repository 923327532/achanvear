package achanvear.peru.freelance.application.command;

public record FreelancerCertificationCommand(
        String name,
        String issuingOrganization,
        String credentialUrl
) {
}