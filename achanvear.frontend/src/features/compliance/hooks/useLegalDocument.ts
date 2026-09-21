// features/compliance/hooks/useLegalDocument.ts
import { useQuery } from "@tanstack/react-query";
import { legalDocumentsApi } from "../api/legalDocumentsApi";

export function useLegalDocument(type: "TERMS" | "PRIVACY") {
  return useQuery({
    queryKey: ["legal-document", type],
    queryFn: () => legalDocumentsApi.get(type),
    retry: 1,
  });
}
