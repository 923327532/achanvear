// features/services/hooks/useExploreServices.ts
import { useQuery } from "@tanstack/react-query";
import { serviceApi } from "../api/serviceApi";
import { useServiceFiltersStore } from "../store/useServiceFiltersStore";

export function useExploreServices() {
  const filters = useServiceFiltersStore((state) => state.filters);

  const query = useQuery({
    queryKey: ["services", "explore", filters],
    queryFn: async () => {
      const result = await serviceApi.explore(filters);

      return {
        ...result,
        items: result.items.map((service) => ({
          ...service,
          freelancer: {
            ...service.freelancer,
            name: service.freelancer.name || "Freelancer",
          },
        })),
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
