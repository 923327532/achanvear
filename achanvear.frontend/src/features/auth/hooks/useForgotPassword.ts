// src/features/auth/hooks/useForgotPassword.ts

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getFriendlyErrorMessage } from "@/lib/friendlyErrors";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es requerido")
    .email("Ingresa un correo válido"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function useForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setFormError(null);
      const response = await requestPasswordReset({ email: data.email });

      // Modo manual (correo no configurado / fallo): el backend devuelve el token
      // para poder completar el restablecimiento sin depender del email.
      if (response?.manualMode && response.token) {
        router.replace(`/reset-password?token=${encodeURIComponent(response.token)}`);
        return;
      }

      // Modo email: se envió un enlace de recuperación al correo.
      setSent(true);
    } catch (err) {
      setFormError(getFriendlyErrorMessage(err));
    }
  };

  return {
    register: form.register,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    formError,
    sent,
    onSubmit: form.handleSubmit(onSubmit),
  };
}