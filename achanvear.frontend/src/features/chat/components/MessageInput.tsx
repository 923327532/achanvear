// features/chat/components/MessageInput.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Paperclip, X, Loader2, File, Image, Smile } from "lucide-react";
import { chatApi } from "../api/chatApi";


interface Props {
  onSend: (content: string) => Promise<string | undefined>;
  isLoading: boolean;
  conversationId?: string;
  onAttachmentUploaded?: () => void;
}



const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-rar-compressed",
  "text/plain",
  "text/csv",
];

interface SelectedFile {
  file: File;
  preview?: string;
}

// Emojis comunes para el picker
const EMOJIS = [
  "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊",
  "😋", "😎", "😍", "🥰", "😘", "😗", "😙", "😚", "🙂", "🤗",
  "🤩", "🤔", "🤨", "😐", "😑", "😶", "🙄", "😏", "😣", "😥",
  "😮", "🤐", "😯", "😪", "😫", "😴", "😌", "😛", "😜", "😝",
  "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "☹️", "🙁",
  "😖", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩",
  "🤯", "😬", "😰", "😱", "🥵", "🥶", "😳", "🤪", "😵", "😡",
  "😠", "🤬", "👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌",
  "👐", "🤲", "🤝", "🙏", "✌️", "🤟", "🤘", "👌", "❤️", "💔",
  "💕", "💞", "💗", "💖", "💘", "💝", "💯", "🔥", "⭐", "✨",
];

export function MessageInput({ onSend, isLoading, conversationId, onAttachmentUploaded }: Props) {

  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  // ─── Manejar selección de archivo ──────────────────────────────────────────
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith("image/")) {
      setUploadError("Tipo de archivo no permitido");
      return;
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("El archivo excede el tamaño máximo de 10 MB");
      return;
    }

    setUploadError(null);

    // Crear preview para imágenes
    let preview: string | undefined;
    if (file.type.startsWith("image/")) {
      preview = URL.createObjectURL(file);
    }

    setSelectedFile({ file, preview });
  }, []);

  // ─── Remover archivo seleccionado ──────────────────────────────────────────
  const removeFile = useCallback(() => {
    if (selectedFile?.preview) {
      URL.revokeObjectURL(selectedFile.preview);
    }
    setSelectedFile(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [selectedFile]);

  // ─── Enviar mensaje (con o sin archivo) ────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (isLoading || isUploading) return;

    // Si hay archivo seleccionado
    if (selectedFile) {
      setIsUploading(true);
      try {
        // 1. Enviar mensaje de texto primero (si hay contenido) y obtener el messageId
        let messageId: string | undefined;
        if (inputValue.trim()) {
          messageId = await onSend(inputValue.trim());
        } else if (conversationId) {
          // Si no hay texto, crear un mensaje vacío para poder adjuntar el archivo
          messageId = await onSend("");
        }

        // 2. Subir archivo como adjunto si tenemos messageId
        if (messageId && selectedFile) {
          await chatApi.uploadAttachment(messageId, selectedFile.file);
          // Refrescar mensajes para que se vea el attachment
          onAttachmentUploaded?.();
        }
      } catch (err) {
        console.error("Error al enviar archivo:", err);
        setUploadError("Error al subir el archivo");
      } finally {
        setInputValue("");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setIsUploading(false);
      }

      return;
    }

    // Solo texto
    if (inputValue.trim()) {
      onSend(inputValue.trim());
      setInputValue("");
    }
  }, [inputValue, selectedFile, isLoading, isUploading, onSend, conversationId]);



  // ─── Enter para enviar ─────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Auto-resize textarea ──────────────────────────────────────────────────
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    setInputValue(el.value);
  };

  const canSend = (inputValue.trim() || selectedFile) && !isLoading && !isUploading;

  return (
    <div className="bg-white border-t border-[#E5E7EB] px-3 py-2 flex-shrink-0">
      {/* ── File preview ── */}
      {selectedFile && (
        <div className="mb-2 px-1">
          <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-lg p-2.5 border border-[#E2E8F0] relative">
            <button
              onClick={removeFile}
              className="absolute -top-2 -right-2 w-5 h-5 bg-[#EF4444] text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
            >
              <X className="w-3 h-3" />
            </button>

            {selectedFile.preview ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={selectedFile.preview}
                  alt={selectedFile.file.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                <File className="w-6 h-6 text-[#64748B]" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#0F172A] truncate">
                {selectedFile.file.name}
              </p>
              <p className="text-[10px] text-[#64748B]">
                {(selectedFile.file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Error message ── */}
      {uploadError && (
        <div className="mb-2 px-1">
          <p className="text-[11px] text-[#EF4444]">{uploadError}</p>
        </div>
      )}

      {/* ── Emoji picker simple ── */}
      {showEmojiPicker && (
        <div className="mb-2 px-1">
          <div className="bg-white rounded-lg border border-[#E2E8F0] p-2 shadow-lg">
            <div className="flex flex-wrap gap-1">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setInputValue((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                    textareaRef.current?.focus();
                  }}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[#F8FAFC] rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Input row ── */}
      <div className="flex items-end gap-2">
        {/* Attach button */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-9 h-9 flex items-center justify-center rounded-full text-[#64748B] hover:text-[#2563EB] hover:bg-[#F8FAFC] transition-colors flex-shrink-0 disabled:opacity-50"
          title="Adjuntar archivo"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Emoji button */}
        <button
          onClick={() => setShowEmojiPicker((v) => !v)}
          disabled={isUploading}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors flex-shrink-0 disabled:opacity-50 ${
            showEmojiPicker
              ? "bg-[#2563EB] text-white"
              : "text-[#64748B] hover:text-[#2563EB] hover:bg-[#F8FAFC]"
          }`}
          title="Emojis"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={selectedFile ? "Añade un comentario..." : "Escribe un mensaje..."}
          rows={1}
          className="flex-1 resize-none bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 max-h-32"
          style={{ height: "auto" }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

    </div>
  );
}
