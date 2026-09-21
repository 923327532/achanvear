// features/chat/components/WhatsAppChatModal.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Trash2, Edit3, Check, CheckCheck, Smile, Paperclip, MoreVertical, File, Loader2 } from "lucide-react";
import { chatApi } from "../api/chatApi";
import type { Message, Conversation, Attachment } from "../types/chat.types";
import { AttachmentBubble } from "./AttachmentBubble";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  freelancerUserId: string;
  freelancerName: string;
  onClose: () => void;
}

// ─── Mensajes predefinidos ────────────────────────────────────────────────────

const QUICK_MESSAGES = [
  {
    text: "¡Hola! Me interesa tu perfil para un proyecto. ¿Te gustaría conversar sobre los detalles?",
    icon: "👋",
  },
  {
    text: "Gracias por tu propuesta. Me gustaría coordinar una entrevista para conocerte mejor.",
    icon: "📋",
  },
  {
    text: "Hemos revisado tu propuesta y nos gustaría avanzar. ¿Cuándo podríamos tener una reunión?",
    icon: "✅",
  },
];

// ─── Emojis / Stickers ────────────────────────────────────────────────────────

const STICKERS = ["😊", "👍", "❤️", "🎉", "🔥", "💪", "👏", "🙌", "✨", "🚀", "💯", "😎"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  }
  if (days === 1) return "Ayer";
  if (days < 7) {
    return date.toLocaleDateString("es-PE", { weekday: "long" });
  }
  return date.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Sticker Picker ───────────────────────────────────────────────────────────

