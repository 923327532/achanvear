package achanvear.peru.hiring.infrastructure.persistence;

import achanvear.peru.hiring.domain.model.HiringConfig;
import achanvear.peru.hiring.domain.model.HiringProcess;
import achanvear.peru.hiring.domain.model.HiringProcessId;
import achanvear.peru.hiring.domain.model.HiringStage;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class HiringProcessMapper {

    private static final String LIST_SEPARATOR = ",";

    public HiringProcessJpaEntity toEntity(HiringProcess hiringProcess) {
        return new HiringProcessJpaEntity(
                hiringProcess.getId().toString(),
                hiringProcess.getJobId(),
                hiringProcess.getCandidateId(),
                hiringProcess.getStage().name(),
                hiringProcess.getConfig().getTheoryInterviewPassScore(),
                hiringProcess.getConfig().getTechnicalInterviewPassScore(),
                hiringProcess.getConfig().getMaxCandidatesPerScreeningRequest(),
                hiringProcess.isTheoryInterviewIdUsed(),
                hiringProcess.isTechnicalInterviewIdUsed(),
                serializeList(hiringProcess.getSelectedCandidates()),
                serializeList(hiringProcess.getRejectedCandidates()),
                serializeList(hiringProcess.getScheduleIds()),
                hiringProcess.getFinalReport()
        );
    }

    public HiringProcess toDomain(HiringProcessJpaEntity entity) {
        HiringProcess process = new HiringProcess(
                HiringProcessId.of(entity.getId()),
                entity.getJobId(),
                entity.getCandidateId(),
                HiringStage.valueOf(entity.getStage()),
                new HiringConfig(
                        entity.getTheoryInterviewPassScore(),
                        entity.getTechnicalInterviewPassScore(),
                        entity.getMaxCandidatesPerScreeningRequest()
                )
        );
        // Restaurar estado de IDs de un solo uso
        if (entity.getTheoryInterviewIdUsed() != null && entity.getTheoryInterviewIdUsed()) {
            process.markTheoryInterviewIdAsUsed();
        }
        if (entity.getTechnicalInterviewIdUsed() != null && entity.getTechnicalInterviewIdUsed()) {
            process.markTechnicalInterviewIdAsUsed();
        }
        // Restaurar campos de seguimiento
        deserializeList(entity.getSelectedCandidates()).forEach(process::addSelectedCandidate);
        deserializeList(entity.getRejectedCandidates()).forEach(process::addRejectedCandidate);
        deserializeList(entity.getScheduleIds()).forEach(process::addScheduleId);
        if (entity.getFinalReport() != null) {
            process.setFinalReport(entity.getFinalReport());
        }
        return process;
    }

    private String serializeList(List<String> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        return String.join(LIST_SEPARATOR, list);
    }

    private List<String> deserializeList(String value) {
        if (value == null || value.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(value.split(LIST_SEPARATOR))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
