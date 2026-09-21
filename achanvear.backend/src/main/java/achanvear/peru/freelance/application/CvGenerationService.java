package achanvear.peru.freelance.application;

import achanvear.peru.freelance.application.dto.CvEditSectionRequest;
import achanvear.peru.freelance.application.dto.CvResponse;
import achanvear.peru.freelance.application.dto.FreelancerProfileResponse;
import achanvear.peru.freelance.domain.repository.FreelancerProfileRepository;
import achanvear.peru.freelance.domain.model.FreelancerProfile;
import achanvear.peru.freelance.application.impl.FreelanceApplicationMapper;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserId;
import achanvear.peru.identity.domain.repository.UserRepository;
import achanvear.peru.profile.TalentProfileRepository;
import achanvear.peru.profile.TalentProfile;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.*;


@Service
@Transactional(readOnly = true)
public class CvGenerationService {

    private final FreelancerProfileRepository freelancerProfileRepository;
    private final TalentProfileRepository talentProfileRepository;
    private final UserRepository userRepository;
    private final FreelanceApplicationMapper mapper;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;


    @Value("${ai.provider:groq}")
    private String aiProvider;

    @Value("${groq.api-key:}")
    private String groqApiKey;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    @Value("${groq.base-url:https://api.groq.com/openai/v1}")
    private String groqBaseUrl;

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String geminiModel;

    public CvGenerationService(
            FreelancerProfileRepository freelancerProfileRepository,
            TalentProfileRepository talentProfileRepository,
            UserRepository userRepository,
            FreelanceApplicationMapper mapper,
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper
    ) {
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.talentProfileRepository = talentProfileRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
    }


