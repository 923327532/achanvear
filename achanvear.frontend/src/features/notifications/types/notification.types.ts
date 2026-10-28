// features/notifications/types/notification.types.ts

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

export type KnownNotificationCategory =
  | "JOB"
  | "INTERVIEW"
  | "PAYMENT"
  | "APPLICATION"
  | "REPORT"
  | "COMMISSION";

export type NotificationCategory = KnownNotificationCategory | (string & {});

export interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface CategoryStyle {
  color: string;
  bgColor: string;
  borderColor: string;
}

export const CATEGORY_CONFIG: Record<KnownNotificationCategory, CategoryStyle> = {
  JOB:         { color: "text-blue-600",    bgColor: "bg-blue-50",    borderColor: "border-blue-400" },
  INTERVIEW:   { color: "text-rose-600",    bgColor: "bg-rose-50",    borderColor: "border-rose-400" },
  PAYMENT:     { color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-400" },
  APPLICATION: { color: "text-teal-600",    bgColor: "bg-teal-50",    borderColor: "border-teal-400" },
  REPORT:      { color: "text-purple-600",  bgColor: "bg-purple-50",  borderColor: "border-purple-400" },
  COMMISSION:  { color: "text-amber-600",   bgColor: "bg-amber-50",   borderColor: "border-amber-400" },
};

export const DEFAULT_CATEGORY_CONFIG: CategoryStyle = {
  color: "text-slate-600",
  bgColor: "bg-slate-100",
  borderColor: "border-slate-400",
};

export const getCategoryConfig = (category: string): CategoryStyle =>
  (CATEGORY_CONFIG as Record<string, CategoryStyle>)[category] ?? DEFAULT_CATEGORY_CONFIG;