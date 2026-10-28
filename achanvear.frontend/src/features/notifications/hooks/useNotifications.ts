// features/notifications/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../api/notificationApi";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Notification } from "../types/notification.types";

export function useNotifications() {
  const queryClient = useQueryClient();
  const { status } = useAuth();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationApi.getNotifications,
    staleTime: 1000 * 60 * 3,
    retry: 1,
    enabled: status === "AUTHENTICATED",
  });

  const notifications: Notification[] = query.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await notificationApi.markAsRead(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
        (old ?? []).map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    },
  });

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

  const dismissMarkError = () => {
    markAsRead.reset();
    markAllAsRead.reset();
  };

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    isRefetching: query.isFetching && !query.isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    isMarkingAll: markAllAsRead.isPending,
    markError: markAsRead.isError || markAllAsRead.isError,
    dismissMarkError,
  };
}