// features/chat/components/MessageBubble.tsx
import { useState, useRef, useEffect } from "react";
import { Edit3, Trash2, MoreVertical, CheckCheck } from "lucide-react";
import type { Message } from "../types/chat.types";
import { AttachmentBubble } from "./AttachmentBubble";

interface Props {
  message: Message;
  onEdit?: (id: string, newContent: string) => void;
  onDelete?: (id: string) => void;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({ message, onEdit, onDelete }: Props) {
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
    if (trimmed && trimmed !== message.content && onEdit) {
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
          {/* Menu de acciones */}
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-6 h-6 flex items-center justify-center rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-white transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute left-0 top-7 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-1 min-w-[130px] z-20">
                {onEdit && (
                  <button
                    onClick={() => { setIsEditing(true); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <Edit3 className="w-3 h-3" /> Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => { onDelete(message.id); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#EF4444] hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Eliminar
                  </button>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="bg-[#E0ECFF] rounded-[18px] rounded-tr-sm px-3 py-2">
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                onBlur={handleSaveEdit}
                className="bg-transparent text-sm text-[#0F172A] outline-none w-full"
              />
            </div>
          ) : isSticker ? (
            <div className="text-5xl">{message.content.replace("STICKER:", "")}</div>
          ) : (
            <div className="bg-[#E0ECFF] rounded-[18px] rounded-tr-sm px-3.5 py-2.5 shadow-sm">
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
                <p className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span className="text-[10px] text-[#64748B]">
                  {formatTime(message.sentAt)}
                </span>
                <CheckCheck className="w-3.5 h-3.5 text-[#2563EB]" strokeWidth={2} />
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
          <div className="bg-white rounded-[18px] rounded-tl-sm px-3.5 py-2.5 shadow-sm border border-[#E2E8F0]">
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
              <p className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] text-[#64748B]">
                {formatTime(message.sentAt)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
