package achanvear.peru.interview.application.impl;

import achanvear.peru.compliance.application.ValidateInterviewConsentUseCase;
import achanvear.peru.interview.application.*;
import achanvear.peru.interview.application.command.*;
import achanvear.peru.interview.application.dto.*;
import achanvear.peru.interview.domain.event.InterviewCompletedEvent;
import achanvear.peru.interview.domain.event.ScreenViolationDetectedEvent;
import achanvear.peru.interview.domain.model.*;
import achanvear.peru.jobs.domain.repository.JobPostRepository;
import achanvear.peru.jobs.domain.model.JobPost;
import achanvear.peru.jobs.domain.model.JobPostId;
import achanvear.peru.interview.domain.repository.InterviewRepository;
import achanvear.peru.interview.domain.repository.InterviewScheduleRepository;
import achanvear.peru.interview.domain.service.InterviewSlotManager;
import achanvear.peru.interview.domain.service.ScoreCalculator;
import achanvear.peru.interview.infrastructure.external.AiInterviewerClient;
import achanvear.peru.interview.infrastructure.external.S3RecordingClient;
import achanvear.peru.interview.infrastructure.external.TextToSpeechClient;
import achanvear.peru.interview.infrastructure.external.impl.RealAiInterviewerClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class InterviewApplicationService implements
        ScheduleInterviewUseCase,
        StartInterviewSessionUseCase,
        SubmitAnswerUseCase,
        CompleteInterviewUseCase,
        ReportViolationUseCase,
        AbortInterviewUseCase,
        AbortInterviewSessionUseCase,
        SaveRecordingKeyUseCase,
        GetInterviewReportUseCase,
        GetMyInterviewsUseCase {

    private static final int MAX_VIOLATIONS = 3;

    private final InterviewRepository interviewRepository;
    private final InterviewSlotManager interviewSlotManager;
    private final AiInterviewerClient aiInterviewerClient;
    private final TextToSpeechClient textToSpeechClient;
    private final S3RecordingClient s3RecordingClient;
    private final ScoreCalculator scoreCalculator;
    private final achanvear.peru.shared.infrastructure.EventPublisher eventPublisher;
    private final JobPostRepository jobPostRepository;
    private final InterviewScheduleRepository interviewScheduleRepository;
    private final ValidateInterviewConsentUseCase validateInterviewConsentUseCase;
    private static final java.time.format.DateTimeFormatter DATE_FMT = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final java.time.format.DateTimeFormatter TIME_FMT = java.time.format.DateTimeFormatter.ofPattern("HH:mm");

    public InterviewApplicationService(
            InterviewRepository interviewRepository,
            InterviewSlotManager interviewSlotManager,
            AiInterviewerClient aiInterviewerClient,
            TextToSpeechClient textToSpeechClient,
            S3RecordingClient s3RecordingClient,
            ScoreCalculator scoreCalculator,
            achanvear.peru.shared.infrastructure.EventPublisher eventPublisher,
            JobPostRepository jobPostRepository,
            InterviewScheduleRepository interviewScheduleRepository,
            ValidateInterviewConsentUseCase validateInterviewConsentUseCase
    ) {
        this.interviewRepository = interviewRepository;
        this.interviewSlotManager = interviewSlotManager;
        this.aiInterviewerClient = aiInterviewerClient;
        this.textToSpeechClient = textToSpeechClient;
        this.s3RecordingClient = s3RecordingClient;
        this.scoreCalculator = scoreCalculator;
        this.eventPublisher = eventPublisher;
        this.jobPostRepository = jobPostRepository;
        this.interviewScheduleRepository = interviewScheduleRepository;
        this.validateInterviewConsentUseCase = validateInterviewConsentUseCase;
    }

    @Override
    public InterviewSessionResponse execute(ScheduleInterviewCommand command) {
        InterviewId interviewId = InterviewId.of(UUID.randomUUID().toString());

        Optional<Integer> slot = interviewSlotManager.acquireSlot(interviewId.toString());
        if (slot.isEmpty()) {
            throw new IllegalStateException("No interview slots available right now");
        }

        InterviewerProfile profile = resolveProfile(command, slot.get());

        Interview interview = Interview.restore(
                interviewId,
                command.candidateId(),
                command.hiringProcessId(), // jobId en restore
                InterviewType.valueOf(command.interviewType()),
                InterviewStatus.SCHEDULED,
                null, // assignedSlot
                null, // abortReason
                profile,
                null, // score
                new RecordingSession(null, false),
                new ArrayList<>(), // questions
                new ArrayList<>(), // answers
                new ArrayList<>()  // violations
        );

        interviewRepository.save(interview);

        return new InterviewSessionResponse(
                interviewId.toString(),
                interview.getJobId(),
                interview.getCandidateId(),
                interview.getType().name(),
                interview.getStatus().name(),
                profile.getName(),
                profile.getStyle(),
                profile.getVoice().name(),
                interviewSlotManager.availableSlots(),
                null,
                null
        );
    }

    @Override
    public InterviewSessionResponse execute(StartInterviewSessionCommand command) {
        Interview interview = getInterview(command.interviewId());

        // Cumplimiento: sin consentimiento específico aceptado la entrevista queda bloqueada.
        // No se inicia WebSocket, no se contacta a Python ni se piden permisos multimedia antes de esto.
        validateInterviewConsentUseCase.validateOrThrow(command.interviewId());

        // Resolver el título real del puesto desde la BD
        String jobTitle = resolveJobTitle(interview.getJobId());
        
        // 1. Crear una sesión en el orquestador Python y capturar su session_id
        String sessionId = interview.getId().toString();
        String pythonSessionId = null;
        String challengeJson = null;
        try {
            RealAiInterviewerClient realClient = (RealAiInterviewerClient) aiInterviewerClient;
            var sessionResult = realClient.createPythonSession(
                    interview.getCandidateId(),
                    interview.getJobId(),
                    "", // career - se resolvera del perfil del candidato
                    jobTitle,
                    null,
                    null
            );
            // Python genera su propio session_id (uuid.uuid4()), capturarlo
            if (sessionResult != null && sessionResult.get("session_id") instanceof String sid) {
                pythonSessionId = sid;
            }
        } catch (Exception e) {
            org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(getClass());
            log.error("Error creando sesión en agente Python para interview {}: {}", 
                    interview.getId(), e.getMessage(), e);
            // Si falla la creación de sesión, no podemos continuar
            throw new IllegalStateException("No se pudo crear la sesión en el agente Python", e);
        }

        if (pythonSessionId == null) {
            throw new IllegalStateException("El agente Python no devolvió un session_id");
        }

        // 2. Iniciar la entrevista en Python segun el tipo (usando el session_id de Python)
        String firstQuestionContent;
        if (interview.getType() == InterviewType.TECHNICAL) {
            // Tecnica: genera challenge (CODING, LEGAL_CASE, DESIGN_BRIEF, ANALYTICAL_CASE)
            var techResp = aiInterviewerClient.startTechnicalInterview(
                    pythonSessionId, "", jobTitle, "Peru"
            );
            if (techResp != null && techResp.challenge() != null) {
                challengeJson = techResp.challenge().toString();
                // Extraer descripcion para mostrarla
                firstQuestionContent = techResp.challenge().toString();
            } else {
                firstQuestionContent = "Resuelve el siguiente caso practico relacionado a tu area.";
            }
        } else {
            // Teorica: genera primera pregunta via LLM
            var theoryResp = aiInterviewerClient.startTheoryInterview(
                    pythonSessionId,
                    "", // career
                    jobTitle,
                    interview.getInterviewerProfile() != null
                            ? interview.getInterviewerProfile().getCode()
                            : "PROFILE_1"
            );
            firstQuestionContent = theoryResp != null && theoryResp.current_question() != null
                    ? theoryResp.current_question().text()
                    : "Describe tu experiencia profesional y su alineacion con el puesto al que postulas.";
        }

        // 3. Guardar el session_id de Python y mutar la entrevista
        interview.setPythonSessionId(pythonSessionId);
        interview.start();
        Question firstQuestion = new Question(
                UUID.randomUUID().toString(),
                firstQuestionContent,
                1
        );
        interview.addQuestion(firstQuestion);

        interviewRepository.save(interview);

        return new InterviewSessionResponse(
                interview.getId().toString(),
                interview.getJobId(),
                interview.getCandidateId(),
                interview.getType().name(),
                InterviewStatus.IN_PROGRESS.name(),
                interview.getInterviewerProfile() != null
                        ? interview.getInterviewerProfile().getName() : "IA",
                interview.getInterviewerProfile() != null
                        ? interview.getInterviewerProfile().getStyle() : "Profesional",
                interview.getInterviewerProfile() != null
                        ? interview.getInterviewerProfile().getVoice().name() : "MALE1",
                interviewSlotManager.availableSlots(),
                firstQuestionContent,
                challengeJson
        );
    }

    @Override
    public SubmitAnswerResponse execute(SubmitAnswerCommand command) {
        Interview interview = getInterview(command.interviewId());

        AiInterviewerClient.AiAnswerEvaluation evaluation =
                aiInterviewerClient.evaluateAnswer(interview, command.questionId(), command.answerContent());

        Answer answer = interview.submitAnswer(
                command.questionId(),
                command.answerContent(),
                evaluation.score()
        );

        Question nextQuestion = evaluation.nextQuestion();
        if (nextQuestion != null) {
            interview.addNextQuestion(nextQuestion);
        }

        if (evaluation.interviewCompleted()) {
            interview.complete();
            interviewSlotManager.releaseSlot(command.interviewId());
        }

        interviewRepository.save(interview);

        QuestionResponse nextQuestionResponse = null;
        if (nextQuestion != null) {
            String audioUrl = textToSpeechClient.synthesizeQuestionAudio(
                    nextQuestion.getContent(),
                    interview.getInterviewerProfile().getVoice()
            );
            nextQuestionResponse = new QuestionResponse(
                    nextQuestion.getId(),
                    nextQuestion.getContent(),
                    audioUrl
            );
        }

        return new SubmitAnswerResponse(
                command.interviewId(),
                command.questionId(),
                answer.getId(),
                evaluation.score(),
                evaluation.feedback(),
                nextQuestionResponse,
                evaluation.interviewCompleted()
        );
    }

    @Override
    public InterviewReportResponse execute(CompleteInterviewCommand command) {
        Interview interview = getInterview(command.interviewId());

        InterviewScore finalScore = scoreCalculator.calculate(interview);
        boolean passed = finalScore.getValue() >= 75;

        interview.complete();
        interviewRepository.save(interview);
        interviewSlotManager.releaseSlot(command.interviewId());

        eventPublisher.publish(new InterviewCompletedEvent(
                interview.getId(),
                interview.getType().name(),
                finalScore.getValue(),
                passed
        ));

        return new InterviewReportResponse(
                interview.getId().toString(),
                interview.getStatus().name(),
                interview.getType().name(),
                finalScore.getValue(),
                passed,
                interview.getInterviewerProfile() != null ? new InterviewReportResponse.InterviewerProfile(
                        interview.getInterviewerProfile().getName(),
                        interview.getInterviewerProfile().getVoice().name()
                ) : null,
                interview.getAssignedSlot() != null ? new InterviewReportResponse.AssignedSlot(
                        interview.getAssignedSlot(),
                        interview.getAssignedSlot().toString(),
                        (interview.getAssignedSlot() + 1) + ":00 PM"
                ) : null,
                interview.getRecordingSession() != null ? new InterviewReportResponse.RecordingInfo(
                        interview.getRecordingSession().getFileKey()
                ) : null,
                interview.getAbortReason() != null ? new InterviewReportResponse.AbortReason(
                        interview.getAbortReason()
                ) : null,
                new InterviewReportResponse.Totals(
                        interview.getQuestions().size(),
                        interview.getAnswers().size(),
                        interview.getViolations().size()
                ),
                interview.getQuestions().stream()
                        .map(q -> new InterviewReportResponse.QuestionItem(
                                q.getId(),
                                q.getContent(),
                                null
                        ))
                        .toList(),
                interview.getAnswers().stream()
                        .map(a -> new InterviewReportResponse.AnswerItem(
                                a.getId(),
                                a.getQuestionId(),
                                a.getContent(),
                                a.getScore()
                        ))
                        .toList(),
                interview.getViolations().stream()
                        .map(v -> new InterviewReportResponse.ViolationItem(
                                v.type(),
                                v.count(),
                                v.occurredAt().toString()
                        ))
                        .toList()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewReportResponse execute(String interviewId) {
        Interview interview = interviewRepository.findById(InterviewId.of(interviewId))
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        Integer finalScore = scoreCalculator.calculate(interview).getValue();

        List<InterviewReportResponse.QuestionItem> questions = interview.getQuestions().stream()
                .map(this::toQuestionItem)
                .toList();

        List<InterviewReportResponse.AnswerItem> answers = interview.getAnswers().stream()
                .map(this::toAnswerItem)
                .toList();

        List<InterviewReportResponse.ViolationItem> violations = interview.getViolations().stream()
                .map(this::toViolationItem)
                .toList();

        return new InterviewReportResponse(
                interview.getId().toString(),
                interview.getStatus().name(),
                interview.getType().name(),
                finalScore,
                finalScore >= 75,
                interview.getInterviewerProfile() != null
                        ? new InterviewReportResponse.InterviewerProfile(
                        interview.getInterviewerProfile().getName(),
                        interview.getInterviewerProfile().getVoice().name()
                ) : null,
                interview.getAssignedSlot() != null
                        ? new InterviewReportResponse.AssignedSlot(
                        interview.getAssignedSlot(),
                        interview.getAssignedSlot().toString(),
                        (interview.getAssignedSlot() + 1) + ":00 PM"
                ) : null,
                interview.getRecordingSession() != null
                        ? new InterviewReportResponse.RecordingInfo(
                        interview.getRecordingSession().getFileKey()
                ) : null,
                interview.getAbortReason() != null
                        ? new InterviewReportResponse.AbortReason(
                        interview.getAbortReason()
                ) : null,
                new InterviewReportResponse.Totals(
                        questions.size(),
                        answers.size(),
                        violations.size()
                ),
                questions, answers, violations
        );
    }

    // ── Nuevo: listar entrevistas de un candidato ──

    private String resolveJobTitle(String jobId) {
        try {
            return jobPostRepository.findById(JobPostId.from(jobId))
                    .map(JobPost::getTitle)
                    .orElse(jobId);
        } catch (Exception e) {
            return jobId;
        }
    }

    private String resolveDateFromSchedule(String jobId, String candidateId) {
        try {
            var schedules = interviewScheduleRepository.findByCandidateId(candidateId);
            return schedules.stream()
                    .filter(s -> s.getJobId().equals(jobId) && s.getChosenSlot() != null)
                    .findFirst()
                    .map(s -> s.getChosenSlot().getDateTime().format(DATE_FMT))
                    .orElse("");
        } catch (Exception e) {
            return "";
        }
    }

    private String resolveTimeFromSchedule(String jobId, String candidateId) {
        try {
            var schedules = interviewScheduleRepository.findByCandidateId(candidateId);
            return schedules.stream()
                    .filter(s -> s.getJobId().equals(jobId) && s.getChosenSlot() != null)
                    .findFirst()
                    .map(s -> s.getChosenSlot().getDateTime().format(TIME_FMT))
                    .orElse("");
        } catch (Exception e) {
            return "";
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewSummaryResponse> getMyInterviews(String candidateId) {
        List<Interview> interviews = interviewRepository.findByCandidateId(candidateId);
        return interviews.stream().map(interview -> {
            InterviewScore interviewScore = interview.getScore();
            Integer score = interviewScore != null ? interviewScore.getValue() : null;
            boolean passed = score != null && score >= 75;
            String jobTitle = resolveJobTitle(interview.getJobId());
            String date = resolveDateFromSchedule(interview.getJobId(), candidateId);
            String time = resolveTimeFromSchedule(interview.getJobId(), candidateId);

            // Auto-cancel expired interviews
            String status = interview.getStatus().name();
            String abortReason = interview.getAbortReason();
            if ("SCHEDULED".equals(status) && date != null && !date.isEmpty()) {
                try {
                    String dateTimeStr = date + (time != null && !time.isEmpty() ? "T" + time : "T00:00");
                    java.time.LocalDateTime interviewDt = java.time.LocalDateTime.parse(dateTimeStr, java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
                    if (interviewDt.isBefore(java.time.LocalDateTime.now())) {
                        status = "ABORTED";
                        abortReason = "Vencida por inasistencia";
                    }
                } catch (Exception ignored) {}
            }

            // Para entrevistas completadas que no pasaron, generar un motivo basado en los resultados
            String reason = abortReason;
            if (reason == null && "COMPLETED".equals(status) && !passed) {
                // Calcular promedio de respuestas para dar un motivo descriptivo
                double avgScore = interview.getAnswers().stream()
                        .filter(a -> a.getScore() != null)
                        .mapToInt(Answer::getScore)
                        .average()
                        .orElse(0.0);
                int totalAnswers = interview.getAnswers().size();
                int totalQuestions = interview.getQuestions().size();
                int totalViolations = interview.getViolations().size();

                if (totalAnswers == 0) {
                    reason = "No se registraron respuestas durante la entrevista";
                } else if (avgScore < 40) {
                    reason = "Las respuestas no cumplieron con los criterios mínimos requeridos (promedio: " + String.format("%.0f", avgScore) + "/100)";
                } else if (totalViolations > 3) {
                    reason = "Se detectaron múltiples anomalías durante la evaluación (" + totalViolations + " incidentes)";
                } else if (totalQuestions > totalAnswers) {
                    reason = "No se completaron todas las preguntas de la evaluación";
                } else {
                    reason = "Puntaje insuficiente para aprobar (" + (score != null ? score : 0) + "/100)";
                }
            }

            return new InterviewSummaryResponse(
                    interview.getId().toString(),
                    jobTitle,
                    "Achanvear",
                    date,
                    time,
                    interview.getInterviewerProfile() != null ? interview.getInterviewerProfile().getName() : "",
                    status,
                    interview.getType().name(),
                    score,
                    100,
                    passed,
                    reason
            );
        }).toList();
    }

    @Override
    public void execute(ReportViolationCommand command) {
        Interview interview = interviewRepository.findById(InterviewId.of(command.interviewId()))
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        Instant occurredAt = Instant.parse(command.timestamp());
        interview.reportViolation(command.type(), command.count(), occurredAt);
        interviewRepository.save(interview);

        eventPublisher.publish(new ScreenViolationDetectedEvent(
                interview.getId(),
                command.type(),
                command.count(),
                occurredAt
        ));
    }

    @Override
    public void execute(achanvear.peru.interview.application.command.AbortInterviewSessionCommand command) {
        Interview interview = interviewRepository.findById(InterviewId.of(command.interviewId()))
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        interview.abort(command.reason());
        interviewRepository.save(interview);
        interviewSlotManager.releaseSlot(command.interviewId());
        interview.pullDomainEvents().forEach(eventPublisher::publish);
    }

    @Override
    public void execute(AbortInterviewCommand command) {
        Interview interview = interviewRepository.findById(InterviewId.of(command.interviewId()))
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        boolean hadActiveSlot = interview.getStatus() == InterviewStatus.IN_PROGRESS;

        interview.abort();
        interviewRepository.save(interview);

        if (hadActiveSlot) {
            interviewSlotManager.releaseSlot(command.interviewId());
        }
    }

    @Override
    public void execute(SaveRecordingKeyCommand command) {
        Interview interview = interviewRepository.findById(InterviewId.of(command.interviewId()))
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        interview.saveRecording(command.fileKey());
        interviewRepository.save(interview);
    }

    private Interview getInterview(String interviewId) {
        return interviewRepository.findById(InterviewId.of(interviewId))
                .orElseThrow(() -> new IllegalArgumentException("Interview not found: " + interviewId));
    }

    private InterviewerProfile resolveProfile(ScheduleInterviewCommand command, int slotNumber) {
        if (command.interviewerProfileCode() != null && !command.interviewerProfileCode().isBlank()) {
            return profileByCode(command.interviewerProfileCode());
        }
        if (Boolean.TRUE.equals(command.leadershipProfile())) {
            return profileByCode("PROFILE_4");
        }
        if (command.theoryScore() != null && command.theoryScore() >= 85) {
            return profileByCode("PROFILE_3");
        }
        if (Boolean.TRUE.equals(command.conciseAnswers())) {
            return profileByCode("PROFILE_1");
        }
        return switch (slotNumber) {
            case 1 -> profileByCode("PROFILE_1");
            case 2 -> profileByCode("PROFILE_2");
            case 3 -> profileByCode("PROFILE_3");
            default -> profileByCode("PROFILE_4");
        };
    }

    private InterviewerProfile profileByCode(String code) {
        return switch (code) {
            case "PROFILE_1" -> new InterviewerProfile("PROFILE_1", "Carlos Mendoza", "Formal y directo", InterviewerVoice.MALE1);
            case "PROFILE_2" -> new InterviewerProfile("PROFILE_2", "Ana Quispe", "Amigable y exploratorio", InterviewerVoice.FEMALE1);
            case "PROFILE_3" -> new InterviewerProfile("PROFILE_3", "Diego Torres", "Muy tecnico y detallista", InterviewerVoice.MALE2);
            default -> new InterviewerProfile("PROFILE_4", "Sofia Vargas", "Estrategico y orientado a impacto", InterviewerVoice.FEMALE2);
        };
    }

    private InterviewReportResponse.QuestionItem toQuestionItem(Question question) {
        return new InterviewReportResponse.QuestionItem(question.getId(), question.getContent(), null);
    }

    private InterviewReportResponse.AnswerItem toAnswerItem(Answer answer) {
        return new InterviewReportResponse.AnswerItem(answer.getId(), answer.getQuestionId(), answer.getContent(), answer.getScore());
    }

    private InterviewReportResponse.ViolationItem toViolationItem(ScreenViolation violation) {
        return new InterviewReportResponse.ViolationItem(violation.type(), violation.count(), violation.occurredAt().toString());
    }
}