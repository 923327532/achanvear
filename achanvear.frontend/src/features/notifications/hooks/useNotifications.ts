// features/notifications/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../api/notificationApi";
import type { Notification } from "../types/notification.types";

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationApi.getNotifications,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const notifications: Notification[] = query.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Marcar una como leída
  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await notificationApi.markAsRead(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
        (old ?? []).map((n) =>
          n.id === id ? { ...n, read: true } : n
        )
      );
    },
  });

  // Marcar todas como leídas
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await notificationApi.markAllAsRead();
    },
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
        (old ?? []).map((n) => ({ ...n, read: true }))
      );
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    isError: query.isError,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    isMarkingAll: markAllAsRead.isPending,
  };
}
