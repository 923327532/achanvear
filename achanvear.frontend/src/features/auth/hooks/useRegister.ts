// src/features/auth/hooks/useRegister.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { dniService } from "@/features/auth/api/dniApi";
import { professionalSchema, companySchema } from "@/features/auth/schemas/auth.schema";
import type { ProfessionalFormData, CompanyFormData, UserRole } from "@/features/auth/schemas/auth.schema";
import { getFriendlyErrorMessage } from "@/lib/friendlyErrors";
import { setAuthToken, clearAuthToken } from "@/lib/storage";

// Schema unificado — valida según el campo role
const unifiedSchema = z.discriminatedUnion("role", [
  // FREELANCER
  z.object({
    role: z.literal("FREELANCER"),
    dni: z.string().min(1, "El DNI es requerido").regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),
    fullName: z.string().min(1, "El nombre completo es requerido"),
    email: z.string().min(1, "El correo es requerido").email("Ingresa un correo válido"),
    phone: z.string().regex(/^\d{9}$/, "El teléfono debe tener exactamente 9 dígitos").optional().or(z.literal("")),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    passwordConfirmation: z.string().min(1, "Confirma tu contraseña"),
    representanteDni: z.string().optional(),
    representanteLegal: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, "Debes aceptar los términos y condiciones"),
    acceptPrivacy: z.boolean().refine((val) => val === true, "Debes aceptar la política de privacidad"),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirmation"],
  }),
  // COMPANY
  z.object({
    role: z.literal("COMPANY"),
    ruc: z.string().regex(/^\d{11}$/, "El RUC debe tener 11 dígitos"),
    fullName: z.string().min(1, "La razón social es requerida"),
    representanteLegal: z.string().min(1, "El nombre del representante legal es requerido"),
    representanteDni: z.string().optional(),
    email: z.string().min(1, "El correo es requerido").email("Ingresa un correo válido"),
    phone: z.string().regex(/^\d{9}$/, "El teléfono debe tener exactamente 9 dígitos").optional().or(z.literal("")),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    passwordConfirmation: z.string().min(1, "Confirma tu contraseña"),
    dni: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, "Debes aceptar los términos y condiciones"),
    acceptPrivacy: z.boolean().refine((val) => val === true, "Debes aceptar la política de privacidad"),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirmation"],
  }),
]);

