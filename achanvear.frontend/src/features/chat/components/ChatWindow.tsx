// features/chat/components/ChatWindow.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MoreVertical, Trash2, MessageSquare, Info, Clock, ArrowLeft } from "lucide-react";
import { useMessages, useSendMessage, useDeleteMessage, useDeleteConversation } from "../hooks/useChat";

import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import type { Conversation, Message } from "../types/chat.types";
import { useQueryClient } from "@tanstack/react-query";


interface Props {
  conversation: Conversation | null;
  onConversationDeleted: () => void;
  onToggleInfoPanel?: () => void;
  // RESPONSIVE: en celular el chat reemplaza a la lista; este botón (solo
  // visible hasta md) devuelve a la lista de conversaciones.
  onBack?: () => void;
}

const AVATAR_COLORS = [
  "bg-[#2563EB]", "bg-[#0EA5A0]", "bg-purple-500",
  "bg-amber-500", "bg-rose-500", "bg-emerald-600",
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

// FIX: "Hoy"/"Ayer" se calculaba con horas transcurridas (diff / 24h): un
// mensaje de ayer a las 11pm visto hoy a la 1am daba "Hoy", y uno con sentAt
// apenas adelantado respecto al reloj del navegador caía en la fecha larga.
// Además los mensajes se agrupan por día calendario, así que el rótulo tenía
// que usar el mismo criterio. Ahora se comparan los días de calendario.
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();

  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((nowDay.getTime() - dateDay.getTime()) / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Hoy";
  if (days === 1) return "Ayer";
  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function DateDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center justify-center my-3">
      <span className="text-[11px] text-[#64748B] bg-white/80 px-3 py-1 rounded-full border border-[#E2E8F0] shadow-sm">
        {date}
      </span>
    </div>
  );
}

export function ChatWindow({ conversation, onConversationDeleted, onToggleInfoPanel, onBack }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const { messages, isLoading } = useMessages(conversation?.id ?? null);
  const { sendAsync, isLoading: isSending } = useSendMessage();
  const { deleteAsync: deleteMessageAsync } = useDeleteMessage();
  const { removeAsync, isLoading: isDeleting } = useDeleteConversation();


  // Callback para refrescar mensajes después de subir un attachment
  const handleAttachmentUploaded = useCallback(() => {
    if (conversation?.id) {
      queryClient.invalidateQueries({ queryKey: ["chat", "messages", conversation.id] });
    }
  }, [conversation?.id, queryClient]);


  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cierra menú al hacer click fuera
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [menuOpen]);

  const handleSend = async (content: string): Promise<string | undefined> => {
    if (!conversation) return undefined;
    const message = await sendAsync({ conversationId: conversation.id, content });
    return message?.id;
  };


  const handleDelete = async () => {
    if (!conversation) return;
    await removeAsync(conversation.id);
    onConversationDeleted();
    setMenuOpen(false);
  };

  // Agrupar mensajes por fecha
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = "";
  for (const msg of messages) {
    const msgDate = new Date(msg.sentAt).toLocaleDateString("es-PE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: msgDate, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  }

  // Estado vacío — sin conversación seleccionada
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] text-center px-4 sm:px-8">
        <div className="w-20 h-20 bg-white border border-[#E2E8F0] rounded-2xl flex items-center justify-center mb-5 shadow-sm">
          <MessageSquare className="w-9 h-9 text-[#94A3B8]" />
        </div>
        <h3 className="text-base font-semibold text-[#0F172A] mb-2">
          Selecciona una conversación
        </h3>
        <p className="text-sm text-[#64748B] max-w-xs leading-relaxed">
          Conecta con empresas, freelancers y clientes desde Achanvear.
        </p>
      </div>
    );
  }

  const isCompany = conversation.participantRole === "COMPANY";

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
      {/* ── Header Profesional ──
          RESPONSIVE: avatar, nombre con etiqueta, "Último mensaje", info y menú
          competían por ~260px. En celular: menos padding, botón de volver a la
          lista, etiqueta debajo del nombre cuando no cabe, y la línea "Último
          mensaje" solo desde sm. */}
      <div className="bg-white border-b border-[#E5E7EB] px-2 py-2.5 flex items-center gap-2 flex-shrink-0 min-h-[64px] sm:px-4 sm:gap-3 sm:min-h-[72px]">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver a mensajes"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#64748B] transition-all hover:bg-[#F8FAFC] hover:text-[#2563EB] md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(conversation.participantName)}`}>
          {getInitials(conversation.participantName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="min-w-0 max-w-full truncate text-sm font-semibold text-[#0F172A]">{conversation.participantName}</p>
            <span className={`shrink-0 whitespace-nowrap text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              isCompany
                ? "bg-[#DBEAFE] text-[#1D4ED8]"
                : "bg-[#E0F2FE] text-[#0369A1]"
            }`}>
              {isCompany ? "Empresa verificada" : "Freelancer"}
            </span>
          </div>
          <div className="mt-0.5 hidden items-center gap-1.5 sm:flex">
            <span className="flex items-center gap-1 text-[11px] text-[#64748B]">
              <Clock className="w-3 h-3" />
              {conversation.lastMessageAt
                ? `Último mensaje ${formatDate(conversation.lastMessageAt)}`
                : "Sin mensajes"}
            </span>
          </div>
        </div>

        {/* Acciones del header — se quitaron "Llamada de voz" y "Videollamada":
            eran botones decorativos sin onClick ni funcionalidad real detrás,
            y no tienen sentido en un chat de texto como este. */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onToggleInfoPanel}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748B] hover:text-[#2563EB] hover:bg-[#F8FAFC] transition-all"
            title="Información"
            aria-label="Información"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Menu ⋮ */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-all"
              aria-label="Más opciones"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 z-20 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1 min-w-[180px]">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#EF4444] hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar conversación
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Messages con fondo profesional ── */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-1 sm:px-4"
        style={{
          background: "linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)",
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2394A3B8\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"), linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
        }}
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"} animate-pulse`}>
              <div className={`h-10 rounded-2xl ${i % 2 === 0 ? "bg-white/80 w-48" : "bg-[#E0ECFF]/80 w-40"}`} />
            </div>
          ))
        ) : (
          <>
            {/* Quick messages hint when no messages */}
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-[#E2E8F0]">
                    <span className="text-lg">💬</span>
                    <span className="text-xs font-medium text-[#64748B]">
                      Envía un mensaje para iniciar la conversación
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Messages grouped by date */}
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <DateDivider date={formatDate(group.messages[0].sentAt)} />
                {group.messages.map((msg) => (
                  <div key={msg.id} className="mb-1">
                    <MessageBubble message={msg} onDelete={deleteMessageAsync} />
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <MessageInput onSend={handleSend} isLoading={isSending} conversationId={conversation.id} onAttachmentUploaded={handleAttachmentUploaded} />

    </div>
  );
}