    /**
     * Genera un CV completo usando Groq API con los datos del perfil del freelancer.
     */
    public CvResponse generateCv(String userId) {
        UUID uuid = UUID.fromString(userId);
        
        FreelancerProfile freelancerProfile = freelancerProfileRepository.findByUserId(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil freelancer no encontrado"));
        
        TalentProfile talentProfile = talentProfileRepository.findByUserId(uuid)
                .orElse(null);

        User user = userRepository.findById(new UserId(uuid))
                .orElse(null);

        FreelancerProfileResponse profileData = mapper.toFreelancerProfileResponse(freelancerProfile, talentProfile);

        // Construir el prompt con los datos del perfil + datos del usuario (email, phone)
        String prompt = buildGeneratePrompt(profileData, user);

        // Llamar a Groq API
        String groqResponse = callGroqApi(prompt);

        // Parsear la respuesta de Groq a CvResponse
        return parseGroqResponse(groqResponse, profileData);
    }

    /**
     * Edita una sección específica del CV usando Groq API.
     */
    public CvResponse editSection(String userId, CvEditSectionRequest request) {
        // Primero generamos el CV completo para tener contexto
        CvResponse currentCv = generateCv(userId);

        String prompt = buildEditSectionPrompt(currentCv, request.sectionName(), request.instruction());

        String groqResponse = callGroqApi(prompt);

        return parseGroqResponse(groqResponse, null);
    }

    /**
     * Construye el prompt para generar el CV completo.
     */
    private String buildGeneratePrompt(FreelancerProfileResponse profile, User user) {
        return """
            Eres un asistente experto en creación de currículums vitae profesionales.
            Genera un CV en formato JSON estructurado siguiendo EXACTAMENTE estas reglas:

            ## REGLAS ESTRICTAS (OBLIGATORIO):
            1. USA los datos proporcionados del usuario como base principal.
            2. Puedes INFERIR habilidades y conocimientos típicos de la INDUSTRIA y ESPECIALIDAD del usuario, pero NO inventes experiencia laboral ni educación.
            3. Si un dato no está disponible, déjalo como null o lista vacía.
            4. El CV debe ser profesional, en español, en 3ª persona implícita (sin "yo").
            5. Sin emojis, sin lenguaje informal.
            6. Nombres propios (empresas, tecnologías) sin traducir.
            7. Resumen profesional: máximo 5 frases.
            8. Experiencia: máximo 6 bullets por trabajo.
            9. Proyectos: máximo 3-4 proyectos.

            ## DATOS DEL USUARIO:
            %s

            ## FORMATO DE RESPUESTA (JSON ESTRICTO):
            {
              "header": {
                "fullName": "Nombre completo",
                "role": "Rol principal (usar specialty o headline)",
                "location": "Ciudad y país",
                "email": null,
                "phone": null,
                "linkedIn": null,
                "github": null,
                "portfolio": null
              },
              "professionalSummary": "Resumen profesional de 3-5 frases basado en biography, achievements y skills",
              "workExperience": [
                {
                  "position": "Cargo",
                  "company": "Empresa",
                  "location": null,
                  "startDate": null,
                  "endDate": null,
                  "bullets": ["Logro 1", "Logro 2"]
                }
              ],
              "education": [
                {
                  "institution": "Institución",
                  "program": "Programa/Carrera",
                  "location": null,
                  "startDate": null,
                  "endDate": null
                }
              ],
              "skills": {
                "programmingLanguages": [],
                "frameworks": [],
                "tools": [],
                "softSkills": []
              },
              "projects": [
                {
                  "name": "Nombre del proyecto",
                  "description": "Descripción breve",
                  "technologies": ["Tech1", "Tech2"],
                  "link": null
                }
              ],
              "certifications": [
                {
                  "name": "Nombre certificación",
                  "issuer": "Entidad emisora",
                  "year": null
                }
              ],
              "languages": [],
              "missingData": ["Lista de campos importantes que faltan"],
              "complete": true/false
            }

            ## INSTRUCCIONES PARA APROVECHAR LOS DATOS EXISTENTES:
            - Usa la INDUSTRIA y ESPECIALIDAD para determinar el rol principal del usuario en el header.
            - Extrae de la BIOGRAFÍA toda la información relevante: menciona las habilidades, experiencia y logros que aparezcan en ella.
            - Si la biografía menciona acciones o responsabilidades, conviértelas en bullets de experiencia laboral.
            - Si el usuario tiene INDUSTRIA y ESPECIALIDAD, el CV debe verse completo y profesional aunque falten datos específicos.
            - Los achievements (logros destacados) deben ir en el resumen profesional o como bullets.
            - Las habilidades (skills) deben inferirse de la industria, especialidad y biografía. Por ejemplo, si la industria es "Contabilidad" y especialidad "Auditoria", puedes inferir habilidades como: "Auditoría financiera", "Control interno", "Normas NIIF", "Análisis de riesgos", "Conciliación bancaria", etc.
            - Si hay certificaciones, inclúyelas.
            - Si hay proyectos (portfolioItems), inclúyelos.
            - El campo "complete" debe ser TRUE si al menos tiene: nombre, industria/especialidad y biografía.

            ## IMPORTANTE:
            - workExperience: Si el usuario NO tiene experiencia laboral registrada, DEJA el array vacío [].
            - education: Si el usuario NO tiene educación registrada, DEJA el array vacío [].
            - projects: Usa los portfolioItems del perfil si existen.
            - certifications: Usa las certificaciones del perfil si existen.
            - skills: Agrúpalas por categoría según el nombre de la skill. INFIERE habilidades típicas de la industria y especialidad del usuario.
            - missingData: Lista los campos importantes que faltan (ej: "experiencia laboral", "educación", etc.)
            - complete: true si hay datos suficientes para un CV presentable (al menos nombre + industria/especialidad + biografía), false si faltan datos críticos.

            Devuelve SOLO el JSON, sin texto adicional.
            """.formatted(formatProfileData(profile, user));
    }

    /**
     * Construye el prompt para editar una sección específica.
     */
    private String buildEditSectionPrompt(CvResponse currentCv, String sectionName, String instruction) {
        return """
            Eres un asistente experto en currículums vitae.
            Se te proporciona un CV actual en formato JSON y debes modificar SOLO la sección "%s"
            según la siguiente instrucción del usuario:

            INSTRUCCIÓN: %s

            ## REGLAS:
            1. Mantén todas las demás secciones EXACTAMENTE IGUAL.
            2. Modifica SOLO la sección "%s".
            3. No inventes datos que no estén en el CV original o en la instrucción.
            4. Mantén el mismo formato JSON de respuesta.

            ## CV ACTUAL:
            %s

            Devuelve SOLO el JSON completo del CV modificado, sin texto adicional.
            """.formatted(sectionName, instruction, sectionName, formatCurrentCv(currentCv));
    }

    /**
     * Formatea los datos del perfil para el prompt.
     * Incluye TODOS los datos disponibles del freelancer: perfil principal + talent profile + user (email, phone).
     */
    private String formatProfileData(FreelancerProfileResponse profile, User user) {
        StringBuilder sb = new StringBuilder();
        
        // ─── Datos personales y profesionales ────────────────────────────────
        sb.append("=== DATOS PERSONALES Y PROFESIONALES ===\n");
        sb.append("Nombre completo: ").append(nullToEmpty(profile.name())).append("\n");
        sb.append("Email: ").append(user != null && user.getEmail() != null ? user.getEmail().value() : "(No especificado)").append("\n");
        sb.append("Teléfono: ").append(user != null ? nullToEmpty(user.getPhone()) : "(No especificado)").append("\n");
        sb.append("Industria: ").append(nullToEmpty(profile.industry())).append("\n");
        sb.append("Especialidad/Rol: ").append(nullToEmpty(profile.specialty())).append("\n");
        sb.append("Headline/Título profesional: ").append(nullToEmpty(profile.headline())).append("\n");
        sb.append("Biografía/Descripción: ").append(nullToEmpty(profile.biography())).append("\n");
        sb.append("Logros destacados: ").append(nullToEmpty(profile.achievements())).append("\n");
        sb.append("Dirección: ").append(nullToEmpty(profile.address())).append("\n");
        sb.append("Ubicación (ciudad/país): ").append(nullToEmpty(profile.location())).append("\n");
        sb.append("DNI: ").append(nullToEmpty(profile.dni())).append("\n");
        sb.append("URL foto de perfil: ").append(nullToEmpty(profile.profilePhotoUrl())).append("\n");
        sb.append("URL CV actual: ").append(nullToEmpty(profile.curriculumUrl())).append("\n");
        sb.append("Estado del perfil: ").append(nullToEmpty(profile.status())).append("\n");
        sb.append("Método de pago: ").append(nullToEmpty(profile.paymentMethodType())).append("\n");
        sb.append("\n");

        // ─── Habilidades (Skills) ────────────────────────────────────────────
        sb.append("=== HABILIDADES ===\n");
        if (profile.skills() != null && !profile.skills().isEmpty()) {
            for (var skill : profile.skills()) {
                sb.append("- ").append(skill.name())
                  .append(" | Nivel: ").append(skill.level())
                  .append(" | Años de experiencia: ").append(skill.yearsOfExperience() != null ? skill.yearsOfExperience() : "No especificado")
                  .append("\n");
            }
        } else {
            sb.append("(El usuario no ha registrado habilidades en el sistema de talento, pero puedes inferirlas de su industria, especialidad y biografía)\n");
        }
        sb.append("\n");

        // ─── Proyectos / Portafolio ──────────────────────────────────────────
        sb.append("=== PROYECTOS / PORTAFOLIO ===\n");
        if (profile.portfolioItems() != null && !profile.portfolioItems().isEmpty()) {
            for (var item : profile.portfolioItems()) {
                sb.append("- Título: ").append(nullToEmpty(item.title())).append("\n");
                sb.append("  Descripción: ").append(nullToEmpty(item.description())).append("\n");
                sb.append("  URL del proyecto: ").append(nullToEmpty(item.projectUrl())).append("\n");
                sb.append("  URL del asset: ").append(nullToEmpty(item.assetUrl())).append("\n");
            }
        } else {
            sb.append("(El usuario no ha registrado proyectos/portafolio todavía)\n");
        }
        sb.append("\n");

        // ─── Certificaciones ─────────────────────────────────────────────────
        sb.append("=== CERTIFICACIONES ===\n");
        if (profile.certifications() != null && !profile.certifications().isEmpty()) {
            for (var cert : profile.certifications()) {
                sb.append("- ").append(nullToEmpty(cert.name()))
                  .append(" | Emitido por: ").append(nullToEmpty(cert.issuingOrganization()))
                  .append(" | URL: ").append(nullToEmpty(cert.credentialUrl()))
                  .append("\n");
            }
        } else {
            sb.append("(El usuario no ha registrado certificaciones todavía)\n");
        }
        sb.append("\n");

        // ─── Reputación ──────────────────────────────────────────────────────
        sb.append("=== REPUTACIÓN ===\n");
        if (profile.reputationScore() != null) {
            sb.append("Estrellas promedio: ").append(profile.reputationScore().averageStars()).append("\n");
            sb.append("Porcentaje de recomendación: ").append(profile.reputationScore().recommendationPercentage()).append("\n");
            sb.append("Total de calificaciones: ").append(profile.reputationScore().totalRatings()).append("\n");
        } else {
            sb.append("(El usuario no tiene calificaciones todavía)\n");
        }
        sb.append("\n");

        // ─── Nota para la generación ─────────────────────────────────────────
        sb.append("=== NOTA PARA LA GENERACIÓN ===\n");
        sb.append("El usuario tiene datos de perfil freelancer (industria, especialidad, biografía).\n");
        sb.append("Usa la INDUSTRIA y ESPECIALIDAD para determinar su rol profesional.\n");
        sb.append("Extrae de la BIOGRAFÍA toda la información útil para el resumen profesional y habilidades.\n");
        sb.append("Si no hay experiencia laboral registrada, deja el array vacío [].\n");
        sb.append("Si no hay educación registrada, deja el array vacío [].\n");
        sb.append("Puedes inferir habilidades (skills) de la industria, especialidad y biografía.\n");

        return sb.toString();
    }

    /**
     * Helper para convertir null a string vacío.
     */
    private String nullToEmpty(String value) {
        return value != null ? value : "(No especificado)";
    }


    /**
     * Formatea el CV actual para el prompt de edición.
     */
    private String formatCurrentCv(CvResponse cv) {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(cv);
        } catch (Exception e) {
            return cv.markdown();
        }
    }