export function useRegister() {
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>("FREELANCER");
  const [formError, setFormError] = useState<string | null>(null);
  const [isValidatingDni, setIsValidatingDni] = useState(false);
  const [isValidatingRepDni, setIsValidatingRepDni] = useState(false);
  const [isGoogleSignUp, setIsGoogleSignUp] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const isCompany = selectedRole === "COMPANY";

  const form = useForm<any>({
    mode: "onChange",
    defaultValues: {
      role: "FREELANCER",
      dni: "",
      fullName: "",
      phone: "",
      email: "",
      password: "GoogleSignUp123!", // Valor por defecto para Google (nunca se envía)
      passwordConfirmation: "GoogleSignUp123!",
      representanteDni: "",
      representanteLegal: "",
      ruc: "",
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  useEffect(() => {
    // Limpiar sesión anterior al entrar a la página de registro
    clearAuthToken();

    const googleData = sessionStorage.getItem("googleSignUp");
    if (googleData) {
      setIsGoogleSignUp(true);
      try {
        const parsed = JSON.parse(googleData);
        if (parsed.email) form.setValue("email", parsed.email, { shouldValidate: true });
        if (parsed.name) form.setValue("fullName", parsed.name, { shouldValidate: true });
      } catch (e) {
        // Ignorar error de parse
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isGoogleSignUp) form.trigger();
  }, [isGoogleSignUp]);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setFormError(null);
    form.reset({
      role,
      dni: "",
      fullName: "",
      representanteDni: "",
      representanteLegal: "",
      ruc: "",
      phone: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      acceptTerms: false,
      acceptPrivacy: false,
    });
  };

  const handleDniBlur = async (dni: string) => {
    if (selectedRole !== "FREELANCER" || dni.length !== 8) return;
    setIsValidatingDni(true);
    setFormError(null);
    try {
      const dniData = await dniService.validateDni(dni);
      const fullName = `${dniData.nombres} ${dniData.apellidoPaterno} ${dniData.apellidoMaterno}`;
      form.setValue("fullName" as keyof (ProfessionalFormData | CompanyFormData), fullName as never);
    } catch (err) {
      setFormError(getFriendlyErrorMessage(err));
    } finally {
      setIsValidatingDni(false);
    }
  };

  const handleRepDniBlur = async (dni: string) => {
    if (selectedRole !== "COMPANY" || dni.length !== 8) return;
    setIsValidatingRepDni(true);
    setFormError(null);
    try {
      const dniData = await dniService.validateDni(dni);
      const fullName = `${dniData.nombres} ${dniData.apellidoPaterno} ${dniData.apellidoMaterno}`;
      form.setValue("representanteLegal" as keyof (ProfessionalFormData | CompanyFormData), fullName as never);
    } catch (err) {
      setFormError(getFriendlyErrorMessage(err));
    } finally {
      setIsValidatingRepDni(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setFormError(null);
      clearAuthToken(); // Limpiar sesión anterior antes de registrar

      if (isGoogleSignUp) {
        const googleData = sessionStorage.getItem("googleSignUp");
        if (!googleData) throw new Error("No se encontraron datos de Google. Por favor, intenta de nuevo.");

        const parsed = JSON.parse(googleData);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/google/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idToken: parsed.idToken,
              dni: data.role === "FREELANCER" ? (data as ProfessionalFormData).dni : undefined,
              phone: data.phone || undefined,
              role: data.role,
              acceptTerms: data.acceptTerms,
              acceptPrivacy: data.acceptPrivacy,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Error al registrarse con Google");
        }

        const result = await response.json();
        setAuthToken(result.data.accessToken);
        sessionStorage.removeItem("googleSignUp");
        router.push(data.role === "COMPANY" ? "/onboarding/company" : "/onboarding/freelancer");
        return;
      }

      // Registro normal con email/contraseña
      const registerPayload: any = {
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone || undefined,
        acceptTerms: data.acceptTerms,
        acceptPrivacy: data.acceptPrivacy,
      };

      if (data.role === "FREELANCER") {
        registerPayload.dni = (data as ProfessionalFormData).dni;
        registerPayload.fullName = (data as ProfessionalFormData).fullName;
      }

      if (data.role === "COMPANY") {
        // Mismo payload que CreateCompanyAccountStep usa exitosamente
        registerPayload.fullName = (data as CompanyFormData).representanteLegal || "Representante";
        registerPayload.dni = "00000000"; // fallback requerido por el backend
        registerPayload.representanteDni = (data as CompanyFormData).representanteDni || "00000000";
        registerPayload.representanteLegal = (data as CompanyFormData).representanteLegal;
        registerPayload.ruc = (data as any).ruc || undefined;
      }

      console.log("📤 Payload:", registerPayload);
      await registerUser(registerPayload);

      // Guardar datos de empresa en sessionStorage para el onboarding wizard
      if (data.role === "COMPANY") {
        sessionStorage.setItem("company_onboarding_data", JSON.stringify({
          ruc: (data as any).ruc || "",
          razonSocial: (data as any).fullName || "",
          representanteLegal: (data as CompanyFormData).representanteLegal || "",
          representanteLegalDni: (data as CompanyFormData).representanteDni || "",
          email: data.email,
        }));
      }

      router.push(data.role === "COMPANY" ? "/onboarding/company" : "/onboarding/freelancer");
    } catch (err) {
      setFormError(getFriendlyErrorMessage(err));
    }
  };

  return {
    form,
    selectedRole,
    isCompany,
    formError,
    isValidatingDni,
    isValidatingRepDni,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
    handleRoleChange,
    handleDniBlur,
    handleRepDniBlur,
    onSubmit: form.handleSubmit(onSubmit),
    dniValue: form.watch("dni" as any),
    repDniValue: form.watch("representanteDni" as any),
    isGoogleSignUp,
    isHydrated,
  };
}