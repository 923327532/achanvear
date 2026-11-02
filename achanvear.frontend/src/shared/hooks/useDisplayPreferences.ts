"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/providers/AuthProvider";
import api, { parseResponse, type ApiResponse } from "@/lib/axiosClient";
import { saveDisplayPreferences } from "@/lib/displayPreferences";

export function useDisplayPreferences() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: ["display-preferences", user?.id],
    enabled: !!user?.id,
    staleTime: 300_000,
    queryFn: async () => {
      const path = ["COMPANY", "COMPANY_COLLABORATOR"].includes(user!.role) ? "/companies/preferences" : "/freelance/profiles/me";
      const result = parseResponse(await api.get<ApiResponse<{ language?: string; timezone?: string }>>(path));
      saveDisplayPreferences(result.language, result.timezone);
      return result;
    },
  });
}
