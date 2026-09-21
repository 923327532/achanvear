// features/notifications/types/notification.types.ts

// ─── Backend shape ────────────────────────────────────────────────────────────

export type NotificationStatus = "PENDING" | "SENT";

export type NotificationEmailType = "WELCOME";

export interface EmailNotification {
  id: string;
  recipient: string;
  subject: string;
  type: NotificationEmailType;
  status: NotificationStatus;
  createdAt: string;
  sentAt: string;
}

// ─── In-app notification (UI) ─────────────────────────────────────────────────
// El backend aún no tiene notificaciones in-app — se usa mock data por ahora

export type NotificationCategory =
  | "JOB"
  | "INTERVIEW"
  | "PAYMENT"
  | "APPLICATION"
  | "REPORT"
  | "COMMISSION";

export interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export const CATEGORY_CONFIG: Record<
  NotificationCategory,
  { color: string; bgColor: string; borderColor: string }
> = {
  JOB:         { color: "text-blue-600",   bgColor: "bg-blue-50",   borderColor: "border-blue-400" },
  INTERVIEW:   { color: "text-rose-600",   bgColor: "bg-rose-50",   borderColor: "border-rose-400" },
  PAYMENT:     { color: "text-emerald-600",bgColor: "bg-emerald-50",borderColor: "border-emerald-400" },
  APPLICATION: { color: "text-teal-600",   bgColor: "bg-teal-50",   borderColor: "border-teal-400" },
  REPORT:      { color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-400" },
  COMMISSION:  { color: "text-amber-600",  bgColor: "bg-amber-50",  borderColor: "border-amber-400" },
};
