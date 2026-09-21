package achanvear.peru.freelance.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.util.Objects;

@Embeddable
public class FreelancerCertificationEmbeddable {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "issuing_organization", nullable = false, length = 150)
    private String issuingOrganization;

    @Column(name = "credential_url")
    private String credentialUrl;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIssuingOrganization() {
        return issuingOrganization;
    }

    public void setIssuingOrganization(String issuingOrganization) {
        this.issuingOrganization = issuingOrganization;
    }

    public String getCredentialUrl() {
        return credentialUrl;
    }

    public void setCredentialUrl(String credentialUrl) {
        this.credentialUrl = credentialUrl;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FreelancerCertificationEmbeddable that = (FreelancerCertificationEmbeddable) o;
        return Objects.equals(name, that.name)
                && Objects.equals(issuingOrganization, that.issuingOrganization)
                && Objects.equals(credentialUrl, that.credentialUrl);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, issuingOrganization, credentialUrl);
    }
}
