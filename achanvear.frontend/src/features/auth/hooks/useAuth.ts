//hooks/useAuth.ts
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";
import { ROUTES } from "@/lib/constants";

export const useAuth = () => {
  const context = useAuthContext();
  const router = useRouter();

  const logout = useCallback(() => {
    context.logout();
    router.replace(ROUTES.login);
  }, [context, router]);

  return {
    ...context,
    logout,
  };
};
