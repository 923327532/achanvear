// features/notifications/api/notificationApi.ts
import axiosClient from "@/lib/axiosClient";
import type { EmailNotification, Notification } from "../types/notification.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const notificationApi = {
  // GET /notifications?recipient=email
  getEmailNotifications: async (recipient: string): Promise<EmailNotification[]> => {
    const res = await axiosClient.get<ApiResponse<EmailNotification[]>>("/notifications", {
      params: { recipient },
    });
    return res.data.data;
  },

  // GET /notifications/in-app
  getNotifications: async (): Promise<Notification[]> => {
    const res = await axiosClient.get<ApiResponse<Notification[]>>("/notifications/in-app");
    return res.data.data ?? [];
  },

  // PATCH /notifications/:id/read
  markAsRead: async (id: string): Promise<void> => {
    await axiosClient.patch(`/notifications/${id}/read`);
  },

  // PATCH /notifications/read-all
  markAllAsRead: async (): Promise<void> => {
    await axiosClient.patch("/notifications/read-all");
  },
};
