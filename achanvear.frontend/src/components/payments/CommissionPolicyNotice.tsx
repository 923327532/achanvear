"use client";
import { useQuery } from "@tanstack/react-query";
import api, { parseResponse, type ApiResponse } from "@/lib/axiosClient";
export function CommissionPolicyNotice() {
  const { data, isError } = useQuery({
    queryKey: ["commission-policy"],
    queryFn: async () => parseResponse(await api.get<ApiResponse<{
      platformCommissionPercentage: number; processorCommissionPercentage: number;
      processorFixedFee: number; jobCommissionPercentage: number;
      firstWorkExempt: boolean; tiers: { minimumInclusive: number; maximumInclusive: number | null; percentage: number }[];
    }>>("/payments/commission-policy")),
    staleTime: 60_000,
  });
  if (!data) return <p className="text-sm">{isError ? "No se pudo consultar la politica de comisiones." : "Consultando comisiones..."}</p>;
  return <div className="space-y-2 text-sm">
    <p>Empleos: comision {data.jobCommissionPercentage}%. La publicacion depende de tu plan.</p>
    <p>Proyectos y servicios: la tarifa se fija al contratar sobre el total del proyecto y se aplica a cada hito.</p>
    <ul>{(data.tiers ?? [{ minimumInclusive: 0, maximumInclusive: null, percentage: data.platformCommissionPercentage }]).map(t => <li key={t.minimumInclusive}>
      {t.maximumInclusive === null ? `Desde S/ ${t.minimumInclusive}` : `De S/ ${t.minimumInclusive} a S/ ${t.maximumInclusive}`}: {t.percentage}%
    </li>)}</ul>
    <p>Moneda de cobro: PEN. La preferencia de moneda no convierte los importes.</p>
    <p>La comision se descuenta al profesional. {data.firstWorkExempt && "El primer proyecto contratado de cada profesional esta exonerado de comision de plataforma en todos sus hitos, incluidos servicios. El procesador conserva su cargo."}</p>
    <p>Procesador: {data.processorCommissionPercentage}% + S/ {Number(data.processorFixedFee).toFixed(2)} por pago.</p>
  </div>;
}
