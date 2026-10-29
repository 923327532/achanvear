// features/payments/hooks/useEscrowRecords.ts
import { useQuery } from "@tanstack/react-query";
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type { EscrowRecord } from "../types/escrow-record.types";

export function useEscrowRecords() {
  const query = useQuery({
    queryKey: ["payments", "escrow", "records"],
    queryFn: async () => parseResponse(await api.get<ApiResponse<EscrowRecord[]>>("/payments/escrow")),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    escrows: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}