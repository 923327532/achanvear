// src/features/auth/api/authApi.ts

import api, { parseResponse } from "@/lib/axiosClient";
import type {
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  RegisterResponseData,
  ForgotPasswordRequest,
  ForgotPasswordResponseData,
  ResetPasswordRequest,
  UserProfile,
  AuthResponse,
  ApiResponse,
} from "@/features/auth/types/auth.types";

export const authApi = {
  // POST /auth/login
  login: async (payload: LoginRequest): Promise<{ token: string; user: UserProfile; tokenType: string }> => {
    const response = await api.post<ApiResponse<LoginResponseData>>(
      "/auth/login",
      payload
    );
    const data = parseResponse(response);
    return {
      token: data.accessToken,
      user: data.user,
      tokenType: data.tokenType,
    };
  },

  // POST /auth/register
  register: async (payload: RegisterRequest): Promise<RegisterResponseData> => {
    const response = await api.post<ApiResponse<RegisterResponseData>>(
      "/auth/register",
      payload
    );
    return parseResponse(response);
  },

  // GET /auth/me
  me: async (): Promise<UserProfile> => {
    const response = await api.get<ApiResponse<UserProfile>>("/auth/me");
    return parseResponse(response);
  },

  // POST /auth/forgot-password
  forgotPassword: async (payload: ForgotPasswordRequest): Promise<ForgotPasswordResponseData> => {
    const response = await api.post<ApiResponse<ForgotPasswordResponseData>>(
      "/auth/forgot-password",
      payload
    );
    return parseResponse(response);
  },

  // POST /auth/reset-password
  resetPassword: async (payload: ResetPasswordRequest): Promise<void> => {
    await api.post("/auth/reset-password", payload);
  },

  // POST /auth/2fa/complete-login - complete login with 2FA code
  complete2FALogin: async (tempToken: string, code: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<LoginResponseData>>(
      "/auth/2fa/complete-login",
      { tempToken, code }
    );
    const data = parseResponse(response);
    return {
      token: data.accessToken,
      user: data.user,
    };
  },
};
