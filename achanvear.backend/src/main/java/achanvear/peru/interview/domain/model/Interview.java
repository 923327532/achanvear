package achanvear.peru.interview.domain.model;

import achanvear.peru.interview.domain.event.InterviewCompletedEvent;
import achanvear.peru.interview.domain.event.InterviewStartedEvent;
import achanvear.peru.interview.domain.event.ScreenViolationDetectedEvent;
import achanvear.peru.shared.domain.DomainEvent;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class Interview {

    private final InterviewId id;
    private final String candidateId;
    private final String jobId;
    private final InterviewType type;

    private InterviewStatus status;
    private Integer assignedSlot;
    private String abortReason;
    private String pythonSessionId;
    private InterviewerProfile interviewerProfile;
    private RecordingSession recordingSession;

    private final List<Question> questions;
    private final List<Answer> answers;
    private final List<ScreenViolation> violations;
    private InterviewScore score;
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    public Interview(
            InterviewId id,
            String candidateId,
            String jobId,
            InterviewType type
    ) {
        this.id = Objects.requireNonNull(id);
        this.candidateId = Objects.requireNonNull(candidateId);
        this.jobId = Objects.requireNonNull(jobId);
        this.type = Objects.requireNonNull(type);
        this.status = InterviewStatus.SCHEDULED;
        this.questions = new ArrayList<>();
        this.answers = new ArrayList<>();
        this.violations = new ArrayList<>();
    }

    public static Interview restore(
            InterviewId id,
            String candidateId,
            String jobId,
            InterviewType type,
            InterviewStatus status,
            Integer assignedSlot,
            String abortReason,
            InterviewerProfile interviewerProfile,
            InterviewScore score, RecordingSession recordingSession,
            List<Question> questions,
            List<Answer> answers,
            List<ScreenViolation> violations
    ) {
        Interview interview = new Interview(id, candidateId, jobId, type);
        interview.status = Objects.requireNonNull(status);
        interview.assignedSlot = assignedSlot;
        interview.abortReason = abortReason;
        interview.interviewerProfile = interviewerProfile;
        interview.recordingSession = recordingSession;
        interview.questions.addAll(questions != null ? questions : List.of());
        interview.answers.addAll(answers != null ? answers : List.of());
        interview.violations.addAll(violations != null ? violations : List.of());
        return interview;
    }

    public static Interview schedule(
            InterviewId id,
            String jobId,
            String candidateId,
            InterviewType type,
            InterviewerProfile interviewerProfile
    ) {
        Interview interview = new Interview(id, candidateId, jobId, type);
        interview.interviewerProfile = interviewerProfile;
        interview.recordingSession = RecordingSession.inactive();
        return interview;
    }

    public void start() {
        ensureStatus(InterviewStatus.SCHEDULED);
        this.status = InterviewStatus.IN_PROGRESS;
        this.domainEvents.add(new InterviewStartedEvent(
                this.id,
                this.type.name(),
                Instant.now()
        ));
    }

    public void addQuestion(Question question) {
        ensureStatus(InterviewStatus.IN_PROGRESS);
        this.questions.add(Objects.requireNonNull(question, "Question cannot be null"));
    }

    public void submitAnswer(Answer answer) {
        ensureStatus(InterviewStatus.IN_PROGRESS);
        this.answers.add(Objects.requireNonNull(answer, "Answer cannot be null"));
    }

    public void addViolation(ScreenViolation violation) {
        ensureStatus(InterviewStatus.IN_PROGRESS);
        this.violations.add(Objects.requireNonNull(violation, "Violation cannot be null"));
    }

    public void reportViolation(String type, Integer count, Instant occurredAt) {
        if (this.status == InterviewStatus.COMPLETED || this.status == InterviewStatus.ABORTED) {
            throw new IllegalStateException("Interview is already finished");
        }

        ScreenViolation violation = new ScreenViolation(
                java.util.UUID.randomUUID().toString(),
                type,
                count,
                occurredAt
        );

        this.violations.add(violation);
        this.domainEvents.add(new ScreenViolationDetectedEvent(
                this.id,
                type,
                count,
                occurredAt
        ));
    }

    public void startRecording() {
        ensureStatus(InterviewStatus.IN_PROGRESS);
        this.recordingSession.start();
    }

    public void saveRecording(String fileKey) {
        if (this.recordingSession == null) {
            this.recordingSession = RecordingSession.inactive();
        }
        this.recordingSession.finish(fileKey);
    }

    public void reportScreenViolation(String violationType, int count) {
        ensureStatus(InterviewStatus.IN_PROGRESS);
        this.domainEvents.add(new ScreenViolationDetectedEvent(
                this.id,
                violationType,
                count,
                Instant.now()
        ));
    }

    public void complete(InterviewScore score) {
        ensureStatus(InterviewStatus.IN_PROGRESS);
        this.score = Objects.requireNonNull(score, "Interview score cannot be null");
        this.status = InterviewStatus.COMPLETED;
        this.domainEvents.add(new InterviewCompletedEvent(
                this.id,
                this.type.name(),
                score.getValue(),
                true
        ));
    }

    public void abort() {
        ensureStatus(InterviewStatus.IN_PROGRESS);
        this.status = InterviewStatus.ABORTED;
    }

    public void abort(String reason) {
        if (this.status == InterviewStatus.COMPLETED || this.status == InterviewStatus.ABORTED) {
            return;
        }

        this.status = InterviewStatus.ABORTED;
        this.abortReason = reason;
    }

    public List<DomainEvent> pullDomainEvents() {
        List<DomainEvent> events = new ArrayList<>(this.domainEvents);
        this.domainEvents.clear();
        return events;
    }

    private void ensureStatus(InterviewStatus expectedStatus) {
        if (this.status != expectedStatus) {
            throw new IllegalStateException("Interview is not in expected status: " + expectedStatus);
        }
    }

    public InterviewId getId() {
        return id;
    }

    public String getHiringProcessId() {
        return jobId;
    }

    public String getCandidateId() {
        return candidateId;
    }

    public InterviewType getType() {
        return type;
    }

    public InterviewStatus getStatus() {
        return status;
    }

    public InterviewerProfile getInterviewerProfile() {
        return interviewerProfile;
    }

    public InterviewScore getScore() {
        return score;
    }

    public List<Question> getQuestions() {
        return List.copyOf(questions);
    }

    public List<Answer> getAnswers() {
        return List.copyOf(answers);
    }

    public List<ScreenViolation> getViolations() {
        return List.copyOf(violations);
    }

    public RecordingSession getRecordingSession() {
        return recordingSession;
    }

    public Answer submitAnswer(String questionId, String answerContent, Integer score) {
        if (this.status == InterviewStatus.COMPLETED || this.status == InterviewStatus.ABORTED) {
            throw new IllegalStateException("Interview is not active");
        }

        Answer answer = new Answer(
                java.util.UUID.randomUUID().toString(),
                questionId,
                answerContent,
                score,
                java.time.Instant.now()
        );

        this.answers.add(answer);
        return answer;
    }

    public void addNextQuestion(Question question) {
        if (question != null) {
            this.questions.add(question);
        }
    }

    public void complete() {
        this.status = InterviewStatus.COMPLETED;
    }

    public Integer getAssignedSlot() {
        return assignedSlot;
    }

    public void setAssignedSlot(Integer assignedSlot) {
        this.assignedSlot = assignedSlot;
    }

    public String getAbortReason() {
        return abortReason;
    }

    public String getPythonSessionId() {
        return pythonSessionId;
    }

    public void setPythonSessionId(String pythonSessionId) {
        this.pythonSessionId = pythonSessionId;
    }

    public String getJobId() {
        return jobId;
    }
}