package achanvear.peru.freelance.application.dto;

import java.util.List;

/**
 * Respuesta del CV generado por IA.
 * Contiene el CV completo en formato estructurado y en texto plano.
 */
public record CvResponse(
        /** CV completo en formato texto (Markdown) listo para mostrar/descargar */
        String markdown,
        
        /** Secciones del CV de forma estructurada */
        HeaderSection header,
        String professionalSummary,
        List<ExperienceSection> workExperience,
        List<EducationSection> education,
        SkillsSection skills,
        List<ProjectSection> projects,
        List<CertificationSection> certifications,
        List<LanguageSection> languages,
        
        /** Datos faltantes que el usuario debe completar */
        List<String> missingData,
        
        /** Indica si el CV se generó correctamente o faltan datos */
        boolean complete
) {

    public record HeaderSection(
            String fullName,
            String role,
            String location,
            String email,
            String phone,
            String linkedIn,
            String github,
            String portfolio
    ) {}

    public record ExperienceSection(
            String position,
            String company,
            String location,
            String startDate,
            String endDate,
            List<String> bullets
    ) {}

    public record EducationSection(
            String institution,
            String program,
            String location,
            String startDate,
            String endDate
    ) {}

    public record SkillsSection(
            List<String> programmingLanguages,
            List<String> frameworks,
            List<String> tools,
            List<String> softSkills
    ) {}

    public record ProjectSection(
            String name,
            String description,
            List<String> technologies,
            String link
    ) {}

    public record CertificationSection(
            String name,
            String issuer,
            String year
    ) {}

    public record LanguageSection(
            String language,
            String level
    ) {}
}
