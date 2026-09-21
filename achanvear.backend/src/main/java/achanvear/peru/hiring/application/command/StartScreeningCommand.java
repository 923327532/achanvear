package achanvear.peru.hiring.application.command;

import java.util.List;

public record StartScreeningCommand(
        String jobId,
        String candidateId,
        String candidateName,
        String jobTitle,
        String jobDescription,
        List<String> requiredSkills,
        Integer experienceMin,
        String career,
        List<String> candidateSkills,
        Integer candidateExperienceYears,
        String candidateCareer
) {
}