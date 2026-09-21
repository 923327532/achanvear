// features/history/components/HistoryPage.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  UserCheck,
  CreditCard,
  Star,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { historyApi } from "../api/historyApi";
import type { HistoryItem } from "../api/historyApi";

interface Props {
  companyId: string;
}

const ITEMS_PER_PAGE = 8;

const TYPE_CONFIG: Record<
  HistoryItem["type"],
  { icon: React.ElementType; label: string; color: string; bg: string }
> = {
  PROJECT: {
    icon: Briefcase,
    label: "Proyecto",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  HIRING: {
    icon: UserCheck,
    label: "Contratación",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  PAYMENT: {
    icon: CreditCard,
    label: "Pago",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  REVIEW: {
    icon: Star,
    label: "Reseña",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  PROPOSAL: {
    icon: FileText,
    label: "Propuesta",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
};

function HistorySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl" />
            <div className="flex-1">
              <div className="h-4 bg-gray-100 rounded w-48 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-64 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "COMPLETED":
      case "APPROVED":
        return "text-green-600 bg-green-50";
      case "PENDING":
      case "IN_PROGRESS":
        return "text-amber-600 bg-amber-50";
      case "REJECTED":
      case "CANCELLED":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
              {config.label}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
              {item.status}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">{item.title}</h3>
          <p className="text-xs text-gray-500 mb-2">{item.description}</p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(item.date)}
            </span>
            {item.freelancerName && (
              <span className="flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                {item.freelancerName}
              </span>
            )}
            {item.amount && (
              <span className="font-medium text-gray-600">
                S/. {item.amount.toLocaleString("es-PE")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HistoryPage({ companyId }: Props) {
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["history", companyId, page],
    queryFn: () => historyApi.getHistory(companyId, { page, size: ITEMS_PER_PAGE }),
    enabled: !!companyId,
  });

  if (!companyId) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No se encontró información de la empresa.</p>
      </div>
    );
  }

  if (isLoading) {
    return <HistorySkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <p className="text-sm text-red-500">Error al cargar el historial. Intenta nuevamente.</p>
      </div>
    );
  }

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages ?? Math.ceil(total / ITEMS_PER_PAGE);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-gray-600 mb-1">Sin historial aún</h3>
        <p className="text-xs text-gray-400">
          Aún no hay actividades registradas. Comienza publicando proyectos o contratando freelancers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">
          {total} actividades registradas
        </p>
      </div>

      {/* Lista de items con key único compuesto (id + index para evitar duplicados) */}
      {items.map((item, index) => (
        <HistoryCard key={`${item.id}-${index}`} item={item} />
      ))}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
                  page === i
                    ? "bg-[#1e3a8a] text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}