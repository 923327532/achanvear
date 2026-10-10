// features/freelance/components/ProjectDetailPage.tsx
"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { freelanceApi } from "../api/freelanceApi";
import type { Project } from "../types/freelance.types";
import { MercadoPagoCheckout } from "@/features/payments/components/MercadoPagoCheckout";
import { useProjectMilestones, useReleaseMilestone } from "@/features/payments/hooks/usePayments";
import type { ProjectMilestone } from "@/features/payments/types/payments.types";
import {
  ArrowLeft,
  Loader2,
  DollarSign,
  Clock,
  FolderKanban,
  Users,
  CheckCircle2,
  XCircle,
  MessageCircle,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  Send,
  Check,
  X,
  Award,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// RESPONSIVE: padding de las tarjetas de sección. 24px por lado en celular
// dejaba poco ancho útil (a 284px quedaban ~170px para el contenido).
const CARD = "bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6";

function getStatusBadge(status: string) {
  switch (status) {
    case "OPEN":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Abierto a Propuestas
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          En Progreso
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completado
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          <XCircle className="w-3.5 h-3.5" />
          Cancelado
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
          {status}
        </span>
      );
  }
}

function getMilestoneStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return <span className="text-xs font-medium text-slate-400">Pendiente</span>;
    case "FUNDED":
      return <span className="text-xs font-medium text-amber-600">Retenido en garantia</span>;
    case "IN_PROGRESS":
      return <span className="text-xs font-medium text-blue-600">En Progreso</span>;
    case "READY_FOR_REVIEW":
      return <span className="text-xs font-medium text-cyan-600">Por conformidad</span>;
    case "SUBMITTED":
      return <span className="text-xs font-medium text-amber-600">En Revisión</span>;
    case "APPROVED":
    case "RELEASED":
      return <span className="text-xs font-medium text-emerald-600">Aprobado</span>;
    case "REFUNDED":
      return <span className="text-xs font-medium text-red-600">Reembolsado</span>;
    case "DISPUTED":
      return <span className="text-xs font-medium text-purple-600">En disputa</span>;
    case "REJECTED":
      return <span className="text-xs font-medium text-red-600">Rechazado</span>;
    default:
      return <span className="text-xs font-medium text-slate-400">{status}</span>;
  }
}

function formatBudget(amount: number) {
  return `S/. ${amount.toLocaleString("es-PE")}`;
}

