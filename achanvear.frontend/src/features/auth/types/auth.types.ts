// src/features/auth/types/auth.types.ts

export type UserRole = "FREELANCER" | "COMPANY";
export type AuthStatus = "AUTHENTICATED" | "UNAUTHENTICATED" | "PENDING";

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  status: string;
  fullName?: string;
  dni?: string;
  phone?: string;
  representanteDni?: string;
  representanteLegal?: string;
  ruc?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: "FREELANCER" | "COMPANY";
  phone?: string;
  // Freelancer fields
  dni?: string;
  fullName?: string;
  // Company fields
  representanteDni?: string;
  representanteLegal?: string;
  ruc?: string;
  // Consentimientos obligatorios (Ley N° 29733)
  acceptTerms?: boolean;
  acceptPrivacy?: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginResponseData {
  accessToken: string;
  tokenType: string;
  user: UserProfile;
}

export interface RegisterResponseData {
  id: string;
  email: string;
  role: string;
  status: string;
}

export interface ForgotPasswordResponseData {
  message: string;
  token: string;
  expiresAt: string;
  manualMode: boolean;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface AuthState {
  status: AuthStatus;
  user: UserProfile | null;
}

export interface AuthContextState {
  status: AuthStatus;
  user: UserProfile | null;
  login: (payload: LoginRequest) => Promise<UserProfile>;
  register: (payload: RegisterRequest) => Promise<UserProfile>;
  requestPasswordReset: (payload: ForgotPasswordRequest) => Promise<ForgotPasswordResponseData>;
  logout: () => void;
  complete2FALogin: (tempToken: string, code: string) => Promise<UserProfile>;
  is2FARequired: boolean;
  tempToken: string | null;
  pendingUser: UserProfile | null;
}
