// features/jobs/hooks/useCompanyDashboard.ts
import { useQuery } from "@tanstack/react-query";
import { jobApi } from "../api/jobApi";
import { profileApi } from "@/features/profile/api/profileApi";
import type { Job } from "../types/job.types";

export interface CompanyDashboardData {
  companyId: string;
  companyName: string;
  companyTradeName: string;
  companyLogoUrl: string | null;
  activeJobs: number;
  totalApplications: number;
  interviewsInProgress: number;
  finalists: number;
  recentJobs: Job[];
}

export function useCompanyDashboard(searchQuery?: string) {
  const jobsQuery = useQuery({
    queryKey: ["my-job-posts", searchQuery],
    queryFn: () => jobApi.getMyPosts({ size: 100, search: searchQuery }),
    retry: false,
  });

  const companyQuery = useQuery({
    queryKey: ["company-profile"],
    queryFn: () => profileApi.getCompanyProfile(),
    retry: false,
  });

  const isLoading = jobsQuery.isLoading || companyQuery.isLoading;
  const isError = jobsQuery.isError || companyQuery.isError;
  const error = jobsQuery.error || companyQuery.error;

  // Si no hay compañía (error 404/400), consideramos que es un usuario nuevo
  const hasCompany = companyQuery.isSuccess && !!companyQuery.data;

  const data: CompanyDashboardData | undefined = (() => {
    // Si no hay compañía, devolvemos datos por defecto
    if (!hasCompany) {
      return {
        companyId: "",
        companyName: "Mi Empresa",
        companyTradeName: "",
        companyLogoUrl: null,
        activeJobs: 0,
        totalApplications: 0,
        interviewsInProgress: 0,
        finalists: 0,
        recentJobs: [],
      };
    }

    const jobs = jobsQuery.data?.items ?? [];
    const company = companyQuery.data!;

    // El backend usa PUBLISHED en lugar de ACTIVE
    const activeJobs = jobs.filter((j) => j.status === "PUBLISHED").length;
    const totalApplications = jobs.reduce(
      (sum, j) => sum + (j.applications?.length ?? 0),
      0
    );
    const interviewsInProgress = jobs.reduce((sum, j) => {
      const reviewing = j.applications?.filter(
        (a) => a.status === "REVIEWING"
      ).length ?? 0;
      return sum + reviewing;
    }, 0);
    const finalists = jobs.reduce((sum, j) => {
      const accepted = j.applications?.filter(
        (a) => a.status === "ACCEPTED"
      ).length ?? 0;
      return sum + accepted;
    }, 0);

    return {
      companyId: company.id,
      companyName: company.businessName || "Mi Empresa",
      companyTradeName: company.tradeName || "",
      companyLogoUrl: company.logoUrl ?? null,
      activeJobs,
      totalApplications,
      interviewsInProgress,
      finalists,
      recentJobs: jobs.slice(0, 5),
    };
  })();

  const refetch = () => {
    jobsQuery.refetch();
    companyQuery.refetch();
  };

  return { data, isLoading, isError, error, hasCompany, refetch };
}