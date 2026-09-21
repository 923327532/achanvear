// features/jobs/hooks/useRecommendedJobs.ts
import { useQuery } from "@tanstack/react-query";
import { jobApi } from "../api/jobApi";
import { profileApi } from "@/features/profile/api/profileApi";
import type { Job } from "../types/job.types";

export function useRecommendedJobs(limit = 4) {
  // Perfil del freelancer — usa el mismo queryKey que el resto
  // de la app para aprovechar el cache existente
  const profileQuery = useQuery({
    queryKey: ["freelancer-profile-me"],
    queryFn: () => profileApi.getMyProfile(),
    staleTime: 1000 * 60 * 5,
  });

  // Traemos más jobs de los que mostramos para poder filtrar
  const jobsQuery = useQuery({
    queryKey: ["jobs-dashboard-recommended"],
    queryFn: () =>
      jobApi.getAll({
        page: 0,
        size: 20,
        sortBy: "createdAt",
        sortDirection: "DESC",
        status: "PUBLISHED",
      }),
    staleTime: 1000 * 60 * 2,
  });

  const industry = profileQuery.data?.industry ?? null;
  const allJobs  = jobsQuery.data?.items ?? [];

  // Filtrar por industria del freelancer
  let recommended: Job[] = allJobs;

  if (industry) {
    const sameIndustry = allJobs.filter(
      (job) =>
        job.company?.industry?.toLowerCase().trim() ===
        industry.toLowerCase().trim()
    );

    // Si hay al menos 2 coincidencias mostramos solo esos,
    // si no completamos con todos para no dejar la sección vacía
    recommended = sameIndustry.length >= 2 ? sameIndustry : allJobs;
  }

  return {
    jobs:       recommended.slice(0, limit),
    industry,
    isLoading:  profileQuery.isLoading || jobsQuery.isLoading,
    // true cuando efectivamente se está filtrando por industria
    isFiltered: !!industry &&
                recommended.length > 0 &&
                recommended.length < allJobs.length,
  };
}