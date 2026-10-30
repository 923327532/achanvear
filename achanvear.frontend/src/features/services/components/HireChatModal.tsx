// features/services/components/HireChatModal.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { serviceContractsApi } from "../api/serviceContractsApi";
import { chatApi } from "@/features/chat/api/chatApi";
import { ApiError } from "@/lib/errors";
import type { ExploreService } from "../types/service.types";

interface Props {
  open: boolean;
  service: ExploreService | null;
  onClose: () => void;
}

export function HireChatModal({ open, service, onClose }: Props) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sendingRef = useRef(false);

  if (!open || !service) return null;

  const { freelancer } = service;

  const handleGoToChat = async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setIsSending(true);
    setError(null);
    try {
      const conversation = await chatApi.startConversation(freelancer.id);

      await serviceContractsApi.linkOrigin(conversation.id, service.id);

      let alreadyMentioned = false;
      try {
        const messages = await chatApi.getMessages(conversation.id);
        alreadyMentioned = messages.some(
          (m) => m.isMine && m.content.includes(`"${service.title}"`)
        );
      } catch {
        alreadyMentioned = false;
      }

      if (!alreadyMentioned) {
        await chatApi.sendMessage({
          conversationId: conversation.id,
          content: `Hola, me interesa contratar tu servicio "${service.title}". ¿Podemos conversar sobre el alcance y el presupuesto?`,
        });
      }

      router.push(`/company/chat?userId=${freelancer.id}`);
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError && err.message
          ? err.message
          : "No se pudo iniciar la conversación. Intenta de nuevo."
      );
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={isSending ? undefined : onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <button
          onClick={onClose}
          disabled={isSending}
          aria-label="Cerrar"
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-[#0EA5A0]/10 flex items-center justify-center">
          <MessageSquare className="w-7 h-7 text-[#0EA5A0]" />
        </div>

        <h3 className="text-lg font-bold text-[#1B3A6B] mb-2">
          Coordina con el profesional
        </h3>

        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Para contratar este servicio, coordina los detalles directamente con{" "}
          <span className="font-semibold text-gray-700">{freelancer.name}</span>{" "}
          a través de la conversación. Si todavía no le escribiste por este servicio, le enviaremos un primer mensaje.
        </p>

        {error && (
          <div role="alert" className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-left">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

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