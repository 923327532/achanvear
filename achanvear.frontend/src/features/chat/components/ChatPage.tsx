// features/chat/components/ChatPage.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Loader2, ArrowLeft } from "lucide-react";
import { useConversations } from "../hooks/useChat";
import { chatApi } from "../api/chatApi";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { ParticipantInfoPanel } from "./ParticipantInfoPanel";
import type { Conversation } from "../types/chat.types";

interface ChatPageProps {
  initialUserId?: string;
}

export function ChatPage({ initialUserId }: ChatPageProps) {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const { conversations, isLoading } = useConversations();
  const hasInitialized = useRef(false);

  // When initialUserId is provided, auto-start or find the conversation
  useEffect(() => {
    if (!initialUserId || hasInitialized.current) return;

    const initConversation = async () => {
      if (isStarting) return;
      setIsStarting(true);
      setInitError(null);
      try {
        // startConversation now returns existing conversation if it already exists
        const conv = await chatApi.startConversation(initialUserId);
        setActiveConversation(conv);
        hasInitialized.current = true;
      } catch (err: any) {
        console.error("Error al iniciar conversación:", err);
        setInitError("No se pudo iniciar la conversación");
      } finally {
        setIsStarting(false);
      }
    };

    initConversation();
  }, [initialUserId]);

  // ── Skeleton de carga ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-0 w-full flex-1 overflow-hidden">
        {/* Lista skeleton — RESPONSIVE: ancho completo en celular */}
        <div className="flex h-full w-full min-w-0 flex-col border-r border-[#E5E7EB] bg-white md:w-[320px] md:flex-shrink-0">
          <div className="px-4 py-4 border-b border-[#E5E7EB]">
            <div className="h-5 w-24 bg-[#F1F5F9] rounded animate-pulse mb-3" />
            <div className="h-9 bg-[#F1F5F9] rounded-[12px] animate-pulse" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3.5 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-3.5 bg-[#F1F5F9] rounded w-24 mb-2" />
                  <div className="h-3 bg-[#F1F5F9] rounded w-32 mb-1.5" />
                  <div className="h-3 bg-[#F1F5F9] rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Ventana skeleton — solo desde md (en celular se ve solo la lista) */}
        <div className="hidden flex-1 items-center justify-center bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] md:flex">
          <div className="h-4 w-32 bg-[#F1F5F9] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Starting a new conversation ──────────────────────────────────────────
  if (isStarting) {
    return (
      <div className="flex min-h-0 w-full flex-1 items-center justify-center bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
          <p className="text-sm text-[#64748B]">Iniciando conversación...</p>
        </div>
      </div>
    );
  }

  // ── Error al iniciar ─────────────────────────────────────────────────────
  if (initError) {
    return (
      <div className="flex min-h-0 w-full flex-1 items-center justify-center bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9]">
        <div className="flex flex-col items-center text-center max-w-xs px-6">
          <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-red-300" />
          </div>
          <h3 className="text-sm font-semibold text-[#0F172A] mb-1">Error al iniciar</h3>
          <p className="text-xs text-[#64748B]">{initError}</p>
        </div>
      </div>
    );
  }

  // ── Sin conversaciones — empty state centrado ────────────────────────────
  if (conversations.length === 0 && !initialUserId && !activeConversation) {
    return (
      <div className="flex flex-1 min-h-0 items-center justify-center bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9]">
        <div className="flex flex-col items-center text-center max-w-xs px-6">
          <div className="w-20 h-20 bg-white border border-[#E2E8F0] rounded-2xl flex items-center justify-center mb-5 shadow-sm">
            <MessageSquare className="w-9 h-9 text-[#94A3B8]" />
          </div>
          <h3 className="text-base font-semibold text-[#0F172A] mb-2">
            Aún no tienes mensajes
          </h3>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Cuando te respondan una propuesta, tus conversaciones aparecerán aquí.
          </p>
        </div>
      </div>
    );
  }

  // ── Layout normal — hay conversaciones ──────────────────────────────────
  // RESPONSIVE (patrón lista → detalle):
  //  - Celular (< md): se ve la lista O la conversación, no las dos. Al elegir
  //    una conversación aparece la ventana con un botón "Mensajes" para volver.
  //    Antes, la lista (320px fijos) y la ventana iban lado a lado y en celular
  //    la ventana quedaba fuera de pantalla.
  //  - md en adelante: lista y ventana lado a lado, como antes.
  //  - Panel de información: se abre como capa sobre el chat hasta xl (1280px).
  //    Con el sidebar de 260px visible desde lg, lista (320) + panel (320)
  //    dejaban a la ventana con ~120px.
  return (
    <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
      <div
        className={`min-h-0 w-full md:w-auto md:shrink-0 ${
          activeConversation ? "hidden md:block" : "block"
        }`}
      >
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversation?.id ?? null}
          onSelect={(conv) => {
            setActiveConversation(conv);
            setShowInfoPanel(false);
          }}
        />
      </div>

      <div
        className={`min-w-0 flex-1 flex-col [&>:last-child]:min-h-0 ${
          activeConversation ? "flex" : "hidden md:flex"
        }`}
      >
        {/* Botón para volver a la lista — solo en celular */}
        {activeConversation && (
          <div className="flex shrink-0 items-center border-b border-[#E5E7EB] bg-white px-2 py-1.5 md:hidden">
            <button
              type="button"
              onClick={() => {
                setActiveConversation(null);
                setShowInfoPanel(false);
              }}
              aria-label="Volver a mensajes"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-[#2563EB] transition-colors hover:bg-[#F8FAFC]"
            >
              <ArrowLeft className="h-4 w-4" />
              Mensajes
            </button>
          </div>
        )}
        <ChatWindow
          conversation={activeConversation}
          onConversationDeleted={() => {
            setActiveConversation(null);
            setShowInfoPanel(false);
          }}
          onToggleInfoPanel={() => setShowInfoPanel((v) => !v)}
        />
      </div>

      {showInfoPanel && activeConversation && (
        // Capa a pantalla completa del área del chat hasta xl. El panel tiene
        // w-[320px] fijo en su propio archivo; max-xl:[&>div]:!w-full lo estira
        // mientras sea capa (ver nota en la respuesta).
        <div className="absolute inset-0 z-10 flex bg-white max-xl:[&>div]:!w-full xl:static xl:z-auto xl:bg-transparent">
          <ParticipantInfoPanel
            conversation={activeConversation}
            onClose={() => setShowInfoPanel(false)}
          />
        </div>
      )}
    </div>
  );
}