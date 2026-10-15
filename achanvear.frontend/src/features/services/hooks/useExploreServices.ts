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

// ─── Comentarios de un freelancer (detalle de un servicio del explorador) ─────

// Reseñas con comentario de un freelancer, de la más nueva a la más antigua. Se piden solo mientras la ventana de
// detalle está abierta (enabled) y se vuelven a pedir cada vez que se abre (sin staleTime), como hacía antes el
// useEffect de la ventana. Si la petición falla devuelve una lista vacía y la ventana sigue funcionando.
export function useFreelancerComments(freelancerUserId: string | undefined, enabled: boolean) {
  const query = useQuery({
    queryKey: ["services", "freelancer-ratings", freelancerUserId],
    queryFn: () => serviceApi.getFreelancerRatings(freelancerUserId as string),
    enabled: enabled && !!freelancerUserId,
    retry: false,
    select: (ratings) =>
      ratings
        .filter((rating) => rating.comment) // solo reseñas con comentario
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  });

  return {
    ratings: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}