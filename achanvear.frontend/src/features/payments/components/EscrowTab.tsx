// features/payments/components/EscrowTab.tsx
"use client";

import { Shield, Loader2, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useEscrowProjects, useReleaseMilestone, useRefundMilestone } from "../hooks/usePayments";
import { MILESTONE_STATUS_CONFIG } from "../types/payments.types";

export function EscrowTab() {
  const { projects, isLoading } = useEscrowProjects();
  const { releaseAsync, isLoading: isReleasing } = useReleaseMilestone();
  const { refundAsync, isLoading: isRefunding } = useRefundMilestone();

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="text-sm text-gray-400">No tienes proyectos en escrow actualmente</p>
        <p className="text-xs text-gray-300 mt-1">
          Los proyectos aparecerán cuando contrates o te contraten
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const statusConfig = MILESTONE_STATUS_CONFIG[project.status];

        return (
          <div
            key={project.id}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-[#1B3A6B] truncate">
                    {project.title}
                  </h3>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Cliente: {project.client}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    Progreso:{" "}
                    <span className="font-semibold text-gray-700">
                      Hito {project.currentMilestone} de {project.totalMilestones}
                    </span>
                  </span>
                  {project.estimatedRelease && (
                    <span>
                      Liberación estimada:{" "}
                      <span className="font-semibold text-gray-700">
                        {new Date(project.estimatedRelease).toLocaleDateString("es-PE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-amber-500 justify-end mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-lg font-bold">
                    S/. {project.escrowAmount.toLocaleString("es-PE")}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">En Fideicomiso</p>

                <div className="flex items-center gap-2 justify-end">
                  {project.status === "HELD" && (
                    <>
                      <button
                        onClick={() => releaseAsync(project.id)}
                        disabled={isReleasing}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1B3A6B] px-3 py-1.5 rounded-xl hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
                      >
                        {isReleasing && <Loader2 className="w-3 h-3 animate-spin" />}
                        <CheckCircle className="w-3 h-3" />
                        Liberar fondos
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Motivo del reembolso:");
                          if (reason) refundAsync({ milestoneId: project.id, reason });
                        }}
                        disabled={isRefunding}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-500 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {isRefunding && <Loader2 className="w-3 h-3 animate-spin" />}
                        Reembolsar
                      </button>
                    </>
                  )}
                  {project.status === "DISPUTED" && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl">
                      <AlertTriangle className="w-3 h-3" />
                      En revisión
                    </span>
                  )}
                  {project.status === "RELEASED" && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                      <CheckCircle className="w-3 h-3" />
                      Liberado
                    </span>
                  )}
                  {project.status === "REFUNDED" && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-xl">
                      <Clock className="w-3 h-3" />
                      Reembolsado
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#1B3A6B] to-[#0EA5A0] rounded-full transition-all duration-500"
                  style={{
                    width: `${(project.currentMilestone / project.totalMilestones) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
