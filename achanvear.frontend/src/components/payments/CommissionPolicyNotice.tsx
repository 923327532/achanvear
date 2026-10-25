"use client";
import { useQuery } from "@tanstack/react-query";
import api, { parseResponse, type ApiResponse } from "@/lib/axiosClient";
export function CommissionPolicyNotice() {
  const { data, isError } = useQuery({
    queryKey: ["commission-policy"],
    queryFn: async () => parseResponse(await api.get<ApiResponse<{
      platformCommissionPercentage: number; processorCommissionPercentage: number;
      processorFixedFee: number; jobCommissionPercentage: number;
    }>>("/payments/commission-policy")),
    staleTime: 60_000,
  });
  if (!data) return <p className="text-sm">{isError ? "No se pudo consultar la politica de comisiones." : "Consultando comisiones..."}</p>;
  return <div className="space-y-2 text-sm">
    <p>Empleos: comision {data.jobCommissionPercentage}%. La publicacion depende de tu plan.</p>
    <p>Freelance: comision de plataforma {data.platformCommissionPercentage}% por hito.</p>
    <p>Procesador: {data.processorCommissionPercentage}% + S/ {Number(data.processorFixedFee).toFixed(2)} por pago.</p>
  </div>;
}
