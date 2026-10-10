// features/services/components/ServiceDetailModal.tsx
"use client";

import { useState } from "react";
import { X, Clock, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { ServiceStatusBadge } from "./ServiceStatusBadge";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "../types/service.types";
import type { Service } from "../types/service.types";
import { toServiceMediaUrl } from "@/lib/mediaUrls";

interface Props {
  open: boolean;
  service: Service | null;
  onClose: () => void;
}

export function ServiceDetailModal({ open, service, onClose }: Props) {
  const router = useRouter();
  // FIX: el hook va ANTES del return temprano (regla de hooks). Guarda la URL de imagen que falló (404 del
  // file-proxy, pendiente backend #22) para mostrar el degradado en vez del texto alternativo gigante.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!open || !service) return null;
  const imageUrl = toServiceMediaUrl(service.imageUrls?.find((url) => url && url.trim().length > 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header — fijo */}
        {/* RESPONSIVE: px-4 en celular */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="min-w-0 text-base font-bold text-[#1B3A6B]">Vista del Servicio</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto flex-1">

          {/* Imagen full-width */}
          {/* RESPONSIVE: h-40 en celular, h-56 desde sm */}
          {imageUrl && failedUrl !== imageUrl ? (
            <div className="w-full h-40 sm:h-56 flex-shrink-0">
              <img
                src={imageUrl}
                alt={service.title}
                onError={() => setFailedUrl(imageUrl)}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-40 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-gray-300 text-sm">Sin imagen</span>
            </div>
          )}

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">

            {/* Status + category */}
            {/* RESPONSIVE: flex-wrap por si no caben las dos etiquetas */}
            <div className="flex flex-wrap items-center gap-2">
              <ServiceStatusBadge status={service.status} />
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[service.category]}`}>
                {CATEGORY_LABELS[service.category]}
              </span>
            </div>

            {/* Title + description */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1B3A6B] mb-2 break-words">{service.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed break-words">{service.description}</p>
            </div>

            {/* Price + delivery */}
            {/* RESPONSIVE: apilado en celular (2 columnas dejaban "Tiempo de entrega" en 3 líneas), 2 columnas desde sm */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="bg-gray-50 rounded-xl p-4 min-w-0">
                <p className="text-xs text-gray-400 mb-1">Precio desde</p>
                <p className="text-xl font-bold text-[#1B3A6B] break-words">
                  S/. {service.basePrice.toLocaleString("es-PE")}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-2 min-w-0">
                <Clock className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Tiempo de entrega</p>
                  <p className="text-xl font-bold text-gray-800">{service.deliveryDays} días</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            {/* RESPONSIVE: min-w-0 + px-2 y número un poco menor en celular */}
            <div className="flex items-center justify-around gap-1 px-2 py-4 bg-gray-50 rounded-xl">
              <div className="min-w-0 text-center">
                <p className="text-xl sm:text-2xl font-bold text-[#0EA5A0]">{service.views}</p>
                <p className="text-xs text-gray-500 mt-0.5">Vistas</p>
              </div>
              <div className="w-px h-8 bg-gray-200 flex-shrink-0" />
              <div className="min-w-0 text-center">
                <p className="text-xl sm:text-2xl font-bold text-[#0EA5A0]">{service.sales}</p>
                <p className="text-xs text-gray-500 mt-0.5">Ventas</p>
              </div>
              <div className="w-px h-8 bg-gray-200 flex-shrink-0" />
              <div className="min-w-0 text-center">
                <p className="text-xl sm:text-2xl font-bold text-amber-500">
                  {service.rating > 0 ? service.rating : "—"}
                  {service.rating > 0 && <span className="text-base ml-0.5">★</span>}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {service.reviewCount > 0 ? `(${service.reviewCount} reseñas)` : "Sin reseñas"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer — fijo */}
        {/* RESPONSIVE: botones apilados en celular ("Editar Servicio" se partía en 2 líneas), en fila desde sm */}
        <div className="flex flex-col-reverse gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 flex-shrink-0 sm:flex-row sm:items-center">
          <button
            onClick={onClose}
            className="flex-1 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose();
              router.push(`/freelancer/my-services/${service.id}/edit`);
            }}
            className="flex-1 flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl py-2.5 hover:bg-[#0EA5A0] transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Editar Servicio
          </button>
        </div>

      </div>
    </div>
  );
}