// FIX: Math.max(0, ...). Para algo creado hace segundos, diff puede salir
// ligeramente negativo (diferencia de reloj navegador/servidor) y
// Math.floor() de un negativo pequeño da -1 → "Hace -1 días".
function formatRelativeDate(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem.`;
  return date.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Proposal Card ────────────────────────────────────────────────────────────

function getPaymentStepLabel(index: number) {
  if (index === 0) return "20% inicial";
  if (index === 1) return "50% en una semana";
  return "30% saldo final";
}

function PaymentMilestoneCard({
  milestone,
  index,
  projectTitle,
  onRelease,
  isReleasing,
  onChanged,
}: {
  milestone: ProjectMilestone;
  index: number;
  projectTitle: string;
  onRelease: (milestoneId: string) => void;
  isReleasing: boolean;
  onChanged: () => void;
}) {
  const canPay = milestone.status === "PENDING";
  const canRelease = milestone.status === "READY_FOR_REVIEW";

  return (
    // RESPONSIVE: min-w-0 para que la tarjeta no desborde su columna
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {getPaymentStepLabel(index)}
            </span>
            {getMilestoneStatusBadge(milestone.status)}
          </div>
          <h4 className="break-words text-sm font-bold text-slate-900">{milestone.title}</h4>
          <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">{milestone.description}</p>
          <p className="mt-2 break-words text-lg font-bold text-emerald-700">{formatBudget(milestone.amount)}</p>
        </div>

        {canRelease && (
          <button
            onClick={() => onRelease(milestone.id)}
            disabled={isReleasing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50 lg:shrink-0"
          >
            {isReleasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Dar conformidad
          </button>
        )}
      </div>

      {canPay && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <MercadoPagoCheckout
            milestoneId={milestone.id}
            projectId={milestone.projectId}
            freelancerUserId={milestone.freelancerUserId}
            amount={milestone.amount}
            projectName={projectTitle}
            description={milestone.title}
            onSuccess={onChanged}
          />
        </div>
      )}
    </div>
  );
}

function ProposalCard({
  proposal,
  projectStatus,
  onAccept,
  isAccepting,
}: {
  proposal: Project["proposals"][0];
  projectStatus: string;
  onAccept: () => void;
  isAccepting: boolean;
}) {
  // RESPONSIVE: antes el avatar ocupaba una columna fija y el texto, el
  // presupuesto y el botón quedaban en ~85px a la derecha. Ahora el avatar y
  // el nombre van arriba, y el resto ocupa todo el ancho de la tarjeta en
  // celular; desde sm vuelve a quedar alineado bajo el nombre (sm:pl-16).
  return (
    <div className="min-w-0 bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {proposal.freelancerUserId.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="break-words text-sm font-bold text-slate-900">
                Freelancer #{proposal.freelancerUserId.slice(0, 8)}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {formatRelativeDate(proposal.submittedAt)}
                </span>
              </div>
            </div>

            {proposal.status === "ACCEPTED" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-3 h-3" />
                Aceptada
              </span>
            )}
            {proposal.status === "REJECTED" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                <X className="w-3 h-3" />
                Rechazada
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 sm:pl-16">
        <p className="text-sm text-slate-600 mb-3 line-clamp-3 break-words">{proposal.coverLetter}</p>

        <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-900">{formatBudget(proposal.proposedBudget)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-700">{proposal.estimatedDays} días</span>
          </div>
        </div>

        {projectStatus === "OPEN" && proposal.status === "SUBMITTED" && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={onAccept}
              disabled={isAccepting}
              className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl hover:from-emerald-500 hover:to-teal-400 transition-all disabled:opacity-50 sm:w-auto"
            >
              {isAccepting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Aceptar Propuesta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Milestone Card ───────────────────────────────────────────────────────────

function MilestoneCard({
  milestone,
  index,
}: {
  milestone: Project["milestones"][0];
  index: number;
}) {
  const statusColors: Record<string, string> = {
    PENDING: "border-slate-200 bg-slate-50",
    IN_PROGRESS: "border-blue-200 bg-blue-50",
    SUBMITTED: "border-amber-200 bg-amber-50",
    APPROVED: "border-emerald-200 bg-emerald-50",
    REJECTED: "border-red-200 bg-red-50",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    PENDING: <div className="w-3 h-3 rounded-full border-2 border-slate-300" />,
    IN_PROGRESS: <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />,
    SUBMITTED: <AlertCircle className="w-3.5 h-3.5 text-amber-500" />,
    APPROVED: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    REJECTED: <XCircle className="w-3.5 h-3.5 text-red-500" />,
  };

  return (
    <div className={`min-w-0 rounded-xl border p-4 ${statusColors[milestone.status] || "border-slate-200"}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {statusIcons[milestone.status] || statusIcons.PENDING}
        </div>
        <div className="flex-1 min-w-0">
          {/* RESPONSIVE: título + monto en una fila se pisaban en celular;
              ahora pueden pasar a otra línea. */}
          <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
            <h4 className="min-w-0 break-words text-sm font-semibold text-slate-900">
              Hito {index + 1}: {milestone.title}
            </h4>
            <span className="text-sm font-bold text-emerald-700 shrink-0">
              {formatBudget(milestone.amount)}
            </span>
          </div>
          <p className="break-words text-xs text-slate-500 mt-0.5">{milestone.description}</p>
          <div className="mt-1.5">
            {getMilestoneStatusBadge(milestone.status)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md">
        <div className="h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Error al cargar el proyecto</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#1e3a8a] rounded-xl hover:bg-[#1e3a8a]/90 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Mis Proyectos
        </button>
      </div>
    </div>
  );
}

