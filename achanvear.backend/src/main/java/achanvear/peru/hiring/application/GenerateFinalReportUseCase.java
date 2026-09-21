package achanvear.peru.hiring.application;


import achanvear.peru.hiring.application.dto.HiringReportResponse;

public interface GenerateFinalReportUseCase {

    HiringReportResponse execute(String jobId);
}