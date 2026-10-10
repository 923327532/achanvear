// features/services/components/ServiceCard.tsx
"use client";

import { useState } from "react";
import { Eye, Star, ShoppingBag, Clock, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ServiceStatusBadge } from "./ServiceStatusBadge";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "../types/service.types";
import type { Service } from "../types/service.types";
import { toServiceMediaUrl } from "@/lib/mediaUrls";

interface Props {
  service: Service;
  onView: (service: Service) => void;
  onDelete: (service: Service) => void;
  isDeleting?: boolean;
}

export function ServiceCard({ service, onView, onDelete, isDeleting }: Props) {
  const router = useRouter();
  const imageUrl = toServiceMediaUrl(service.imageUrls?.find((url) => url && url.trim().length > 0));

  // FIX: si la imagen existe en la BD pero el backend responde 404 (file-proxy, pendiente backend #22),
  // el <img> mostraba el texto alternativo gigante. Guardamos la URL que falló y, mientras
  // coincida con la actual, se muestra el degradado de reemplazo. Si la URL cambia, se reintenta sola.
  // FIX (TS2322): la condición va directo sobre imageUrl (string | null) para que TypeScript lo estreche a string en el <img>.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  return (
    // RESPONSIVE: min-w-0 para que la tarjeta no desborde la columna de la grilla
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden w-full min-w-0">

      {/* Image */}
      {/* FIX: "imageUrls.length > 0" es true incluso cuando el backend manda
          [""] (un string vacío) en vez de un array realmente vacío. Eso
          renderizaba <img src=""> y disparaba un error de consola / icono
          roto. Ahora se valida que el primer elemento tenga contenido real. */}
      {imageUrl && failedUrl !== imageUrl ? (
        <div className="w-full h-24 overflow-hidden flex-shrink-0">
          <img
            src={imageUrl}
            alt={service.title}
            onError={() => setFailedUrl(imageUrl)}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-24 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-gray-300 text-[10px]">Sin imagen</span>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 p-3">

        {/* Status + category */}
        {/* RESPONSIVE: gap-2 y min-w-0; la categoría puede cortarse con "…" en vez de empujar la tarjeta */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <ServiceStatusBadge status={service.status} />
          <span className={`min-w-0 truncate text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[service.category]}`}>
            {CATEGORY_LABELS[service.category]}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[#1B3A6B] text-xs leading-snug mb-1 line-clamp-2 break-words">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2 mb-1.5 flex-1 break-words">
          {service.description}
        </p>

        {/* Stats */}
        {/* RESPONSIVE: flex-wrap; con 3 datos en una sola fila se salían de la tarjeta a 284px */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 mb-1.5">
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
          <div className="flex items-end justify-between gap-2 mb-2">
            <div className="min-w-0">
              <p className="text-[9px] text-gray-400 mb-0.5">Precio desde</p>
              <p className="text-sm font-bold text-[#1B3A6B] break-words">
                S/. {service.basePrice.toLocaleString("es-PE")}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[9px] text-gray-400 mb-0.5">Entrega en</p>
              <p className="text-[11px] font-medium text-gray-600 flex items-center gap-1 justify-end">
                <Clock className="w-2.5 h-2.5 text-gray-400" />
                {service.deliveryDays} días
              </p>
            </div>
          </div>

          {/* Actions */}
          {/* RESPONSIVE: py-1.5 en celular (área táctil mayor), py-1 desde sm; el botón de eliminar no se encoge */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onView(service)}
              className="flex-1 min-w-0 flex items-center justify-center gap-1 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-lg py-1.5 sm:py-1 hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-3 h-3 flex-shrink-0" /> Ver
            </button>
            <button
              onClick={() => router.push(`/freelancer/my-services/${service.id}/edit`)}
              className="flex-1 min-w-0 flex items-center justify-center gap-1 text-[11px] font-medium text-[#1B3A6B] border border-[#1B3A6B] rounded-lg py-1.5 sm:py-1 hover:bg-[#1B3A6B]/5 transition-colors"
            >
              <Pencil className="w-3 h-3 flex-shrink-0" /> Editar
            </button>
            <button
              onClick={() => onDelete(service)}
              disabled={isDeleting}
              aria-label="Eliminar servicio"
              className="flex-shrink-0 p-2 sm:p-1.5 text-red-400 border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}