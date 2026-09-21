// features/chat/components/AttachmentBubble.tsx
import { useState } from "react";
import { FileText, FileSpreadsheet, FileArchive, File, Download, ImageIcon, FileType } from "lucide-react";
import type { Attachment } from "../types/chat.types";

interface Props {
  attachment: Attachment;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <ImageIcon className="w-8 h-8 text-blue-500" />;
  if (mimeType.includes("pdf")) return <FileText className="w-8 h-8 text-red-500" />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("xlsx") || mimeType.includes("xls")) {
    return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
  }
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar") || mimeType.includes("gz")) {
    return <FileArchive className="w-8 h-8 text-amber-600" />;
  }
  if (mimeType.includes("word") || mimeType.includes("document") || mimeType.includes("docx") || mimeType.includes("doc")) {
    return <FileType className="w-8 h-8 text-blue-600" />;
  }
  return <File className="w-8 h-8 text-slate-500" />;
}

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

// ─── Image Preview ────────────────────────────────────────────────────────────

function ImagePreview({ url, originalName }: { url: string; originalName: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <ImageIcon className="w-8 h-8 text-slate-400" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-600 truncate">{originalName}</p>
          <p className="text-[10px] text-red-400">No se pudo cargar la imagen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <img
        src={url}
        alt={originalName}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`max-w-full rounded-lg cursor-pointer transition-all hover:opacity-95 ${
          loaded ? "block" : "hidden"
        }`}
        style={{ maxHeight: "300px", objectFit: "contain" }}
        loading="lazy"
      />
      {!loaded && (
        <div className="flex items-center justify-center h-32 bg-slate-100 rounded-lg animate-pulse">
          <ImageIcon className="w-6 h-6 text-slate-300" />
        </div>
      )}
      {/* Click to open in new tab */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 cursor-pointer"
        title="Abrir imagen"
      />
    </div>
  );
}

// ─── Document Card ────────────────────────────────────────────────────────────

function DocumentCard({ attachment }: { attachment: Attachment }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Intentar descargar directamente desde la URL pública
      const response = await fetch(attachment.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = attachment.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: abrir en nueva pestaña
      window.open(attachment.url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-3 w-full text-left p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group"
    >
      <div className="flex-shrink-0">
        {getFileIcon(attachment.mimeType)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate group-hover:text-slate-900">
          {attachment.originalName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-slate-400">{formatFileSize(attachment.fileSize)}</span>
          <span className="text-[10px] text-slate-300">•</span>
          <span className="text-[10px] text-slate-400">{getFileExtension(attachment.originalName)}</span>
        </div>
      </div>
      <div className="flex-shrink-0">
        {downloading ? (
          <div className="w-5 h-5 border-2 border-[#075e54] border-t-transparent rounded-full animate-spin" />
        ) : (
          <Download className="w-4 h-4 text-slate-400 group-hover:text-[#075e54] transition-colors" />
        )}
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AttachmentBubble({ attachment }: Props) {
  if (isImage(attachment.mimeType)) {
    return <ImagePreview url={attachment.url} originalName={attachment.originalName} />;
  }

  return <DocumentCard attachment={attachment} />;
}
