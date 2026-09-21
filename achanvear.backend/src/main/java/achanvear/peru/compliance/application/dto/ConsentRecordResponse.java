package achanvear.peru.compliance.application.dto;

import achanvear.peru.compliance.domain.model.ConsentRecord;

import java.time.Instant;

public record ConsentRecordResponse(
        String id,
        String userId,
        String interviewId,
        String consentType,
        String documentVersion,
        boolean accepted,
        String status,
        Instant acceptedAt,
        Instant withdrawnAt
) {

    public static ConsentRecordResponse from(ConsentRecord record) {
        return new ConsentRecordResponse(
                record.getId().toString(),
                record.getUserId(),
                record.getInterviewId(),
                record.getType().name(),
                record.getDocumentVersion(),
                record.isAccepted(),
                record.getStatus().name(),
                record.getAcceptedAt(),
                record.getWithdrawnAt()
        );
    }
}
