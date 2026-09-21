// features/chat/hooks/useChat.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../api/chatApi";
import type { SendMessagePayload } from "../types/chat.types";

// ─── Conversaciones ───────────────────────────────────────────────────────────

export function useConversations() {
  const query = useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: chatApi.getConversations,
    refetchInterval: 10000,
    staleTime: 1000 * 10,
    retry: 1,
  });

  return {
    conversations: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

// ─── Mensajes de una conversación ────────────────────────────────────────────

export function useMessages(conversationId: string | null) {
  const query = useQuery({
    queryKey: ["chat", "messages", conversationId],
    queryFn: () => chatApi.getMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 5000,
    staleTime: 1000 * 5,
    retry: 1,
  });

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

// ─── Enviar mensaje ───────────────────────────────────────────────────────────

export function useSendMessage() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: SendMessagePayload) => chatApi.sendMessage(payload),
    onSuccess: (newMessage) => {
      queryClient.setQueryData(
        ["chat", "messages", newMessage.conversationId],
        (old: typeof newMessage[] | undefined) => [...(old ?? []), newMessage]
      );
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });

  return {
    sendAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}

// ─── Eliminar mensaje ─────────────────────────────────────────────────────────

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (messageId: string) => chatApi.deleteMessage(messageId),
    onSuccess: () => {
      // Invalidar todas las queries de mensajes para que se refresquen
      queryClient.invalidateQueries({ queryKey: ["chat", "messages"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });

  return {
    deleteAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}

// ─── Eliminar conversación ────────────────────────────────────────────────────


export function useDeleteConversation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (conversationId: string) => chatApi.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });

  return {
    removeAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}
