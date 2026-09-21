// src/features/auth/hooks/useLogin.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { homeRouteForRole } from "@/lib/constants";
import { getFriendlyErrorMessage } from "@/lib/friendlyErrors";
import type { LoginFormData } from "@/features/auth/schemas/auth.schema";

export function useLogin() {
  const router = useRouter();
  const { login, is2FARequired, complete2FALogin, tempToken } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFALoading, setTwoFALoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setFormError(null);
      const user = await login(data);
      router.push(homeRouteForRole(user.role));
    } catch (err: any) {
      if (err?.message === "2FA_REQUIRED") {
        // 2FA step will be shown, no error needed
        return;
      }
      setFormError(getFriendlyErrorMessage(err));
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFACode || twoFACode.length !== 6 || !tempToken) return;
    setTwoFALoading(true);
    try {
      const user = await complete2FALogin(tempToken, twoFACode);
      router.push(homeRouteForRole(user.role));
    } catch (err: any) {
      setFormError(getFriendlyErrorMessage(err));
    } finally {
      setTwoFALoading(false);
    }
  };

  return {
    register: form.register,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    formError,
    onSubmit: form.handleSubmit(onSubmit),
    is2FARequired,
    twoFACode,
    setTwoFACode,
    handleVerify2FA,
    twoFALoading,
  };
}
