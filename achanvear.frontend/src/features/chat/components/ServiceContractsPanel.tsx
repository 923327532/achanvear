"use client";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { serviceContractsApi, type ServiceOffer, type ServiceContract } from "@/features/services/api/serviceContractsApi";
import { escrowApi } from "@/features/payments/api/paymentsApi";
import { CulqiCardForm } from "@/features/payments/components/CulqiCardForm";
import { CommissionPolicyNotice } from "@/components/payments/CommissionPolicyNotice";

function ContractActions({ contract, refresh }: { contract: ServiceContract; refresh: () => Promise<void> }) {
  const { user } = useAuth();
  const [paying, setPaying] = useState(false);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSaved, setReviewSaved] = useState(false);
  const milestone = useQuery({ queryKey: ["payments", "project-milestones", contract.projectId],
    queryFn: () => escrowApi.getProjectMilestones(contract.projectId), enabled: contract.status === "ACCEPTED", refetchInterval: 10000 });
  const current = milestone.data?.find(m => m.id === contract.milestoneId);
  const mutation = useMutation({ mutationFn: async (action: "accept" | "start" | "submit" | "release" | "review") => {
    if (action === "accept") await serviceContractsApi.accept(contract.id);
    if (action === "start") await escrowApi.startMilestone(contract.milestoneId);
    if (action === "submit") await escrowApi.submitMilestoneReview(contract.milestoneId);
    if (action === "release") await escrowApi.releaseMilestone(contract.milestoneId);
    if (action === "review") { await serviceContractsApi.review(contract.id, stars, comment); setReviewSaved(true); }
    await refresh(); await milestone.refetch();
  }});
  const client = user?.id === contract.clientId;
  const professional = user?.id === contract.freelancerId;
  return <div className="space-y-2 rounded-lg border p-3 text-sm">
    <p className="font-semibold">{contract.title} - {contract.planName}</p>
    <p>S/ {Number(contract.amount).toFixed(2)} / {contract.deliveryDays} dias</p>
    <p>{contract.status === "PENDING_ACCEPTANCE" ? "Pendiente de aceptacion" : contract.status === "COMPLETED" ? "Completado" : current?.status ?? "Aceptado"}</p>
    {professional && contract.status === "PENDING_ACCEPTANCE" && <button disabled={mutation.isPending} onClick={() => mutation.mutate("accept")} className="underline">Aceptar contratacion</button>}
    {professional && current?.status === "FUNDED" && <button disabled={mutation.isPending} onClick={() => mutation.mutate("start")} className="underline">Iniciar trabajo</button>}
    {professional && current?.status === "IN_PROGRESS" && <button disabled={mutation.isPending} onClick={() => mutation.mutate("submit")} className="underline">Enviar a revision</button>}
    {client && current?.status === "PENDING" && <button onClick={() => setPaying(!paying)} className="underline">Depositar S/ {Number(contract.amount).toFixed(2)}</button>}
    {client && current?.status === "READY_FOR_REVIEW" && <button disabled={mutation.isPending} onClick={() => mutation.mutate("release")} className="underline">Aprobar entrega y liberar pago</button>}
    {client && paying && current?.status === "PENDING" && <CulqiCardForm mode="charge" submitLabel={`Pagar S/ ${Number(contract.amount).toFixed(2)}`} onTokenized={async data => {
      await escrowApi.processCulqiPayment(contract.milestoneId, data); setPaying(false); await refresh(); await milestone.refetch();
    }} />}
    {client && contract.status === "COMPLETED" && <div className="flex flex-wrap gap-2">
      <select aria-label="Calificacion" value={stars} onChange={e => setStars(Number(e.target.value))}>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n} estrellas</option>)}</select>
      <input aria-label="Comentario" maxLength={1000} value={comment} onChange={e => setComment(e.target.value)} placeholder="Tu experiencia" className="rounded border p-1" />
      <button disabled={mutation.isPending} onClick={() => mutation.mutate("review")} className="underline">Guardar resena verificada</button>
      {reviewSaved && <p role="status">Resena guardada.</p>}
    </div>}
    {(mutation.isError || milestone.isError) && <p role="alert" className="text-red-600">{mutation.error?.message ?? "No se pudo consultar el hito."}</p>}
  </div>;
}

export function ServiceContractsPanel({ conversationId }: { conversationId: string }) {
  const { user } = useAuth();
  const client = user?.role === "COMPANY";
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState("");
  const keys = useRef(new Map<string, string>());
  const offers = useQuery({ queryKey: ["service-offers", conversationId], queryFn: () => serviceContractsApi.offers(conversationId) });
  const contracts = useQuery({ queryKey: ["service-contracts", conversationId], queryFn: () => serviceContractsApi.list(conversationId), refetchInterval: 10000 });
  const refresh = async () => { await queryClient.invalidateQueries({ queryKey: ["service-contracts", conversationId] }); await queryClient.invalidateQueries({ queryKey: ["payments"] }); await queryClient.invalidateQueries({ queryKey: ["services"] }); };
  const create = useMutation({ mutationFn: async (offer: ServiceOffer) => {
    const key = `${conversationId}:${offer.serviceId}:${offer.planId ?? "base"}`;
    if (!keys.current.has(key)) keys.current.set(key, crypto.randomUUID());
    await serviceContractsApi.create(conversationId, offer, keys.current.get(key)!); await refresh();
  }});
  if (!offers.data?.length && !contracts.data?.length && !offers.isError && !contracts.isError) return null;
  const chosen = offers.data?.find(o => `${o.serviceId}:${o.planId ?? "base"}` === selected);
  return <details className="max-h-96 shrink-0 overflow-y-auto border-b bg-white p-3">
    <summary className="cursor-pointer text-sm font-semibold">Contrataciones de servicios</summary>
    <div className="mt-3 space-y-3">
      {client && !!offers.data?.length && <>
        <select aria-label="Servicio y plan" value={selected} onChange={e => setSelected(e.target.value)} className="w-full rounded border p-2 text-sm">
          <option value="">Selecciona un servicio y plan</option>
          {offers.data.map(o => <option key={`${o.serviceId}:${o.planId ?? "base"}`} value={`${o.serviceId}:${o.planId ?? "base"}`}>{o.title} - {o.planName}: S/ {Number(o.amount).toFixed(2)}, {o.deliveryDays} dias</option>)}
        </select>
        <CommissionPolicyNotice />
        <button disabled={!chosen || create.isPending} onClick={() => chosen && create.mutate(chosen)} className="rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50">Formalizar contratacion</button>
      </>}
      {(create.isError || offers.isError || contracts.isError) && <p role="alert" className="text-sm text-red-600">{create.error?.message ?? "No se pudieron consultar las contrataciones."}</p>}
      {contracts.data?.map(c => <ContractActions key={c.id} contract={c} refresh={refresh} />)}
    </div>
  </details>;
}
