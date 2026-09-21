// features/chat/api/chatApi.ts
import axiosClient from "@/lib/axiosClient";
import type { Conversation, Message, SendMessagePayload, Attachment, DownloadAttachmentResponse, FreelancerProfileResponse, CompanyProfileResponse } from "../types/chat.types";

export const chatApi = {
  // GET /chat/conversations
  getConversations: async (): Promise<Conversation[]> => {
    const res = await axiosClient.get<{ data: Conversation[] }>("/chat/conversations");
    return res.data.data;
  },

  // GET /chat/conversations/:id/messages
  getMessages: async (conversationId: string): Promise<Message[]> => {
    const res = await axiosClient.get<{ data: Message[] }>(`/chat/conversations/${conversationId}/messages`);
    return res.data.data;
  },

  // POST /chat/messages
  sendMessage: async (payload: SendMessagePayload): Promise<Message> => {
    const res = await axiosClient.post<{ data: Message }>("/chat/messages", payload);
    return res.data.data;
  },

  // DELETE /chat/messages/:messageId
  deleteMessage: async (messageId: string): Promise<void> => {
    await axiosClient.delete(`/chat/messages/${messageId}`);
  },

  // DELETE /chat/conversations/:id
  deleteConversation: async (conversationId: string): Promise<void> => {
    await axiosClient.delete(`/chat/conversations/${conversationId}`);
  },

  // POST /chat/conversations - Start a new conversation with a user
  startConversation: async (userId: string): Promise<Conversation> => {
    const res = await axiosClient.post<{ data: Conversation }>("/chat/conversations", {
      freelancerUserId: userId,
    });
    return res.data.data;
  },

  // POST /chat/messages/:messageId/attachments - Upload file attachment
  uploadAttachment: async (messageId: string, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosClient.post<{ data: Attachment }>(
      `/chat/messages/${messageId}/attachments`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data.data;
  },

  // GET /chat/attachments/:attachmentId/download - Get download URL
  getDownloadUrl: async (attachmentId: string): Promise<DownloadAttachmentResponse> => {
    const res = await axiosClient.get<{ data: DownloadAttachmentResponse }>(
      `/chat/attachments/${attachmentId}/download`
    );
    return res.data.data;
  },

  // GET /freelance/profiles/:freelancerId - Get freelancer profile
  getFreelancerProfile: async (freelancerId: string): Promise<FreelancerProfileResponse> => {
    const res = await axiosClient.get<{ data: FreelancerProfileResponse }>(`/freelance/profiles/${freelancerId}`);
    return res.data.data;
  },

  // GET /companies/:id - Get company profile
  getCompanyProfile: async (companyId: string): Promise<CompanyProfileResponse> => {
    const res = await axiosClient.get<{ data: CompanyProfileResponse }>(`/companies/${companyId}`);
    return res.data.data;
  },
};
