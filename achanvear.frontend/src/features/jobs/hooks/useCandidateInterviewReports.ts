import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { candidateDrawerApi } from "../api/candidateDrawerApi";
import { downloadInterviewReportPdf } from "@/features/interview/lib/interviewReportPdf";
import type { InterviewReportResponse } from "@/features/interview/types/interview.types";

export interface CandidateReportContext {
  jobId: string;
  applicationId: string;
  candidateName: string;
  jobTitle?: string;
}

export function useCandidateInterviewReports(context: CandidateReportContext) {
  const { jobId, applicationId, candidateName, jobTitle } = context;
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const query = useQuery({
    queryKey: ["company-interview-reports", jobId, applicationId],
    queryFn: () => candidateDrawerApi.getInterviewReports(jobId, applicationId),
    enabled: Boolean(jobId && applicationId),
    refetchInterval: 15_000,
  });

  const download = async (reports: InterviewReportResponse[]) => {
    if(downloading || reports.length === 0) return;
    setDownloading(true);
    setDownloadError("");
    try {
      await downloadInterviewReportPdf({ candidateName, jobTitle, reports });
    } catch {
      setDownloadError("No se pudo generar el PDF. Vuelve a intentarlo.");
    } finally {
      setDownloading(false);
    }
  };

  return { query, download, downloading, downloadError };
}
