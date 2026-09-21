// features/compliance/api/legalDocumentsApi.ts
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/lib/axiosClient";
import type { LegalDocumentVersion } from "../types/compliance.types";

export const legalDocumentsApi = {
  // GET /legal-documents/{type} — documento legal público
  get: async (type: "TERMS" | "PRIVACY"): Promise<LegalDocumentVersion> => {
    const response = await api.get<ApiResponse<LegalDocumentVersion>>(
      `/legal-documents/${type.toLowerCase()}`
    );
    return parseResponse(response);
  },
};
