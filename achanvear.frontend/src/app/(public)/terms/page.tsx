// app/(public)/terms/page.tsx
import type { Metadata } from "next";
import { LegalDocumentPage } from "@/features/compliance/components/LegalDocumentPage";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso de Achanvear, la plataforma peruana para publicar empleos, buscar trabajo y contratar freelancers y profesionales independientes.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return <LegalDocumentPage type="TERMS" />;
}

