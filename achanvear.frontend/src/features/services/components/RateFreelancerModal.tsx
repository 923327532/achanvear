// features/services/components/RateFreelancerModal.tsx
"use client";

import { useState } from "react";
import { X, Star, Loader2 } from "lucide-react";
import api from "@/lib/axiosClient";
import { ApiError } from "@/lib/errors";

interface Props {
  open: boolean;
  freelancerId: string;
  freelancerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function RateFreelancerModal({ open, freelancerId, freelancerName, onClose, onSuccess }: Props) {
  const [stars, setStars] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [recommended, setRecommended] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    if (stars === 0) {
      setError("Selecciona una calificación de 1 a 5 estrellas");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      // Use the rate-by-user endpoint which looks up the profile internally
      await api.post(`/profiles/rate-user/${freelancerId}`, {
        reviewerType: "COMPANY",
        stars,
        recommended,
        comment: comment.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      // Show the actual error message from the backend
      let msg = "Error al enviar calificación";
      if (err instanceof ApiError) {
        msg = err.message;
      } else if (err && typeof err === "object" && "message" in err) {
        msg = String((err as { message: unknown }).message);
      }
      console.error("Rate error:", err);
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#1B3A6B]">Calificar Freelancer</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Freelancer name */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Califica a</p>
            <p className="text-lg font-bold text-gray-800">{freelancerName}</p>
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setStars(s)}
                onMouseEnter={() => setHoveredStar(s)}
                onMouseLeave={() => setHoveredStar(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    s <= (hoveredStar || stars)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Recommended */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setRecommended(true)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                recommended
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              👍 Recomiendo
            </button>
            <button
              onClick={() => setRecommended(false)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                !recommended
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              👎 No recomiendo
            </button>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Comentario (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comparte tu experiencia trabajando con este freelancer..."
              rows={3}
              maxLength={1000}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{comment.length}/1000</p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || stars === 0}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl py-2.5 hover:bg-[#0EA5A0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Enviar Calificación
          </button>
        </div>
      </div>
    </div>
  );
}
