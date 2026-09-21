// src/features/auth/hooks/useResetPassword.ts
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/features/auth/api/authApi";
import { getFriendlyErrorMessage } from "@/lib/friendlyErrors";
import { useState } from "react";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
      .regex(/[a-z]/, "Debe incluir al menos una minúscula")
      .regex(/[0-9]/, "Debe incluir al menos un número")
      .regex(/[^A-Za-z0-9]/, "Debe incluir al menos un carácter especial"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function useResetPassword() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token") ?? "";
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setFormError(null);
      await authApi.resetPassword({ token: data.token, newPassword: data.newPassword });
      router.push("/login");
    } catch (err) {
      setFormError(getFriendlyErrorMessage(err));
    }
  };

  return {
    register: form.register,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    formError,
    onSubmit: form.handleSubmit(onSubmit),
  };
}