// src/features/auth/schemas/auth.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "El correo es requerido").email("Ingresa un correo válido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

// ── Regla reutilizable de contraseña segura ───────────────────────────────────
const securePassword = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
  .regex(/[a-z]/, "Debe incluir al menos una minúscula")
  .regex(/[0-9]/, "Debe incluir al menos un número")
  .regex(/[^A-Za-z0-9]/, "Debe incluir al menos un carácter especial");

export const professionalSchema = z
  .object({
    role: z.literal("FREELANCER"),
    dni: z.string().min(1, "El DNI es requerido").regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),
    fullName: z.string().min(1, "El nombre completo es requerido"),
    email: z.string().min(1, "El correo es requerido").email("Ingresa un correo válido"),
    phone: z.string().regex(/^\d{9}$/, "El teléfono debe tener exactamente 9 dígitos").optional().or(z.literal("")),
    password: securePassword, // ← antes era z.string().min(8, ...)
    passwordConfirmation: z.string().min(1, "Confirma tu contraseña"),
    acceptTerms: z.boolean().refine((val) => val === true, "Debes aceptar los términos y condiciones"),
    acceptPrivacy: z.boolean().refine((val) => val === true, "Debes aceptar la política de privacidad"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirmation"],
  });

export const companySchema = z
  .object({
    role: z.literal("COMPANY"),
    ruc: z.string().regex(/^\d{11}$/, "El RUC debe tener 11 dígitos"),
    fullName: z.string().min(1, "La razón social es requerida"),
    representanteLegal: z.string().min(1, "El nombre del representante legal es requerido"),
    representanteDni: z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos").optional(),
    email: z.string().min(1, "El correo es requerido").email("Ingresa un correo válido"),
    phone: z.string().regex(/^\d{9}$/, "El teléfono debe tener exactamente 9 dígitos").optional().or(z.literal("")),
    password: securePassword, // ← antes era z.string().min(8, ...)
    passwordConfirmation: z.string().min(1, "Confirma tu contraseña"),
    acceptTerms: z.boolean().refine((val) => val === true, "Debes aceptar los términos y condiciones"),
    acceptPrivacy: z.boolean().refine((val) => val === true, "Debes aceptar la política de privacidad"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirmation"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "El correo es requerido").email("Ingresa un correo válido"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token requerido"),
    newPassword: securePassword, // ← reutiliza la misma regla
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type ProfessionalFormData = z.infer<typeof professionalSchema>;
export type CompanyFormData = z.infer<typeof companySchema>;
export type RegisterFormData = ProfessionalFormData | CompanyFormData;
export type UserRole = "FREELANCER" | "COMPANY";