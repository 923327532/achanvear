"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/constants";
import { Alert } from "@/shared/components/ui/Alert";

const MISSING_PREFIX = "/api/v1";

export function BackendStatusBanner() {
  const [message, setMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<"error" | "info">("info");

  useEffect(() => {
    const hasPrefix = API_BASE_URL.includes(MISSING_PREFIX);

    if (!hasPrefix) {
      setSeverity("error");
      setMessage(
        `La URL del backend debe incluir ${MISSING_PREFIX}. Ajusta NEXT_PUBLIC_API_URL a http://localhost:8080${MISSING_PREFIX}`
      );
      return;
    }

    setMessage(null);
  }, []);

  if (!message) {
    return null;
  }

  return <Alert title="Backend" message={message} variant={severity} />;
}