// app/(public)/privacy/page.tsx
import type { Metadata } from "next";
import { LegalDocumentPage } from "@/features/compliance/components/LegalDocumentPage";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad de Achanvear: cómo protegemos y tratamos tus datos en la plataforma de empleo y freelancers del Perú.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return <LegalDocumentPage type="PRIVACY" />;
}