// ─── Project Detail Page ──────────────────────────────────────────────────────

export function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.projectId as string;
  const paymentMilestonesQuery = useProjectMilestones(projectId);
  const releaseMilestoneMutation = useReleaseMilestone();

  const projectQuery = useQuery({
    queryKey: ["company-project", projectId],
    queryFn: () => freelanceApi.getById(projectId),
    retry: false,
    enabled: !!projectId,
  });

  const acceptMutation = useMutation({
    mutationFn: (proposalId: string) =>
      freelanceApi.acceptProposal(projectId, proposalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["payments", "project-milestones", projectId] });
    },
  });

  const handleAcceptProposal = (proposalId: string) => {
    if (!confirm("¿Estás seguro de aceptar esta propuesta? Las demás propuestas serán rechazadas automáticamente.")) return;
    acceptMutation.mutate(proposalId);
  };

  const handleReleaseMilestone = async (milestoneId: string) => {
    if (!confirm("Confirma solo si la entrega esta conforme. Se liberara el pago neto al profesional descontando la comision de la app.")) return;
    await releaseMilestoneMutation.releaseAsync(milestoneId);
    queryClient.invalidateQueries({ queryKey: ["payments", "project-milestones", projectId] });
    queryClient.invalidateQueries({ queryKey: ["company-project", projectId] });
  };

  const project = projectQuery.data;
  const isLoading = projectQuery.isLoading;
  const isError = projectQuery.isError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <ErrorState
        message={projectQuery.error instanceof Error ? projectQuery.error.message : "No se pudo cargar el proyecto"}
        onBack={() => router.push("/company/projects")}
      />
    );
  }

  const proposalsCount = project.proposals?.length ?? 0;
  const submittedProposals = project.proposals?.filter((p) => p.status === "SUBMITTED").length ?? 0;
  const milestonesTotal = project.milestones?.length ?? 0;
  const milestonesApproved = project.milestones?.filter((m) => m.status === "APPROVED").length ?? 0;
  const progress = milestonesTotal > 0 ? Math.round((milestonesApproved / milestonesTotal) * 100) : 0;
  const totalPaid = project.milestones?.filter((m) => m.status === "APPROVED").reduce((sum, m) => sum + m.amount, 0) ?? 0;
  const paymentMilestones = paymentMilestonesQuery.milestones;
  const escrowTotal = paymentMilestones.reduce((sum, milestone) => sum + milestone.amount, 0);
  const escrowReleased = paymentMilestones
    .filter((milestone) => milestone.status === "RELEASED")
    .reduce((sum, milestone) => sum + milestone.amount, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        href="/company/projects"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Mis Proyectos
      </Link>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="min-w-0 break-words text-2xl font-bold text-slate-900">{project.title}</h1>
              {getStatusBadge(project.status)}
            </div>
            <p className="break-words text-sm text-slate-600 leading-relaxed">{project.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
            <FolderKanban className="w-3.5 h-3.5" />
            {project.category}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
            <DollarSign className="w-3.5 h-3.5" />
            Presupuesto: {formatBudget(project.budget)}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
            <Clock className="w-3.5 h-3.5" />
            {project.estimatedDays} días estimados
          </span>
        </div>

        {/* RESPONSIVE: grid-cols-4 fijo dejaba ~55px por dato y "Propuestas"
            se pisaba con "Por Revisar". 2x2 en celular, 4 en fila desde sm. */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Propuestas</p>
            <p className="text-lg font-bold text-slate-900">{proposalsCount}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Por Revisar</p>
            <p className="text-lg font-bold text-amber-700">{submittedProposals}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Hitos</p>
            <p className="text-lg font-bold text-slate-900">{milestonesTotal}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Pagado</p>
            <p className="break-words text-lg font-bold text-emerald-700">{formatBudget(totalPaid)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="min-w-0 lg:col-span-2 space-y-6">
          <div className={CARD}>
            <h2 className="text-lg font-bold text-slate-900 flex flex-wrap items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-600" />
              Propuestas Recibidas
              {submittedProposals > 0 && (
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  {submittedProposals} sin revisar
                </span>
              )}
            </h2>

            {project.proposals.length === 0 ? (
              <div className="text-center py-10">
                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">Aún no hay propuestas para este proyecto</p>
                <p className="text-xs text-slate-400 mt-1">Los freelancers enviarán sus propuestas cuando encuentren el proyecto</p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.proposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    projectStatus={project.status}
                    onAccept={() => handleAcceptProposal(proposal.id)}
                    isAccepting={acceptMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>

          {project.status === "IN_PROGRESS" && project.milestones.length > 0 && (
            <div className={CARD}>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-amber-600" />
                Hitos y Entregables
              </h2>

              <div className="space-y-3">
                {project.milestones.map((milestone, index) => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {project.status === "IN_PROGRESS" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <CreditCard className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                    Plan de pagos protegido
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    El proyecto se cobra en 20%, 50% y saldo final. Cada pago queda retenido hasta tu conformidad.
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 px-4 py-3 sm:flex-shrink-0 sm:text-right">
                  <p className="text-xs font-medium text-emerald-700">Liberado al profesional</p>
                  <p className="text-lg font-bold text-emerald-900">
                    {formatBudget(escrowReleased)} / {formatBudget(escrowTotal)}
                  </p>
                </div>
              </div>

              {paymentMilestonesQuery.isLoading ? (
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando plan de pagos...
                </div>
              ) : paymentMilestones.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                  Acepta una propuesta para generar el plan de pagos 20/50/30.
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMilestones.map((milestone, index) => (
                    <PaymentMilestoneCard
                      key={milestone.id}
                      milestone={milestone}
                      index={index}
                      projectTitle={project.title}
                      onRelease={handleReleaseMilestone}
                      isReleasing={releaseMilestoneMutation.isLoading}
                      onChanged={() => {
                        paymentMilestonesQuery.refetch();
                        queryClient.invalidateQueries({ queryKey: ["company-project", projectId] });
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-6">
          {project.status === "IN_PROGRESS" && (
            <div className={CARD}>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Progreso del Proyecto
              </h3>

              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-slate-600">Completado</span>
                  <span className="font-bold text-slate-900">{progress}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-teal-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Hitos aprobados</span>
                  <span className="font-semibold text-slate-700">{milestonesApproved} / {milestonesTotal}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Total pagado</span>
                  <span className="font-semibold text-emerald-700">{formatBudget(totalPaid)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Presupuesto total</span>
                  <span className="font-semibold text-slate-700">{formatBudget(project.budget)}</span>
                </div>
              </div>
            </div>
          )}

          <div className={CARD}>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Información del Proyecto</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <FolderKanban className="w-4 h-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-slate-500 text-xs">Categoría</p>
                  <p className="break-words font-medium text-slate-700">{project.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-slate-500 text-xs">Presupuesto</p>
                  <p className="font-medium text-slate-700">{formatBudget(project.budget)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-slate-500 text-xs">Duración estimada</p>
                  <p className="font-medium text-slate-700">{project.estimatedDays} días</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-slate-500 text-xs">Propuestas</p>
                  <p className="font-medium text-slate-700">{proposalsCount} recibidas</p>
                </div>
              </div>
            </div>
          </div>

          {project.status === "OPEN" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-emerald-800">Proyecto Publicado</h4>
                  <p className="text-xs text-emerald-600 mt-1">
                    Los freelancers pueden ver y enviar propuestas. Revisa las propuestas y selecciona al mejor candidato.
                  </p>
                </div>
              </div>
            </div>
          )}

          {project.status === "IN_PROGRESS" && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-blue-800">Proyecto en Ejecución</h4>
                  <p className="text-xs text-blue-600 mt-1">
                    El freelancer seleccionado está trabajando. Revisa los hitos y libera pagos conforme se completen las entregas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {project.status === "COMPLETED" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-emerald-800">Proyecto Completado</h4>
                  <p className="text-xs text-emerald-600 mt-1">
                    Todos los hitos han sido aprobados y el proyecto ha sido finalizado exitosamente.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}