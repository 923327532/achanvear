// features/chat/components/ConversationItem.tsx
"use client";

import type { Conversation } from "../types/chat.types";

interface Props {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (conversation: Conversation) => void;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours}h`;
  if (days === 1) return "ayer";
  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
  });
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-[#2563EB]", "bg-[#0EA5A0]", "bg-purple-500",
  "bg-amber-500", "bg-rose-500", "bg-emerald-600",
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export function ConversationItem({ conversation, isActive, onSelect }: Props) {
  const isCompany = conversation.participantRole === "COMPANY";

  return (
    <button
      onClick={() => onSelect(conversation)}
      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-all duration-150 border-l-4 ${
        isActive
          ? "bg-[#EFF6FF] border-l-[#2563EB]"
          : "bg-white border-l-transparent hover:bg-[#F8FAFC]"
      }`}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(conversation.participantName)}`}>
        {getInitials(conversation.participantName)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-sm font-semibold text-[#0F172A] truncate">
              {conversation.participantName}
            </p>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${
              isCompany
                ? "bg-[#DBEAFE] text-[#1D4ED8]"
                : "bg-[#E0F2FE] text-[#0369A1]"
            }`}>
              {isCompany ? "Empresa" : "Freelancer"}
            </span>
          </div>
          <span className="text-[11px] text-[#64748B] flex-shrink-0">
            {formatTime(conversation.lastMessageAt)}
          </span>
        </div>

        <p className="text-xs text-[#64748B] mt-0.5 truncate leading-relaxed">
          {conversation.lastMessage || "Inicia la conversación..."}
        </p>

        <div className="flex items-center gap-2 mt-1">
          {conversation.unreadCount > 0 && (
            <span className="text-[10px] font-bold text-white bg-[#2563EB] px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