    /**
     * Llama a la API de IA seleccionada (Groq o Gemini) según la configuración.
     */
    private String callGroqApi(String prompt) {
        boolean useGemini = "gemini".equalsIgnoreCase(aiProvider);
        System.out.println(">>> PROVEEDOR IA: " + (useGemini ? "GEMINI" : "GROQ") + 
                           " | MODELO: " + (useGemini ? geminiModel : groqModel));
        try {
            if (useGemini) {
                return callGeminiApi(prompt);
            }
            return callGroqNativeApi(prompt);
        } catch (Exception e) {
            throw new RuntimeException("Error al llamar a " + (useGemini ? "Gemini" : "Groq") + " API: " + e.getMessage(), e);
        }
    }

    /**
     * Llama a la API de Groq (formato OpenAI Chat Completions).
     */
    private String callGroqNativeApi(String prompt) {
        // Construir el request body para Groq API (formato OpenAI)
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", groqModel);
        
        ArrayNode messages = requestBody.putArray("messages");
        ObjectNode userMessage = messages.addObject();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        
        // Configuración de generación
        ObjectNode responseFormat = requestBody.putObject("response_format");
        responseFormat.put("type", "text");
        
        requestBody.put("temperature", 0.3);
        requestBody.put("max_tokens", 4096);
        requestBody.put("top_p", 0.95);

        String url = groqBaseUrl + "/chat/completions";

        String response = restClient.post()
                .uri(url)
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + groqApiKey)
                .body(requestBody.toString())
                .retrieve()
                .body(String.class);

