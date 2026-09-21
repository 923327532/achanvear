// features/services/components/HireChatModal.tsx
"use client";

import { X, MessageSquare } from "lucide-react";
import type { ExploreService } from "../types/service.types";

interface Props {
  open: boolean;
  service: ExploreService | null;
  onClose: () => void;
}

export function HireChatModal({ open, service, onClose }: Props) {
  if (!open || !service) return null;

  const { freelancer } = service;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-[#0EA5A0]/10 flex items-center justify-center">
          <MessageSquare className="w-7 h-7 text-[#0EA5A0]" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#1B3A6B] mb-2">
          Coordina con el profesional
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Para contratar este servicio, coordina los detalles directamente con{" "}
          <span className="font-semibold text-gray-700">{freelancer.name}</span>{" "}
          a través de la conversación.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <a
            href={`/company/chat?userId=${freelancer.id}`}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl py-2.5 hover:bg-[#0EA5A0] transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Ir al chat
          </a>
          <button
            onClick={onClose}
            className="w-full text-sm font-medium text-gray-500 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}