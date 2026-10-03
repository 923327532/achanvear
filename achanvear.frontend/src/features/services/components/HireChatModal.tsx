// features/services/components/HireChatModal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { chatApi } from "@/features/chat/api/chatApi";
import type { ExploreService } from "../types/service.types";

interface Props {
  open: boolean;
  service: ExploreService | null;
  onClose: () => void;
}

// FIX: antes "Ir al chat" era solo un <a href> que navegaba sin más —
// honesto (no mentía), pero el freelancer llegaba a una conversación vacía,
// sin saber por qué le escribían ni a cuál de sus servicios te referías.
// Ahora se crea/recupera la conversación y se manda un primer mensaje real
// con el nombre del servicio, usando los endpoints que ya existen y
// confirmamos que funcionan (POST /chat/conversations, POST /chat/messages).
export function HireChatModal({ open, service, onClose }: Props) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !service) return null;

  const { freelancer } = service;

  const handleGoToChat = async () => {
    setIsSending(true);
    setError(null);
    try {
      const conversation = await chatApi.startConversation(freelancer.id);
      await chatApi.sendMessage({
        conversationId: conversation.id,
        content: `Hola, me interesa contratar tu servicio "${service.title}". ¿Podemos conversar sobre el alcance y el presupuesto?`,
      });
      router.push(`/company/chat?userId=${freelancer.id}`);
      onClose();
    } catch (err) {
      setError("No se pudo iniciar la conversación. Intenta de nuevo.");
    } finally {
      setIsSending(false);
    }
  };

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
          a través de la conversación. Le enviaremos un primer mensaje mencionando este servicio.
        </p>

        {error && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-left">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleGoToChat}
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl py-2.5 hover:bg-[#0EA5A0] transition-colors disabled:opacity-60"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Iniciando conversación...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Ir al chat
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isSending}
            className="w-full text-sm font-medium text-gray-500 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}