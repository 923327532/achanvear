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
  activeJobs: number | null;
  totalApplications: number | null;
  interviewsInProgress: number | null;
  finalists: number | null;
  recentJobs: Job[];
}

export function useCompanyDashboard(searchQuery?: string) {
  const jobsQuery = useQuery({
    queryKey: ["my-job-posts", searchQuery],
    queryFn: () => jobApi.getMyPosts({ size: 100, search: searchQuery }),
    retry: false,
  });

  const statsQuery = useQuery({
    queryKey: ["company-hiring-stats"],
    queryFn: () => jobApi.getCompanyHiringStats(),
    retry: false,
  });

  const companyQuery = useQuery({
    queryKey: ["company-profile"],
    queryFn: () => profileApi.getCompanyProfile(),
    retry: false,
  });

  const isLoading = jobsQuery.isLoading || statsQuery.isLoading || companyQuery.isLoading;
  const isError = jobsQuery.isError || statsQuery.isError || companyQuery.isError;
  const error = jobsQuery.error || statsQuery.error || companyQuery.error;

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
    const activeRecentJobs = jobs.filter((job) => job.status === "PUBLISHED");
    const company = companyQuery.data!;

    // El backend usa PUBLISHED en lugar de ACTIVE
    const stats = statsQuery.data;

    return {
      companyId: company.id,
      companyName: company.businessName || "Mi Empresa",
      companyTradeName: company.tradeName || "",
      companyLogoUrl: company.logoUrl ?? null,
      activeJobs: stats?.activeJobs ?? null,
      totalApplications: stats?.totalApplications ?? null,
      interviewsInProgress: stats?.interviewsInProgress ?? null,
      finalists: stats?.finalists ?? null,
      recentJobs: activeRecentJobs.slice(0, 12),
    };
  })();

  const refetch = () => {
    jobsQuery.refetch();
    statsQuery.refetch();
    companyQuery.refetch();
  };

  return {
    data,
    isLoading,
    isError,
    error,
    hasCompany,
    statsError: statsQuery.isError,
    refetch,
  };
}
