// features/services/hooks/useExploreServices.ts
import { useQuery } from "@tanstack/react-query";
import { serviceApi } from "../api/serviceApi";
import { useServiceFiltersStore } from "../store/useServiceFiltersStore";
import api from "@/lib/axiosClient";
import type { ExploreService, FreelancerInfo } from "../types/service.types";

async function fetchFreelancerProfile(userId: string): Promise<FreelancerInfo> {
  try {
    const response = await api.get(`/freelance/profiles/${userId}`);
    const profile = response.data?.data;
    if (profile) {
      return {
        id: profile.id ?? userId,
        name: profile.name ?? "Freelancer",
        title: profile.specialty ?? profile.title ?? "",
        avatarUrl: profile.profilePhotoUrl ?? undefined,
        verified: profile.status === "ACTIVE",
      };
    }
  } catch {
    // If profile fetch fails, return default info
  }
  return {
    id: userId,
    name: "Freelancer",
    title: "",
    verified: false,
  };
}

export function useExploreServices() {
  const filters = useServiceFiltersStore((state) => state.filters);

  const query = useQuery({
    queryKey: ["services", "explore", filters],
    queryFn: async () => {
      const result = await serviceApi.explore(filters);

      // Fetch freelancer profiles for each service
      const itemsWithProfiles = await Promise.all(
        result.items.map(async (service) => {
          const freelancer = await fetchFreelancerProfile(service.freelancer.id);
          return { ...service, freelancer };
        })
      );

      return {
        ...result,
        items: itemsWithProfiles,
      };
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    services: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
