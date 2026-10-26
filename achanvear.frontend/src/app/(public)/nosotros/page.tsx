import type { Metadata } from "next";
import { AboutAchanvear } from "@/components/brand/AboutAchanvear";
import { TrustSection } from "@/components/brand/TrustSection";

export const metadata: Metadata = { title: "Nosotros · Del talento al trabajo", description: "Conoce el origen académico y la identidad peruana de Achanvear: menos distancia entre lo que sabes hacer y la oportunidad de demostrarlo.", alternates: { canonical: "/nosotros" } };

export default function AboutPage() { return <><AboutAchanvear full /><TrustSection /></>; }
