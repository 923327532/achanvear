package achanvear.peru.interview.infrastructure.persistence.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "interview_schedules")
public class InterviewScheduleJpaEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @Column(name = "hiring_process_id", nullable = false)
    private String hiringProcessId;

    @Column(name = "candidate_id", nullable = false)
    private String candidateId;

    @Column(name = "job_id", nullable = false)
    private String jobId;

    @Column(name = "interview_type", nullable = false)
    private String interviewType;

    @Column(name = "slot1_date_time")
    private String slot1DateTime;

    @Column(name = "slot1_status")
    private String slot1Status;

    @Column(name = "slot2_date_time")
    private String slot2DateTime;

    @Column(name = "slot2_status")
    private String slot2Status;

    @Column(name = "slot3_date_time")
    private String slot3DateTime;

    @Column(name = "slot3_status")
    private String slot3Status;

    @Column(name = "chosen_slot_index")
    private Integer chosenSlotIndex;

    @Column(name = "chosen_date_time")
    private String chosenDateTime;

    @Column(name = "interview_token")
    private String interviewToken;

    @Column(name = "token_status")
    private String tokenStatus;

    @Column(name = "status", nullable = false)
    private String status;

    public InterviewScheduleJpaEntity() {
    }

    // Getters y Setters

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getHiringProcessId() { return hiringProcessId; }
    public void setHiringProcessId(String hiringProcessId) { this.hiringProcessId = hiringProcessId; }

    public String getCandidateId() { return candidateId; }
    public void setCandidateId(String candidateId) { this.candidateId = candidateId; }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }

    public String getSlot1DateTime() { return slot1DateTime; }
    public void setSlot1DateTime(String slot1DateTime) { this.slot1DateTime = slot1DateTime; }

    public String getSlot1Status() { return slot1Status; }
    public void setSlot1Status(String slot1Status) { this.slot1Status = slot1Status; }

    public String getSlot2DateTime() { return slot2DateTime; }
    public void setSlot2DateTime(String slot2DateTime) { this.slot2DateTime = slot2DateTime; }

    public String getSlot2Status() { return slot2Status; }
    public void setSlot2Status(String slot2Status) { this.slot2Status = slot2Status; }

    public String getSlot3DateTime() { return slot3DateTime; }
    public void setSlot3DateTime(String slot3DateTime) { this.slot3DateTime = slot3DateTime; }

    public String getSlot3Status() { return slot3Status; }
    public void setSlot3Status(String slot3Status) { this.slot3Status = slot3Status; }

    public Integer getChosenSlotIndex() { return chosenSlotIndex; }
    public void setChosenSlotIndex(Integer chosenSlotIndex) { this.chosenSlotIndex = chosenSlotIndex; }

    public String getChosenDateTime() { return chosenDateTime; }
    public void setChosenDateTime(String chosenDateTime) { this.chosenDateTime = chosenDateTime; }

    public String getInterviewToken() { return interviewToken; }
    public void setInterviewToken(String interviewToken) { this.interviewToken = interviewToken; }

    public String getTokenStatus() { return tokenStatus; }
    public void setTokenStatus(String tokenStatus) { this.tokenStatus = tokenStatus; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
