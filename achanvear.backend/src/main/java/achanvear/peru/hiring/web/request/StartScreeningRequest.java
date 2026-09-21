package achanvear.peru.hiring.web.request;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record StartScreeningRequest(
        @NotBlank String jobId,
        @NotBlank String candidateId,
        @NotBlank String candidateName,
        @NotBlank String jobTitle,
        @NotBlank String jobDescription,
        List<String> requiredSkills,
        Integer experienceMin,
        String career,
        List<String> candidateSkills,
        Integer candidateExperienceYears,
        String candidateCareer
) {
}