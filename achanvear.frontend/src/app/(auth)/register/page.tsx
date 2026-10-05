// src/app/(auth)/register/page.tsx
import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Crear cuenta gratis",
  description:
    "Crea tu cuenta gratis en Achanvear y empieza hoy: publica empleos y contrata freelancers si eres empresa, o busca empleo y proyectos como profesional independiente en Perú.",
  keywords: [
    "crear cuenta",
    "registrarse",
    "publicar empleo",
    "buscar empleo",
    "freelancer Perú",
    "trabajar como independiente",
  ],
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    title: "Crear cuenta gratis en Achanvear",
    description:
      "Publica empleos o encuentra trabajo como freelancer en la plataforma de talento peruano.",
    images: ["/opengraph-image.png"],
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