        return extractTextFromOpenAiResponse(response);
    }

    /**
     * Llama a la API de Gemini (Google Generative AI).
     */
    private String callGeminiApi(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent";

        // Construir el request body para Gemini API
        ObjectNode requestBody = objectMapper.createObjectNode();
        
        ArrayNode contents = requestBody.putArray("contents");
        ObjectNode content = contents.addObject();
        ArrayNode parts = content.putArray("parts");
        ObjectNode part = parts.addObject();
        part.put("text", prompt);
        
        // Configuración de generación
        ObjectNode generationConfig = requestBody.putObject("generationConfig");
        generationConfig.put("temperature", 0.3);
        generationConfig.put("maxOutputTokens", 4096);
        generationConfig.put("topP", 0.95);

        String response = restClient.post()
                .uri(url)
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", geminiApiKey)
                .body(requestBody.toString())
                .retrieve()
                .body(String.class);

        return extractTextFromGeminiResponse(response);
    }

    /**
     * Extrae el texto de la respuesta de Groq/OpenAI (formato OpenAI).
     */
    private String extractTextFromOpenAiResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode choice = root.path("choices").get(0);
            if (choice == null) {
                throw new RuntimeException("Respuesta sin choices");
            }
            JsonNode text = choice.path("message").path("content");
            if (text == null || text.isMissingNode()) {
                String finishReason = choice.path("finish_reason").asText();
                throw new RuntimeException("Respuesta sin contenido. finish_reason: " + finishReason);
            }
            return text.asText();
        } catch (Exception e) {
            throw new RuntimeException("Error al parsear respuesta: " + e.getMessage() + 
                ". Respuesta raw: " + (response != null ? response.substring(0, Math.min(response.length(), 500)) : "null"), e);
        }
    }

    /**
     * Extrae el texto de la respuesta de Gemini.
     */
    private String extractTextFromGeminiResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            // Navegar: candidates[0].content.parts[0].text
            JsonNode candidate = root.path("candidates").get(0);
            if (candidate == null) {
                // Verificar si hay bloqueo por seguridad
                JsonNode promptFeedback = root.path("promptFeedback");
                if (!promptFeedback.isMissingNode()) {
                    throw new RuntimeException("Gemini bloqueó la solicitud: " + promptFeedback.toString());
                }
                throw new RuntimeException("Respuesta de Gemini sin candidates");
            }
            JsonNode text = candidate.path("content").path("parts").get(0).path("text");
            if (text == null || text.isMissingNode()) {
                String finishReason = candidate.path("finishReason").asText();
                throw new RuntimeException("Respuesta sin contenido de Gemini. finishReason: " + finishReason);
            }
            return text.asText();
        } catch (Exception e) {
            throw new RuntimeException("Error al parsear respuesta de Gemini: " + e.getMessage() + 
                ". Respuesta raw: " + (response != null ? response.substring(0, Math.min(response.length(), 500)) : "null"), e);
        }
    }

    /**
     * Parsea la respuesta de Groq a CvResponse.
     */
    private CvResponse parseGroqResponse(String groqText, FreelancerProfileResponse profileData) {
        try {
            // Limpiar el texto: quitar posibles bloques markdown ```json ... ```
            String cleanJson = groqText.trim();
            if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.replaceAll("```(?:json)?", "").trim();
            }

            JsonNode root = objectMapper.readTree(cleanJson);

            // Header
            JsonNode headerNode = root.path("header");
            CvResponse.HeaderSection header = new CvResponse.HeaderSection(
                getStringOrNull(headerNode, "fullName"),
                getStringOrNull(headerNode, "role"),
                getStringOrNull(headerNode, "location"),
                getStringOrNull(headerNode, "email"),
                getStringOrNull(headerNode, "phone"),
                getStringOrNull(headerNode, "linkedIn"),
                getStringOrNull(headerNode, "github"),
                getStringOrNull(headerNode, "portfolio")
            );

            // Professional Summary
            String summary = getStringOrNull(root, "professionalSummary");

            // Work Experience
            List<CvResponse.ExperienceSection> experiences = new ArrayList<>();
            JsonNode expArray = root.path("workExperience");
            if (expArray.isArray()) {
                for (JsonNode exp : expArray) {
                    List<String> bullets = new ArrayList<>();
                    JsonNode bulletsNode = exp.path("bullets");
                    if (bulletsNode.isArray()) {
                        for (JsonNode bullet : bulletsNode) {
                            bullets.add(bullet.asText());
                        }
                    }
                    experiences.add(new CvResponse.ExperienceSection(
                        getStringOrNull(exp, "position"),
                        getStringOrNull(exp, "company"),
                        getStringOrNull(exp, "location"),
                        getStringOrNull(exp, "startDate"),
                        getStringOrNull(exp, "endDate"),
                        bullets
                    ));
                }
            }

            // Education
            List<CvResponse.EducationSection> educationList = new ArrayList<>();
            JsonNode eduArray = root.path("education");
            if (eduArray.isArray()) {
                for (JsonNode edu : eduArray) {
                    educationList.add(new CvResponse.EducationSection(
                        getStringOrNull(edu, "institution"),
                        getStringOrNull(edu, "program"),
                        getStringOrNull(edu, "location"),
                        getStringOrNull(edu, "startDate"),
                        getStringOrNull(edu, "endDate")
                    ));
                }
            }

            // Skills
            JsonNode skillsNode = root.path("skills");
            CvResponse.SkillsSection skills = new CvResponse.SkillsSection(
                getStringList(skillsNode, "programmingLanguages"),
                getStringList(skillsNode, "frameworks"),
                getStringList(skillsNode, "tools"),
                getStringList(skillsNode, "softSkills")
            );

            // Projects
            List<CvResponse.ProjectSection> projects = new ArrayList<>();
            JsonNode projArray = root.path("projects");
            if (projArray.isArray()) {
                for (JsonNode proj : projArray) {
                    projects.add(new CvResponse.ProjectSection(
                        getStringOrNull(proj, "name"),
                        getStringOrNull(proj, "description"),
                        getStringList(proj, "technologies"),
                        getStringOrNull(proj, "link")
                    ));
                }
            }

            // Certifications
            List<CvResponse.CertificationSection> certifications = new ArrayList<>();
            JsonNode certArray = root.path("certifications");
            if (certArray.isArray()) {
                for (JsonNode cert : certArray) {
                    certifications.add(new CvResponse.CertificationSection(
                        getStringOrNull(cert, "name"),
                        getStringOrNull(cert, "issuer"),
                        getStringOrNull(cert, "year")
                    ));
                }
            }

            // Languages
            List<CvResponse.LanguageSection> languages = new ArrayList<>();
            JsonNode langArray = root.path("languages");
            if (langArray.isArray()) {
                for (JsonNode lang : langArray) {
                    languages.add(new CvResponse.LanguageSection(
                        getStringOrNull(lang, "language"),
                        getStringOrNull(lang, "level")
                    ));
                }
            }

            // Missing data
            List<String> missingData = getStringList(root, "missingData");
            boolean complete = root.path("complete").asBoolean(false);

            // Generar markdown
            String markdown = generateMarkdown(header, summary, experiences, educationList, 
                                               skills, projects, certifications, languages);

            return new CvResponse(
                markdown, header, summary, experiences, educationList,
                skills, projects, certifications, languages,
                missingData, complete
            );

        } catch (Exception e) {
            throw new RuntimeException("Error al parsear la respuesta de Groq como CV: " + e.getMessage(), e);
        }
    }

    /**
     * Genera el CV en formato Markdown.
     */
    private String generateMarkdown(
            CvResponse.HeaderSection header,
            String summary,
            List<CvResponse.ExperienceSection> experiences,
            List<CvResponse.EducationSection> educationList,
            CvResponse.SkillsSection skills,
            List<CvResponse.ProjectSection> projects,
            List<CvResponse.CertificationSection> certifications,
            List<CvResponse.LanguageSection> languages
    ) {
        StringBuilder md = new StringBuilder();

        // Header
        if (header.fullName() != null) {
            md.append("# ").append(header.fullName()).append("\n\n");
        }
        if (header.role() != null) {
            md.append("**").append(header.role()).append("**\n\n");
        }
        if (header.location() != null) {
            md.append("📍 ").append(header.location()).append("\n");
        }
        if (header.email() != null) {
            md.append("✉️ ").append(header.email()).append("\n");
        }
        if (header.phone() != null) {
            md.append("📞 ").append(header.phone()).append("\n");
        }
        md.append("\n---\n\n");

        // Professional Summary
        if (summary != null && !summary.isBlank()) {
            md.append("## Resumen profesional\n\n");
            md.append(summary).append("\n\n---\n\n");
        }

        // Work Experience
        if (experiences != null && !experiences.isEmpty()) {
            md.append("## Experiencia laboral\n\n");
            for (var exp : experiences) {
                md.append("### ").append(exp.position()).append(" en ").append(exp.company()).append("\n");
                if (exp.location() != null) {
                    md.append("*").append(exp.location()).append("*");
                }
                if (exp.startDate() != null || exp.endDate() != null) {
                    md.append(" | ");
                    if (exp.startDate() != null) md.append(exp.startDate());
                    md.append(" — ");
                    if (exp.endDate() != null) md.append(exp.endDate());
                    else md.append("Actual");
                }
                md.append("\n\n");
                if (exp.bullets() != null) {
                    for (String bullet : exp.bullets()) {
                        md.append("- ").append(bullet).append("\n");
                    }
                }
                md.append("\n");
            }
            md.append("---\n\n");
        }

        // Education
        if (educationList != null && !educationList.isEmpty()) {
            md.append("## Educación\n\n");
            for (var edu : educationList) {
                md.append("### ").append(edu.institution()).append("\n");
                md.append("*").append(edu.program()).append("*");
                if (edu.location() != null) {
                    md.append(" — ").append(edu.location());
                }
                if (edu.startDate() != null || edu.endDate() != null) {
                    md.append(" | ");
                    if (edu.startDate() != null) md.append(edu.startDate());
                    md.append(" — ");
                    if (edu.endDate() != null) md.append(edu.endDate());
                    else md.append("En curso");
                }
                md.append("\n\n");
            }
            md.append("---\n\n");
        }

        // Skills
        if (skills != null) {
            md.append("## Habilidades\n\n");
            if (skills.programmingLanguages() != null && !skills.programmingLanguages().isEmpty()) {
                md.append("**Lenguajes de programación:** ");
                md.append(String.join(", ", skills.programmingLanguages())).append("\n\n");
            }
            if (skills.frameworks() != null && !skills.frameworks().isEmpty()) {
                md.append("**Frameworks y librerías:** ");
                md.append(String.join(", ", skills.frameworks())).append("\n\n");
            }
            if (skills.tools() != null && !skills.tools().isEmpty()) {
                md.append("**Herramientas / DevOps:** ");
                md.append(String.join(", ", skills.tools())).append("\n\n");
            }
            if (skills.softSkills() != null && !skills.softSkills().isEmpty()) {
                md.append("**Otras habilidades:** ");
                md.append(String.join(", ", skills.softSkills())).append("\n\n");
            }
            md.append("---\n\n");
        }

        // Projects
        if (projects != null && !projects.isEmpty()) {
            md.append("## Proyectos\n\n");
            for (var proj : projects) {
                md.append("### ").append(proj.name()).append("\n");
                md.append(proj.description()).append("\n");
                if (proj.technologies() != null && !proj.technologies().isEmpty()) {
                    md.append("*Tecnologías:* ").append(String.join(", ", proj.technologies())).append("\n");
                }
                if (proj.link() != null) {
                    md.append("[Ver proyecto](").append(proj.link()).append(")\n");
                }
                md.append("\n");
            }
            md.append("---\n\n");
        }

        // Certifications
        if (certifications != null && !certifications.isEmpty()) {
            md.append("## Certificaciones\n\n");
            for (var cert : certifications) {
                md.append("- **").append(cert.name()).append("**");
                if (cert.issuer() != null) {
                    md.append(" — ").append(cert.issuer());
                }
                if (cert.year() != null) {
                    md.append(" (").append(cert.year()).append(")");
                }
                md.append("\n");
            }
            md.append("\n---\n\n");
        }

        // Languages
        if (languages != null && !languages.isEmpty()) {
            md.append("## Idiomas\n\n");
            for (var lang : languages) {
                md.append("- **").append(lang.language()).append("** — ");
                md.append(lang.level()).append("\n");
            }
        }

        return md.toString().trim();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String getStringOrNull(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return (value.isNull() || value.isMissingNode()) ? null : value.asText();
    }

    private List<String> getStringList(JsonNode node, String field) {
        List<String> result = new ArrayList<>();
        JsonNode array = node.path(field);
        if (array.isArray()) {
            for (JsonNode item : array) {
                result.add(item.asText());
            }
        }
        return result;
    }
}
