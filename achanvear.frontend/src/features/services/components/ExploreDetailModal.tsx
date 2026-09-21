// features/services/components/ExploreDetailModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Star, Clock, DollarSign, MessageSquare, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "../types/service.types";
import type { ExploreService } from "../types/service.types";
import { RateFreelancerModal } from "./RateFreelancerModal";
import api from "@/lib/axiosClient";
import { ApiError } from "@/lib/errors";

interface Props {
  open: boolean;
  service: ExploreService | null;
  onClose: () => void;
  onHire: (service: ExploreService) => void;
}

interface ProfileRating {
  reviewerUserId: string;
  reviewerType: string;
  stars: number;
  recommended: boolean;
  comment: string | null;
  createdAt: string;
}

interface TalentProfileResponse {
  id: string;
  userId: string;
  profileType: string;
  headline: string;
  biography: string;
  location: string;
  profilePhotoUrl: string | null;
  curriculumUrl: string | null;
  status: string;
  reputationScore: {
    averageStars: number;
    recommendationPercentage: number;
    totalRatings: number;
  };
  skills: { name: string; level: string; yearsOfExperience: number }[];
  portfolioItems: { title: string; description: string; assetUrl: string | null; projectUrl: string | null }[];
  ratings: ProfileRating[];
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
  const [ratings, setRatings] = useState<ProfileRating[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [loadingRatings, setLoadingRatings] = useState(false);

  // Fetch ratings when modal opens
  useEffect(() => {
    if (!open || !service?.freelancer?.id) return;

    let cancelled = false;
    setLoadingRatings(true);

    api.get<{ data: TalentProfileResponse }>(`/profiles/by-user/${service.freelancer.id}`)
      .then((res) => {
        if (!cancelled) {
          const profile = res.data?.data ?? res.data;
          const allRatings = (profile?.ratings ?? [])
            .filter((r) => r.comment) // Only ratings with comments
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRatings(allRatings);
        }
      })
      .catch(() => {
        if (!cancelled) setRatings([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingRatings(false);
      });

    return () => { cancelled = true; };
  }, [open, service?.freelancer?.id]);

  if (!open || !service) return null;

  const { freelancer } = service;

  const displayedRatings = showAllReviews ? ratings : ratings.slice(0, 5);
  const hasMoreRatings = ratings.length > 5;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
            <h2 className="text-base font-bold text-[#1B3A6B]">Detalle del Servicio</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Freelancer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold ${getAvatarColor(freelancer.name)}`}>
                  {getInitials(freelancer.name)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-gray-800">{freelancer.name}</span>
                    {freelancer.verified && (
                      <span className="text-xs font-medium text-[#0EA5A0]">✓ Verificado</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{freelancer.title}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[service.category]}`}>
                {CATEGORY_LABELS[service.category]}
              </span>
            </div>

            {/* Title + description */}
            <div>
              <h3 className="text-xl font-bold text-[#1B3A6B] mb-2 leading-snug">{service.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{service.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.floor(service.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
              ))}
              <span className="text-sm font-bold text-gray-700">{service.rating > 0 ? service.rating : "—"}</span>
              <span className="text-sm text-gray-400">— {service.reviewCount > 0 ? `${service.reviewCount} reseñas verificadas` : "Sin reseñas"}</span>
            </div>

            {/* Price + delivery */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Precio desde</p>
                <p className="text-xl font-bold text-[#1B3A6B]">
                  S/. {service.basePrice.toLocaleString("es-PE")}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Tiempo de entrega</p>
                  <p className="text-xl font-bold text-gray-800">{service.deliveryDays} días</p>
                </div>
              </div>
            </div>

            {/* Escrow placeholder — se conectará con features/payments/ */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3">
              <DollarSign className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-emerald-700 mb-0.5">Pago protegido con Escrow</p>
                <p className="text-xs text-emerald-600">
                  Tu pago queda retenido hasta que confirmes que el servicio fue entregado correctamente.
                </p>
              </div>
            </div>

            {/* Reviews / Comments Section */}
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
                      <div className="flex items-center gap-1.5 mb-1.5">
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
                        <p className="text-xs text-gray-600 leading-relaxed">{rating.comment}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Show more / less button */}
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

            {/* Actions: WhatsApp + Message + Rate */}
            <div className="grid grid-cols-3 gap-2">
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
              <a
                href={`/company/chat?userId=${freelancer.id}`}
                className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Mensaje
              </a>
              <button
                onClick={() => setRateModalOpen(true)}
                className="flex items-center justify-center gap-1.5 text-sm font-medium text-amber-600 border border-amber-200 rounded-xl py-2.5 hover:bg-amber-50 transition-colors"
              >
                <Star className="w-4 h-4" />
                Calificar
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
            <button
              onClick={onClose}
              className="flex-1 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
            {/* TODO: conectar con features/payments/ cuando esté listo */}
            <button
              onClick={() => { onClose(); onHire(service); }}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl py-2.5 hover:bg-[#0EA5A0] transition-colors"
            >
              Contratar Servicio
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
          // Refetch services to update rating
        }}
      />
    </>
  );
}
