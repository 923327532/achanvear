// providers/AuthProvider.tsx
"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/authApi";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/storage";
import type {
  AuthContextState,
  AuthStatus,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  UserProfile,
} from "@/features/auth/types/auth.types";

const AuthContext = createContext<AuthContextState | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>("PENDING");
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      setStatus("UNAUTHENTICATED");
      return;
    }

    authApi
      .me()
      .then((currentUser) => {
        setUser(currentUser);
        setStatus("AUTHENTICATED");
      })
      .catch((err) => {
        const httpStatus = err?.response?.status ?? err?.status;
        if (httpStatus === 401 || httpStatus === 403 || httpStatus === 400) {
          clearAuthToken();
          setUser(null);
          setStatus("UNAUTHENTICATED");
        } else {
          setStatus("AUTHENTICATED");
        }
      });
  }, []);

  const login = async (payload: LoginRequest): Promise<UserProfile> => {
    const response = await authApi.login(payload);

    if (response.tokenType === "2FA_REQUIRED") {
      setIs2FARequired(true);
      setTempToken(response.token);
      setPendingUser(response.user);
      throw new Error("2FA_REQUIRED");
    }

    queryClient.clear();
    setAuthToken(response.token);
    setUser(response.user);
    setStatus("AUTHENTICATED");
    return response.user;
  };

  const complete2FALogin = async (tempTokenValue: string, code: string): Promise<UserProfile> => {
    const response = await authApi.complete2FALogin(tempTokenValue, code);
    queryClient.clear();
    setAuthToken(response.token);
    setUser(response.user);
    setStatus("AUTHENTICATED");
    setIs2FARequired(false);
    setTempToken(null);
    setPendingUser(null);
    return response.user;
  };

  const register = async (payload: RegisterRequest): Promise<UserProfile> => {
    const response = await authApi.register(payload);
    queryClient.clear();
    setAuthToken(response.token);
    setUser(response.user);
    setStatus("AUTHENTICATED");
    return response.user;
  };

  const requestPasswordReset = async (payload: ForgotPasswordRequest) => {
    return authApi.forgotPassword(payload);
  };

  const logout = () => {
    clearAuthToken();
    window.location.assign("/login");
  };

  const value = useMemo(
    () => ({ 
      user, 
      status, 
      login, 
      register, 
      requestPasswordReset, 
      logout,
      complete2FALogin,
      is2FARequired,
      tempToken,
      pendingUser,
    }),
    [status, user, is2FARequired, tempToken, pendingUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextState => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};