import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "@/lib/constants";
import { ApiError } from "@/lib/errors";
import { getAuthToken } from "@/lib/storage";
import { getStatusMessage, isTechnicalMessage } from "@/lib/friendlyErrors";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutos para generación de IA
  headers: {
    "Content-Type": "application/json",
  },
});



api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    // Errores de red (sin respuesta del servidor)
    if (error.request && !error.response) {
      if (error.code === "ECONNABORTED") {
        return Promise.reject(new ApiError("La conexión está tardando demasiado. Intenta de nuevo."));
      }
      return Promise.reject(new ApiError("No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo."));
    }

    const status = error.response?.status;
    const data = (error.response?.data as any);

    // Nunca exponer errores internos del servidor (5xx).
    if (status && status >= 500) {
      return Promise.reject(new ApiError(getStatusMessage(500), status));
    }

    // Para errores de negocio/validación (4xx) usamos el mensaje del backend si es
    // claro y en español; si es técnico, lo reemplazamos por un mensaje genérico.
    const raw = data?.errors?.[0] ?? data?.message ?? error.message;
    const message = typeof raw === "string" && !isTechnicalMessage(raw)
      ? raw
      : getStatusMessage(status);

    return Promise.reject(new ApiError(message, status));
  }
);

export const parseResponse = <T>(response: { data: ApiResponse<T> }): T => response.data.data;

export default api;
