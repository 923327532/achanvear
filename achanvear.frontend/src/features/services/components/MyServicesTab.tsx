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
    // RESPONSIVE: 2 columnas en celular (antes 4 fijas y se cortaban), 4 desde lg
    <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, iconClass, valueClass }) => (
        // RESPONSIVE: min-w-0 + gap-2 para que el texto no empuje al ícono fuera de la tarjeta
        <div key={label} className="min-w-0 bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-3.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] leading-tight text-gray-500 mb-0.5">{label}</p>
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 animate-pulse">
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
    // RESPONSIVE: py-12 en celular, px-4 para que el texto no toque los bordes
    <div className="w-full flex flex-col items-center justify-center px-4 py-12 sm:py-20 text-center">
      <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Plus className="w-8 h-8 text-gray-300" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">Aún no tienes servicios publicados</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs">
        Crea tu primer servicio profesional y empieza a recibir clientes.
      </p>
      {/* RESPONSIVE: botón de ancho completo en celular */}
      <button
        onClick={() => router.push("/freelancer/my-services/create")}
        className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] px-5 py-2.5 rounded-xl hover:bg-[#0EA5A0] transition-colors sm:w-auto"
      >
        <Plus className="w-4 h-4 flex-shrink-0" /> Crear mi primer servicio
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
      {/* RESPONSIVE: max-h-[90vh] overflow-y-auto, p-5 en celular */}
      <div className="relative max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-sm text-center">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-2">¿Eliminar servicio?</h3>
        <p className="text-sm text-gray-500 mb-6">
          Esta acción no se puede deshacer. El servicio será eliminado permanentemente.
        </p>
        {/* RESPONSIVE: botones apilados en celular, en fila desde sm */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
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
        // RESPONSIVE: 2 columnas desde sm, 3 solo desde xl (el sidebar deja ~700px a 1024px); gap-4 en celular
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
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