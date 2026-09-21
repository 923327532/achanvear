package achanvear.peru.jobs.application.dto;

public record JobAiSuggestionResponse(
        String title,
        String description,
        String requirements,
        String type,
        String location,
        Integer salaryMin,
        Integer salaryMax
) {}
