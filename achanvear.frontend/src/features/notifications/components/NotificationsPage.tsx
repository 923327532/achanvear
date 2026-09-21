// features/notifications/components/NotificationsPage.tsx
"use client";

import { Bell, Loader2 } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

function Skeleton() {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-48" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-24" />
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAll,
  } = useNotifications();

  return (
    <div className="min-h-full bg-gray-50/50">
      <div className="px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A6B]">Notificaciones</h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              disabled={isMarkingAll}
              className="flex items-center gap-2 text-sm font-medium text-[#1B3A6B] hover:text-[#0EA5A0] transition-colors disabled:opacity-50"
            >
              {isMarkingAll && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Marcar todas como leídas
            </button>
          )}
        </div>

        {/* List */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">
                No tienes notificaciones
              </h3>
              <p className="text-xs text-gray-400">
                Te avisaremos cuando haya novedades en tu cuenta
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}