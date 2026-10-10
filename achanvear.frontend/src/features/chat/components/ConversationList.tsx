// features/chat/components/ConversationList.tsx
"use client";

import { useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import type { Conversation } from "../types/chat.types";

interface Props {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationList({ conversations, activeConversationId, onSelect }: Props) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(search.toLowerCase()) ||
    c.participantRole.toLowerCase().includes(search.toLowerCase())
  );

  return (
    // RESPONSIVE: el ancho era w-[320px] fijo: a ~284px de pantalla la lista
    // se salía por la derecha (nombre, etiqueta y hora cortados). En celular
    // ocupa todo el ancho; desde md vuelve a los 320px de siempre.
    <div className="flex h-full w-full min-w-0 flex-col border-r border-[#E5E7EB] bg-white md:w-[320px] md:flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#E5E7EB]">
        <h2 className="text-base font-bold text-[#0F172A] mb-3">Mensajes</h2>
        <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-3 py-2">
          <Search className="w-3.5 h-3.5 text-[#64748B] flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-xs text-[#0F172A] placeholder:text-[#64748B] outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length > 0 ? (
          filtered.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={activeConversationId === conversation.id}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <MessageSquare className="w-8 h-8 text-[#E2E8F0] mb-2" />
            <p className="text-sm text-[#64748B]">No se encontraron conversaciones</p>
          </div>
        )}
      </div>
    </div>
  );
}