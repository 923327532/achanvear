// features/services/components/ExploreDetailModal.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { X, Star, Clock, MessageSquare, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "../types/service.types";
import type { ExploreService } from "../types/service.types";
import { RateFreelancerModal } from "./RateFreelancerModal";
import { useFreelancerComments } from "../hooks/useExploreServices";

interface Props {
  open: boolean;
  service: ExploreService | null;
  onClose: () => void;
  onHire: (service: ExploreService) => void;
}

const AVATAR_COLORS = ["bg-teal-500", "bg-[#1B3A6B]", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-emerald-600"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export function ExploreDetailModal({ open, service, onClose, onHire }: Props) {
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const queryClient = useQueryClient();

  const { ratings } = useFreelancerComments(service?.freelancer?.id, open);

  if (!open || !service) return null;

  const { freelancer } = service;
  const showTitle =
    !!freelancer.title?.trim() &&
    freelancer.title.trim().toLowerCase() !== freelancer.name.trim().toLowerCase();

  const displayedRatings = showAllReviews ? ratings : ratings.slice(0, 5);
  const hasMoreRatings = ratings.length > 5;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl sm:px-6 sm:py-4">
            <h2 className="text-base font-bold text-[#1B3A6B]">Detalle del Servicio</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-white font-bold ${getAvatarColor(freelancer.name)}`}>
                  {getInitials(freelancer.name)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-1.5">
                    <span className="break-words text-sm font-bold text-gray-800">{freelancer.name}</span>
                    {freelancer.verified && (
                      <span className="text-xs font-medium text-[#0EA5A0]">✓ Verificado</span>
                    )}
                  </div>
                  {showTitle && (
                    <p className="break-words text-xs text-gray-500">{freelancer.title}</p>
                  )}
                </div>
              </div>
              <span className={`self-start shrink-0 text-xs font-medium px-2.5 py-1 rounded-full sm:self-auto ${CATEGORY_COLORS[service.category]}`}>
                {CATEGORY_LABELS[service.category]}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#1B3A6B] mb-2 leading-snug break-words sm:text-xl">{service.title}</h3>
              <p className="break-words text-sm text-gray-500 leading-relaxed">{service.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.floor(service.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
              ))}
              <span className="text-sm font-bold text-gray-700">{service.rating > 0 ? service.rating : "—"}</span>
              <span className="text-sm text-gray-400">— {service.reviewCount > 0 ? `${service.reviewCount} ${service.reviewCount === 1 ? "reseña verificada" : "reseñas verificadas"}` : "Sin reseñas"}</span>
            </div>

            <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                <p className="text-xs text-gray-400 mb-1">Precio desde</p>
                <p className="text-lg font-bold text-[#1B3A6B] sm:text-xl">
                  S/. {service.basePrice.toLocaleString("es-PE")}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2 sm:p-4">
                <Clock className="w-4 h-4 shrink-0 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Tiempo de entrega</p>
                  <p className="text-lg font-bold text-gray-800 sm:text-xl">{service.deliveryDays} días</p>
                </div>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex gap-3">
              <MessageSquare className="w-5 h-5 text-[#0EA5A0] flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-teal-800 mb-0.5">Antes de contratar</p>
                <p className="text-xs text-teal-700">
                  Conversa con el profesional para acordar el alcance, el plazo y el presupuesto.
                </p>
              </div>
            </div>

            {ratings.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-[#1B3A6B]">
                    Comentarios ({ratings.length})
                  </h4>
                </div>

                <div className="space-y-3">
                  {displayedRatings.map((rating, idx) => (
                    <div key={`${rating.reviewerUserId}-${idx}`} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= rating.stars ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                            />
                          ))}
                        </div>
                        {rating.recommended && (
                          <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                            Recomendado
                          </span>
                        )}
                      </div>
                      {rating.comment && (
                        <p className="break-words text-xs text-gray-600 leading-relaxed">{rating.comment}</p>
                      )}
                    </div>
                  ))}
                </div>

                {hasMoreRatings && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="flex items-center justify-center gap-1 w-full mt-2 text-xs font-medium text-[#0EA5A0] hover:text-[#0EA5A0]/80 transition-colors py-2"
                  >
                    {showAllReviews ? (
                      <>Mostrar menos <ChevronUp className="w-3.5 h-3.5" /></>
                    ) : (
                      <>Ver los {ratings.length} comentarios <ChevronDown className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {freelancer.whatsapp || freelancer.phone ? (
                <a
                  href={`https://wa.me/${(freelancer.whatsapp || freelancer.phone || "").replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-sm font-medium text-green-600 border border-green-200 rounded-xl py-2.5 hover:bg-green-50 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </a>
              ) : null}
              <Link
                href={`/company/chat?userId=${freelancer.id}`}
                className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Mensaje
              </Link>
              <button
                onClick={() => setRateModalOpen(true)}
                className="flex items-center justify-center gap-1.5 text-sm font-medium text-amber-600 border border-amber-200 rounded-xl py-2.5 hover:bg-amber-50 transition-colors"
              >
                <Star className="w-4 h-4" />
                Calificar
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl sm:px-6 sm:py-4">
            <button
              onClick={onClose}
              className="flex-1 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => { onClose(); onHire(service); }}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl py-2.5 hover:bg-[#0EA5A0] transition-colors"
            >
              Contratar<span className="hidden sm:inline"> Servicio</span>
            </button>
          </div>
        </div>
      </div>

      <RateFreelancerModal
        open={rateModalOpen}
        freelancerId={freelancer.id}
        freelancerName={freelancer.name}
        onClose={() => setRateModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["services", "freelancer-ratings", freelancer.id] });
          queryClient.invalidateQueries({ queryKey: ["services", "explore"] });
        }}
      />
    </>
  );
}