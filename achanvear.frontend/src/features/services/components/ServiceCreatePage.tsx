// features/services/components/ServiceCreatePage.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ServiceForm } from "./ServiceForm";
import { useCreateService } from "../hooks/useMyServices";
import { profileApi } from "@/features/profile/api/profileApi";
import type { ServiceFormData } from "../types/service.types";

export function ServiceCreatePage() {
  const router = useRouter();
  const { createAsync, isLoading } = useCreateService();
  const [freelancerProfile, setFreelancerProfile] = useState<{
    name: string;
    headline: string;
    location: string;
    whatsapp?: string;
    phone?: string;
    email?: string;
    portfolioUrl?: string;
    skills?: string[];
  } | undefined>(undefined);

  // Cargar perfil del freelancer para precargar datos
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await profileApi.getMyProfile();
        setFreelancerProfile({
          name: profile.name || "",
          headline: profile.headline || "",
          location: profile.location || "",
          whatsapp: undefined,
          phone: undefined,
          email: undefined, // No hay email en el perfil actual
          portfolioUrl: profile.portfolioItems?.[0]?.projectUrl || undefined,
          skills: profile.skills?.map(s => s.name) || [],
        });
      } catch {
        // Si falla la carga del perfil, continuamos sin datos precargados
        console.warn("No se pudo cargar el perfil del freelancer");
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (data: ServiceFormData, publish: boolean) => {
    await createAsync({ data, publish });
    router.push("/freelancer/my-services");
  };

  return (
    <ServiceForm
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
      freelancerProfile={freelancerProfile}
    />
  );
}