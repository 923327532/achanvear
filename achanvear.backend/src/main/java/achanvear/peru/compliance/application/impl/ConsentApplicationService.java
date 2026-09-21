package achanvear.peru.compliance.application.impl;

import achanvear.peru.compliance.application.GetMyConsentsUseCase;
import achanvear.peru.compliance.application.ListConsentRecordsQuery;
import achanvear.peru.compliance.application.RecordInterviewConsentUseCase;
import achanvear.peru.compliance.application.RecordRegistrationConsentUseCase;
import achanvear.peru.compliance.application.ValidateInterviewConsentUseCase;
import achanvear.peru.compliance.application.command.ConsentListQuery;
import achanvear.peru.compliance.application.command.RecordInterviewConsentCommand;
import achanvear.peru.compliance.application.command.RecordRegistrationConsentCommand;
import achanvear.peru.compliance.application.dto.ConsentPageResponse;
import achanvear.peru.compliance.application.dto.ConsentRecordResponse;
import achanvear.peru.compliance.application.dto.InterviewConsentResponse;
import achanvear.peru.compliance.domain.model.ConsentRecord;
import achanvear.peru.compliance.domain.model.ConsentRecordId;
import achanvear.peru.compliance.domain.model.ConsentType;
import achanvear.peru.compliance.domain.model.LegalDocumentType;
import achanvear.peru.compliance.domain.model.LegalDocumentVersion;
import achanvear.peru.compliance.domain.repository.ConsentRecordRepository;
import achanvear.peru.compliance.domain.repository.LegalDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class ConsentApplicationService implements
        RecordRegistrationConsentUseCase,
        RecordInterviewConsentUseCase,
        ValidateInterviewConsentUseCase,
        ListConsentRecordsQuery,
        GetMyConsentsUseCase {

    private final ConsentRecordRepository consentRecordRepository;
    private final LegalDocumentRepository legalDocumentRepository;

    public ConsentApplicationService(
            ConsentRecordRepository consentRecordRepository,
            LegalDocumentRepository legalDocumentRepository
    ) {
        this.consentRecordRepository = consentRecordRepository;
        this.legalDocumentRepository = legalDocumentRepository;
    }

    @Override
    public void record(RecordRegistrationConsentCommand command) {
        if (!command.acceptTerms()) {
            throw new IllegalArgumentException("Debes aceptar los Términos y Condiciones para registrarte");
        }
        if (!command.acceptPrivacy()) {
            throw new IllegalArgumentException("Debes aceptar la Política de Privacidad para registrarte");
        }

        String termsVersion = resolveDocumentVersion(
                command.termsVersion(), LegalDocumentType.TERMS);
        String privacyVersion = resolveDocumentVersion(
                command.privacyVersion(), LegalDocumentType.PRIVACY);

        consentRecordRepository.save(ConsentRecord.accept(
                ConsentRecordId.generate(),
                command.userId(),
                null,
                ConsentType.REGISTRATION_TERMS,
                termsVersion
        ));
        consentRecordRepository.save(ConsentRecord.accept(
                ConsentRecordId.generate(),
                command.userId(),
                null,
                ConsentType.REGISTRATION_PRIVACY,
                privacyVersion
        ));
    }

    @Override
    public InterviewConsentResponse record(RecordInterviewConsentCommand command) {
        List<String> acceptedTypes = new ArrayList<>();

        if (command.acceptDataProcessing()) {
            consentRecordRepository.save(ConsentRecord.accept(
                    ConsentRecordId.generate(),
                    command.userId(),
                    command.interviewId(),
                    ConsentType.INTERVIEW_DATA_PROCESSING,
                    null
            ));
            acceptedTypes.add(ConsentType.INTERVIEW_DATA_PROCESSING.name());
        }

        if (command.acceptAiEvaluation()) {
            consentRecordRepository.save(ConsentRecord.accept(
                    ConsentRecordId.generate(),
                    command.userId(),
                    command.interviewId(),
                    ConsentType.INTERVIEW_AI_EVALUATION,
                    null
            ));
            acceptedTypes.add(ConsentType.INTERVIEW_AI_EVALUATION.name());
        }

        if (command.acceptRecording()) {
            consentRecordRepository.save(ConsentRecord.accept(
                    ConsentRecordId.generate(),
                    command.userId(),
                    command.interviewId(),
                    ConsentType.INTERVIEW_RECORDING,
                    null
            ));
            acceptedTypes.add(ConsentType.INTERVIEW_RECORDING.name());
        }

        boolean readyToStart = command.acceptDataProcessing() && command.acceptAiEvaluation();
        return new InterviewConsentResponse(command.interviewId(), acceptedTypes, readyToStart);
    }

    @Override
    public boolean hasValidConsent(String interviewId) {
        return consentRecordRepository.findAcceptedByInterviewIdAndType(
                        interviewId, ConsentType.INTERVIEW_DATA_PROCESSING).isPresent()
                && consentRecordRepository.findAcceptedByInterviewIdAndType(
                        interviewId, ConsentType.INTERVIEW_AI_EVALUATION).isPresent();
    }

    @Override
    public void validateOrThrow(String interviewId) {
        if (!hasValidConsent(interviewId)) {
            throw new IllegalStateException(
                    "La entrevista no puede iniciarse sin el consentimiento específico aceptado. "
                            + "Debes aceptar el tratamiento de tus datos y el uso de inteligencia artificial para la evaluación.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ConsentPageResponse list(ConsentListQuery query) {
        return ConsentPageResponse.from(consentRecordRepository.search(query)
                .map(ConsentRecordResponse::from));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConsentRecordResponse> getMyConsents(String userId) {
        return consentRecordRepository.findByUserId(userId)
                .stream()
                .map(ConsentRecordResponse::from)
                .toList();
    }

    private String resolveDocumentVersion(String providedVersion, LegalDocumentType type) {
        if (providedVersion != null && !providedVersion.isBlank()) {
            return providedVersion;
        }
        return legalDocumentRepository.findActiveVersionByType(type)
                .or(() -> legalDocumentRepository.findLatestVersionByType(type))
                .map(LegalDocumentVersion::getVersion)
                .orElse(null);
    }
}
