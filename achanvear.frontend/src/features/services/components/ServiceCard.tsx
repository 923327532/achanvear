// features/services/components/ServiceCard.tsx
"use client";

import { Eye, Star, ShoppingBag, Clock, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ServiceStatusBadge } from "./ServiceStatusBadge";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "../types/service.types";
import type { Service } from "../types/service.types";

interface Props {
  service: Service;
  onView: (service: Service) => void;
  onDelete: (service: Service) => void;
  isDeleting?: boolean;
}

export function ServiceCard({ service, onView, onDelete, isDeleting }: Props) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden w-full">

      {/* Image */}
      {service.imageUrls && service.imageUrls.length > 0 ? (
        <div className="w-full h-24 overflow-hidden flex-shrink-0">
          <img
            src={service.imageUrls[0]}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-24 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-gray-300 text-[10px]">Sin imagen</span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-3">

        {/* Status + category */}
        <div className="flex items-center justify-between mb-1.5">
          <ServiceStatusBadge status={service.status} />
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[service.category]}`}>
            {CATEGORY_LABELS[service.category]}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[#1B3A6B] text-xs leading-snug mb-1 line-clamp-2">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2 mb-1.5 flex-1">
          {service.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1.5">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" /> {service.views}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {service.rating > 0 ? `${service.rating} (${service.reviewCount})` : "Sin reseñas"}
          </span>
          <span className="flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" /> {service.sales} ventas
          </span>
        </div>

        <div className="border-t border-gray-100 pt-2">
          {/* Price + delivery */}
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-[9px] text-gray-400 mb-0.5">Precio desde</p>
              <p className="text-sm font-bold text-[#1B3A6B]">
                S/. {service.basePrice.toLocaleString("es-PE")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-gray-400 mb-0.5">Entrega en</p>
              <p className="text-[11px] font-medium text-gray-600 flex items-center gap-1 justify-end">
                <Clock className="w-2.5 h-2.5 text-gray-400" />
                {service.deliveryDays} días
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onView(service)}
              className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-lg py-1 hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-3 h-3" /> Ver
            </button>
            <button
              onClick={() => router.push(`/freelancer/my-services/${service.id}/edit`)}
              className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium text-[#1B3A6B] border border-[#1B3A6B] rounded-lg py-1 hover:bg-[#1B3A6B]/5 transition-colors"
            >
              <Pencil className="w-3 h-3" /> Editar
            </button>
            <button
              onClick={() => onDelete(service)}
              disabled={isDeleting}
              className="p-1.5 text-red-400 border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>

  );
}