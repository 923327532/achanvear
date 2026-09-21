//lib/storage.ts
import { STORAGE_KEYS } from "@/lib/constants";

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEYS.authToken);
};

export const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.authToken, token);
};

export const clearAuthToken = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.authToken);
};
