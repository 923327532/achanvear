// features/payments/components/CompanyPaymentsPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AddPaymentMethodModal } from "./AddPaymentMethodModal";
import {
  Wallet,
  Lock,
  Receipt,
  Info,
  MoreHorizontal,
  CreditCard,
  Plus,
  Trash2,
  Star,
  FileText,
} from "lucide-react";

export function CompanyPaymentsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "COMPANY_COLLABORATOR") {
      router.replace("/company");
    }
  }, [user, router]);

  // ── Estado ───────────────────────────────────────────────────────────────
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [localPaymentMethods, setLocalPaymentMethods] = useState<
    { id: string; type: string; label: string; detail: string; isPrimary: boolean }[]
  >([]);

  return (
    <div className="p-8">
      {/* ═══════════════════════════════════════════════════════════════════
          ENCABEZADO
      ════════════════════════════════════════════════════════════════════ */}
      <div className="px-0 pt-0 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0a1628] tracking-tight">
              Gestión Financiera
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Administra tus pagos, fondos retenidos y comisiones
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          FILA DE 3 TARJETAS (métricas vacías - sin datos hardcodeados)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* ── Card 1: Créditos disponibles ── */}
          <div className="rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] p-5 text-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                Saldo operativo
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight">S/ 0.00</p>
            <p className="text-xs text-white/70 mt-1">Créditos disponibles</p>
          </div>

          {/* ── Card 2: Fondos retenidos ── */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                En 0 proyectos
              </span>
            </div>
            <p className="text-2xl font-bold text-[#0a1628] tracking-tight">S/ 0.00</p>
            <p className="text-xs text-slate-500 mt-1">Fondos retenidos</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Dinero bloqueado en proyectos activos
            </p>
          </div>

          {/* ── Card 3: Comisiones pagadas ── */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                0 contrataciones
              </span>
            </div>
            <p className="text-2xl font-bold text-[#0a1628] tracking-tight">S/ 0.00</p>
            <p className="text-xs text-slate-500 mt-1">Comisiones pagadas</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Costos del mes actual
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MÓDULO ESCROW
      ════════════════════════════════════════════════════════════════════ */}
      <div className="pb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">

          <div className="flex items-start gap-4 pb-6 border-b border-slate-100 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Fideicomiso (Escrow) — Proyectos Freelance
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Fondos retenidos de forma segura hasta la finalización de cada proyecto
              </p>
            </div>
          </div>

          <div className="mb-6 p-5 rounded-2xl bg-blue-50 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800">¿Cómo funciona el Escrow?</p>
                <p className="text-sm text-blue-600 mt-1 leading-relaxed">
                  Cuando contratas un freelancer, el presupuesto se retiene de forma segura.
                  El pago se libera automáticamente al freelancer cuando el proyecto es
                  aprobado. Tú tienes el control total sobre cada liberación de pago.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">No hay proyectos en escrow</p>
            <p className="text-xs text-slate-400 mt-1">
              Los proyectos aparecerán cuando contrates freelancers
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MÉTODOS DE PAGO
      ════════════════════════════════════════════════════════════════════ */}
      <div className="pb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full">

          <h3 className="text-base font-semibold text-slate-800 mb-6 uppercase tracking-wide">
            MÉTODOS DE PAGO
          </h3>

          {localPaymentMethods.length > 0 ? (
            <div className="space-y-3 mb-4">
              {localPaymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-[#f8fafc] border border-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-7 rounded flex items-center justify-center bg-white border border-slate-200 text-[10px] font-bold italic uppercase">
                      {method.type === "YAPE" ? (
                        <span className="text-purple-600 text-xs font-bold">Yape</span>
                      ) : method.type === "PLIN" ? (
                        <span className="text-blue-600 text-xs font-bold">Plin</span>
                      ) : method.type === "CARD" ? (
                        <span className="text-blue-700 text-xs font-bold italic">Visa</span>
                      ) : (
                        <CreditCard className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-900">{method.label}</p>
                      <p className="text-xs text-slate-500">{method.detail}</p>
                    </div>

                    {method.isPrimary && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Star className="w-3 h-3 mr-1" />
                        Principal
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === method.id ? null : method.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {openMenuId === method.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-slate-100 shadow-lg z-20 py-1">
                          {!method.isPrimary && (
                            <button
                              onClick={() => {
                                setLocalPaymentMethods((prev) =>
                                  prev.map((m) => ({
                                    ...m,
                                    isPrimary: m.id === method.id,
                                  }))
                                );
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <Star className="w-4 h-4 text-amber-400" />
                              Establecer como principal
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm("¿Estás seguro de eliminar este método de pago?")) {
                                setLocalPaymentMethods((prev) =>
                                  prev.filter((m) => m.id !== method.id)
                                );
                                setOpenMenuId(null);
                              }
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar cuenta
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 mb-4">
              <CreditCard className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Aún no has registrado ningún método de pago</p>
            </div>
          )}

          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowAddMethodModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#0f172a] text-white text-sm font-medium hover:bg-[#0f172a]/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Añadir método de pago
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          HISTORIAL DE FACTURACIÓN - Próximamente
      ════════════════════════════════════════════════════════════════════ */}
      <div className="pb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full">

          <h3 className="text-base font-semibold text-slate-800 mb-2 uppercase tracking-wide">
            HISTORIAL DE FACTURACIÓN
          </h3>

          <div className="mb-6">
            <p className="text-sm font-medium text-slate-700">Comisiones del Agente IA</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Achanvear cobra entre 3% y 5% de comisión sobre proyectos freelance completados.
              Las vacantes tradicionales tienen un costo fijo de S/. 150 por publicación.
            </p>
          </div>

          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">No hay historial de facturación</p>
            <p className="text-xs text-slate-400 mt-1">
              Las facturas aparecerán cuando realices pagos
            </p>
          </div>
        </div>
      </div>

      {/* ── Modal Añadir Método de Pago ── */}
      <AddPaymentMethodModal
        open={showAddMethodModal}
        onClose={() => setShowAddMethodModal(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}