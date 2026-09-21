package achanvear.peru.hiring.domain.factory;

import achanvear.peru.hiring.domain.model.HiringConfig;
import achanvear.peru.hiring.domain.model.HiringProcess;
import achanvear.peru.hiring.domain.model.HiringProcessId;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class HiringProcessFactory {

    public HiringProcess create(String jobId, String candidateId) {
        Objects.requireNonNull(jobId, "Job id cannot be null");
        Objects.requireNonNull(candidateId, "Candidate id cannot be null");

        return HiringProcess.create(
                HiringProcessId.newId(),
                jobId,
                candidateId,
                HiringConfig.defaultConfig()
        );
    }
}