function StickerPicker({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-16 left-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 grid grid-cols-6 gap-1.5"
    >
      {STICKERS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="w-9 h-9 flex items-center justify-center text-xl hover:bg-slate-100 rounded-lg transition-colors"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

// ─── Message Bubble (WhatsApp style) ──────────────────────────────────────────

function WhatsAppBubble({
  message,
  onEdit,
  onDelete,
}: {
  message: Message & { isEditing?: boolean; tempContent?: string };
  onEdit: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== message.content) {
      onEdit(message.id, trimmed);
    }
    setIsEditing(false);
  };

  const isSticker = message.content.startsWith("STICKER:");
  const hasAttachments = message.attachments && message.attachments.length > 0;

  if (message.isMine) {
    return (
      <div className="flex justify-end group">
        <div className="max-w-[75%] relative">
          {/* Menu de acciones (editar/eliminar) al hacer hover */}
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute left-0 top-7 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[130px] z-20">
                <button
                  onClick={() => { setIsEditing(true); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Edit3 className="w-3 h-3" /> Editar
                </button>
                <button
                  onClick={() => { onDelete(message.id); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Eliminar
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="bg-[#d9fdd3] rounded-2xl rounded-tr-sm px-3 py-2">
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                onBlur={handleSaveEdit}
                className="bg-transparent text-sm text-slate-800 outline-none w-full"
              />
            </div>
          ) : isSticker ? (
            <div className="text-5xl">{message.content.replace("STICKER:", "")}</div>
          ) : (
            <div className="bg-[#d9fdd3] rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-sm">
              {/* Attachments */}
              {hasAttachments && (
                <div className="space-y-2 mb-2">
                  {message.attachments!.map((att) => (
                    <AttachmentBubble key={att.id} attachment={att} />
                  ))}
                </div>
              )}
              {/* Text content */}
              {message.content && (
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span className="text-[10px] text-slate-400">
                  {formatMessageTime(message.sentAt)}
                </span>
                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" strokeWidth={2} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start group">
      <div className="max-w-[75%]">
        {isSticker ? (
          <div className="text-5xl">{message.content.replace("STICKER:", "")}</div>
        ) : (
          <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm border border-slate-100">
            {/* Attachments */}
            {hasAttachments && (
              <div className="space-y-2 mb-2">
                {message.attachments!.map((att) => (
                  <AttachmentBubble key={att.id} attachment={att} />
                ))}
              </div>
            )}
            {/* Text content */}
            {message.content && (
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] text-slate-400">
                {formatMessageTime(message.sentAt)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Quick Message Button ─────────────────────────────────────────────────────

function QuickMessageButton({
  message,
  onClick,
  disabled,
}: {
  message: { text: string; icon: string };
  onClick: (text: string) => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={() => onClick(message.text)}
      disabled={disabled}
      className="flex items-start gap-2.5 w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-[#25D366] hover:bg-[#e8f5e9] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      <span className="text-lg flex-shrink-0 mt-0.5">{message.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-700 leading-relaxed line-clamp-2 group-hover:text-slate-800">
          {message.text}
        </p>
      </div>
      <Send className="w-3.5 h-3.5 text-[#25D366] flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

// ─── Date Divider ─────────────────────────────────────────────────────────────

function DateDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center justify-center my-3">
      <span className="text-[11px] text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
        {date}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function WhatsAppChatModal({ freelancerUserId, freelancerName, onClose }: Props) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<(Message & { isEditing?: boolean })[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showQuickMessages, setShowQuickMessages] = useState(true);
  const [showStickers, setShowStickers] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ─── Inicializar conversación ─────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const conv = await chatApi.startConversation(freelancerUserId);
        setConversation(conv);
        const msgs = await chatApi.getMessages(conv.id);
        setMessages(msgs);
        if (msgs.length > 0) setShowQuickMessages(false);
      } catch (err: any) {
        // Si el error es porque la conversación ya existe, intentamos obtener las conversaciones
        // y buscar la que coincida con este freelancer
        if (err?.message?.includes("already exists") || err?.status === 409) {
          try {
            const conversations = await chatApi.getConversations();
            const existing = conversations.find(
              (c) => c.participantName && c.id
            );
            if (existing) {
              setConversation(existing);
              const msgs = await chatApi.getMessages(existing.id);
              setMessages(msgs);
              if (msgs.length > 0) setShowQuickMessages(false);
            }
          } catch {
            console.error("Error al recuperar conversación existente");
          }
        } else {
          console.error("Error al iniciar conversación:", err);
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };
    init();
  }, [freelancerUserId]);

  // ─── Polling de mensajes (tiempo real) ────────────────────────────────────
  useEffect(() => {
    if (!conversation) return;
    const interval = setInterval(async () => {
      try {
        const msgs = await chatApi.getMessages(conversation.id);
        setMessages(msgs);
      } catch {
        // ignore
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [conversation]);

  // ─── Scroll al último mensaje ─────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Enviar mensaje ───────────────────────────────────────────────────────
  const sendMessage = useCallback(async (content: string) => {
    if (!conversation || !content.trim() || isSending) return;
    setIsSending(true);
    setShowQuickMessages(false);
    try {
      const newMsg = await chatApi.sendMessage({
        conversationId: conversation.id,
        content: content.trim(),
      });
      setMessages((prev) => [...prev, newMsg]);
      setInputValue("");
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    } finally {
      setIsSending(false);
    }
  }, [conversation, isSending]);

  // ─── Enviar sticker ───────────────────────────────────────────────────────
  const sendSticker = useCallback((emoji: string) => {
    sendMessage(`STICKER:${emoji}`);
    setShowStickers(false);
  }, [sendMessage]);

  // ─── Editar mensaje ───────────────────────────────────────────────────────
  const handleEdit = useCallback(async (messageId: string, newContent: string) => {
    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, content: newContent } : m))
    );
    // Enviamos como mensaje nuevo (el backend no soporta edición nativa)
    // pero simulamos el update local
    try {
      await chatApi.sendMessage({
        conversationId: conversation!.id,
        content: `✏️ ${newContent}`,
      });
    } catch {
      // revert
    }
  }, [conversation]);

  // ─── Eliminar mensaje ─────────────────────────────────────────────────────
  const handleDelete = useCallback(async (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    try {
      await chatApi.sendMessage({
        conversationId: conversation!.id,
        content: "🚫 Este mensaje fue eliminado",
      });
    } catch {
      // ignore
    }
  }, [conversation]);

  // ─── Enviar con Enter ─────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) sendMessage(inputValue);
    }
  };

  // ─── Auto-resize textarea ─────────────────────────────────────────────────
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    setInputValue(el.value);
  };

  // ─── Agrupar mensajes por fecha ───────────────────────────────────────────
  const groupedMessages: { date: string; messages: (Message & { isEditing?: boolean })[] }[] = [];
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col mx-4 rounded-2xl">
        {/* ── Header (WhatsApp style) ── */}
        <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {freelancerName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{freelancerName}</p>
            <p className="text-[11px] text-[#aed9d4]">en línea</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto bg-[#e5ddd5] bg-opacity-50" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23d4c9b8\" fill-opacity=\"0.15\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-[#075e54] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500">Cargando conversación...</p>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 space-y-1">
              {/* Quick Messages (solo si no hay mensajes) */}
              {showQuickMessages && messages.length === 0 && (
                <div className="mb-4">
                  <div className="text-center mb-3">
                    <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-slate-100">
                      <span className="text-lg">💬</span>
                      <span className="text-xs font-medium text-slate-600">
                        Envía un mensaje rápido
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {QUICK_MESSAGES.map((msg, i) => (
                      <QuickMessageButton
                        key={i}
                        message={msg}
                        onClick={sendMessage}
                        disabled={isSending}
                      />
                    ))}
                  </div>
                  <div className="text-center mt-3">
                    <button
                      onClick={() => setShowQuickMessages(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 underline"
                    >
                      O escribe manualmente ↓
                    </button>
                  </div>
                </div>
              )}

              {/* Mensajes agrupados por fecha */}
              {groupedMessages.map((group) => (
                <div key={group.date}>
                  <DateDivider date={group.date} />
                  {group.messages.map((msg) => (
                    <div key={msg.id} className="mb-1">
                      <WhatsAppBubble
                        message={msg}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Input (WhatsApp style) ── */}
        <div className="bg-[#f0f0f0] px-3 py-2 flex items-end gap-2 flex-shrink-0 relative">
          {/* Sticker button */}
          <button
            onClick={() => setShowStickers(!showStickers)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-700 hover:bg-white transition-colors flex-shrink-0"
            title="Stickers"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Sticker picker */}
          {showStickers && (
            <StickerPicker
              onSelect={sendSticker}
              onClose={() => setShowStickers(false)}
            />
          )}

          {/* Attach button */}
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-700 hover:bg-white transition-colors flex-shrink-0"
            title="Adjuntar archivo"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text input */}
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={1}
            className="flex-1 resize-none bg-white border-0 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#075e54]/30 max-h-32"
            style={{ height: "auto" }}
          />

          {/* Send button */}
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isSending}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#075e54] text-white hover:bg-[#0a7a6e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
