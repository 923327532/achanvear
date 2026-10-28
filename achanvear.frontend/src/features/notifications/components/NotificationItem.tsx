// features/notifications/components/NotificationItem.tsx
import {
  Bell, Briefcase, Video, DollarSign,
  CheckCircle, FileText, TrendingDown, Clock,
} from "lucide-react";
import { getCategoryConfig, type Notification } from "../types/notification.types";

interface Props {
  notification: Notification;
  onRead: (id: string) => void;
}

const CATEGORY_ICON: Record<string, React.ElementType> = {
  JOB:         Briefcase,
  INTERVIEW:   Video,
  PAYMENT:     DollarSign,
  APPLICATION: CheckCircle,
  REPORT:      FileText,
  COMMISSION:  TrendingDown,
};

export function formatTime(dateStr: string, now: number = Date.now()): string {
  const time = new Date(dateStr).getTime();
  if (Number.isNaN(time)) return "Fecha no disponible";

  const diff = Math.max(0, now - time);
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Hace un momento";
  if (mins < 60) return `Hace ${mins} minuto${mins !== 1 ? "s" : ""}`;
  if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? "s" : ""}`;
  if (days < 30) return `Hace ${days} día${days !== 1 ? "s" : ""}`;
  return new Date(time).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function NotificationItem({ notification, onRead }: Props) {
  const { category, title, message, createdAt, read, id } = notification;
  const config = getCategoryConfig(category);
  const Icon = CATEGORY_ICON[category] ?? Bell;

  return (
    <div
      onClick={() => !read && onRead(id)}
      className={`flex items-start gap-4 p-4 rounded-xl border bg-white transition-all cursor-pointer hover:shadow-sm ${
        !read
          ? `border-l-4 ${config.borderColor} border-t border-r border-b border-gray-100`
          : "border border-gray-100"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug mb-0.5 ${!read ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
          {title}
        </p>
        <p className="text-xs text-gray-500 leading-relaxed mb-2">{message}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          {formatTime(createdAt)}
        </div>
      </div>

      {!read && (
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />
      )}
    </div>
  );
}