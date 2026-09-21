// features/services/components/ExploreServiceCard.tsx
"use client";

import { Star, Clock, Eye, Phone, CheckCircle2, User } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "../types/service.types";
import type { ExploreService } from "../types/service.types";

interface Props {
  service: ExploreService;
  onViewDetail: (service: ExploreService) => void;
  onHire: (service: ExploreService) => void;
}

export function ExploreServiceCard({ service, onViewDetail, onHire }: Props) {
  const { freelancer } = service;
  const contactNumber = (freelancer.whatsapp || freelancer.phone || "").replace(/[^0-9]/g, "");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="h-[150px] w-full overflow-hidden">
        {service.imageUrls && service.imageUrls.length > 0 ? (
          <img src={service.imageUrls[0]} alt={service.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1B3A6B]/10 to-[#0EA5A0]/10" />
        )}
      </div>

      <div className="px-4 py-3.5">
        <div className="flex items-center gap-2 mb-2.5">
          {freelancer.verified && (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-teal-50 text-teal-900">
              <CheckCircle2 className="w-3 h-3" /> Verificado
            </span>
          )}
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[service.category]}`}>
            {CATEGORY_LABELS[service.category]}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 text-[15px] leading-snug mb-1.5 line-clamp-2">
          {service.title}
        </h3>

        <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2 mb-3">
          {service.description}
        </p>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0">
            <User className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{freelancer.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {service.rating > 0 ? service.rating : "—"}
            {service.reviewCount > 0 && ` (${service.reviewCount})`}
          </div>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Precio desde</p>
            <p className="text-[17px] font-bold text-green-700">
              S/. {service.basePrice.toLocaleString("es-PE")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-400 mb-0.5">Entrega en</p>
            <p className="text-[13px] text-gray-600 flex items-center gap-1 justify-end">
              <Clock className="w-3.5 h-3.5" />
              {service.deliveryDays} días
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetail(service)}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl py-2 hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" /> Ver detalle
          </button>
          <button
            onClick={() => onHire(service)}
            className="flex-1 flex items-center justify-center text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl py-2 hover:bg-[#0EA5A0] transition-colors"
          >
            Contratar
          </button>
          {contactNumber && (
            <a
              href={`https://wa.me/${contactNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Contactar por WhatsApp"
              className="flex items-center justify-center w-9 h-9 flex-shrink-0 text-green-600 border border-green-200 rounded-xl hover:bg-green-50 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}