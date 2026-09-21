// features/services/components/ServiceEditPage.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { ServiceForm } from "./ServiceForm";
import { useUpdateService, useMyServices } from "../hooks/useMyServices";
import type { ServiceFormData } from "../types/service.types";

export function ServiceEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Busca el servicio en el cache de TanStack Query (ya fue cargado en ServicesPage)
  const { services } = useMyServices();
  const service = services.find((s) => s.id === id);

  const { updateAsync, isLoading } = useUpdateService();

  const handleSubmit = async (data: ServiceFormData, _publish: boolean) => {
    await updateAsync({ id, data });
    router.push("/freelancer/my-services");
  };

  // Servicio aún no disponible en cache — espera
  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#0EA5A0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <ServiceForm service={service} onSubmit={handleSubmit} isSubmitting={isLoading} />;
}