"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

export function useProtectedRoute() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "UNAUTHENTICATED") {
      router.replace(ROUTES.login);
    }
  }, [status, router]);
}
