// src/features/auth/api/dniApi.ts
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "@/lib/constants";
import { ApiError } from "@/lib/errors";
import type { ApiResponse } from "@/features/auth/types/auth.types";

export interface DniResponse {
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  ubigeo: string;
  fechaNacimiento: string;
  sexo: string;
}

// GET /integration/dni/:dni
// Instancia sin JWT — endpoint público
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 segundos para consultas externas
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para convertir errores a ApiError
publicApi.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.request && !error.response) {
      return Promise.reject(new ApiError("Error de conexión con el servidor"));
    }
    const message = (error.response?.data as any)?.message ?? error.message ?? "Error inesperado";
    return Promise.reject(new ApiError(message));
  }
);

export const dniService = {
  validateDni: async (dni: string): Promise<DniResponse> => {
    const response = await publicApi.get<ApiResponse<DniResponse>>(`/integration/dni/${dni}`);
    // La respuesta puede venir envuelta en ApiResponse o directamente como DniResponse
    const data = response.data;
    // Si tiene la estructura ApiResponse, extraemos data.data
    if (data && typeof data === "object" && "success" in data && "data" in data) {
      return (data as ApiResponse<DniResponse>).data;
    }
    return data as unknown as DniResponse;
  },
};
