// src/app/(auth)/reset-password/page.tsx
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-500">Cargando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
