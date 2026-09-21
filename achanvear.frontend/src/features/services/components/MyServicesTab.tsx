// features/services/components/MyServicesTab.tsx
"use client";

import { useState } from "react";
import { Plus, Loader2, Trash2, CheckCircle, DollarSign, Star, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMyServices, useServiceStats, useDeleteService } from "../hooks/useMyServices";
import { ServiceCard } from "./ServiceCard";
import { ServiceDetailModal } from "./ServiceDetailModal";
import type { Service } from "../types/service.types";

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const { stats, isLoading } = useServiceStats();

  const safeStats = stats ?? { activeServices: 0, totalSales: 0, averageRating: 0, totalViews: 0 };

  const cards = [
    { label: "Servicios Activos", value: safeStats.activeServices, icon: CheckCircle, iconClass: "bg-teal-50 text-[#0EA5A0]", valueClass: "text-[#1B3A6B]" },
    { label: "Total Ventas", value: safeStats.totalSales, icon: DollarSign, iconClass: "bg-emerald-50 text-emerald-600", valueClass: "text-emerald-600" },
    { label: "Calificación", value: safeStats.averageRating.toFixed(1), icon: Star, iconClass: "bg-amber-50 text-amber-500", valueClass: "text-amber-500" },
    { label: "Vistas Totales", value: safeStats.totalViews, icon: Eye, iconClass: "bg-blue-50 text-blue-500", valueClass: "text-blue-600" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {cards.map(({ label, value, icon: Icon, iconClass, valueClass }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 mb-0.5">{label}</p>
            {isLoading ? (
              <div className="h-7 w-10 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
            )}
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconClass}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-5 bg-gray-100 rounded-full w-16" />
        <div className="h-5 bg-gray-100 rounded-full w-20" />
      </div>
      <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-full mb-1" />
      <div className="h-4 bg-gray-100 rounded w-5/6 mb-6" />
      <div className="h-px bg-gray-100 mb-4" />
      <div className="flex justify-between mb-4">
        <div className="h-7 bg-gray-100 rounded w-20" />
        <div className="h-5 bg-gray-100 rounded w-16" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-gray-100 rounded-xl" />
        <div className="flex-1 h-9 bg-gray-100 rounded-xl" />
        <div className="w-9 h-9 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  const router = useRouter();
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Plus className="w-8 h-8 text-gray-300" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">Aún no tienes servicios publicados</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs">
        Crea tu primer servicio profesional y empieza a recibir clientes.
      </p>
      <button
        onClick={() => router.push("/freelancer/my-services/create")}
        className="flex items-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] px-5 py-2.5 rounded-xl hover:bg-[#0EA5A0] transition-colors"
      >
        <Plus className="w-4 h-4" /> Crear mi primer servicio
      </button>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirmDialog({
  serviceId,
  onCancel,
  onConfirm,
  isDeleting,
}: {
  serviceId: string;
  onCancel: () => void;
  onConfirm: (id: string) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-2">¿Eliminar servicio?</h3>
        <p className="text-sm text-gray-500 mb-6">
          Esta acción no se puede deshacer. El servicio será eliminado permanentemente.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(serviceId)}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-red-500 rounded-xl py-2.5 hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MyServicesTab() {
  const { services, isLoading } = useMyServices();
  const { removeAsync, isLoading: isDeleting } = useDeleteService();

  const [viewModal, setViewModal] = useState<{ open: boolean; service: Service | null }>({
    open: false,
    service: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await removeAsync(id);
    setDeleteConfirm(null);
  };

  return (
    <>
      <StatsBar />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onView={(s) => setViewModal({ open: true, service: s })}
              onDelete={(s) => setDeleteConfirm(s.id)}
              isDeleting={isDeleting && deleteConfirm === service.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      <ServiceDetailModal
        open={viewModal.open}
        service={viewModal.service}
        onClose={() => setViewModal({ open: false, service: null })}
      />

      {deleteConfirm && (
        <DeleteConfirmDialog
          serviceId={deleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}