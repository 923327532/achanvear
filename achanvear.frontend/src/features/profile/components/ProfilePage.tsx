// features/profile/components/ProfilePage.tsx
"use client";

import { useMyProfile } from "../hooks/useProfile";
import { useAuthContext } from "@/providers/AuthProvider";
import { ProfileHeader } from "./ProfileHeader";
import { SkillsSection } from "./SkillsSection";
import { AchievementsSection } from "./AchievementsSection";
import { CertificationsSection } from "./CertificationsSection";
import { PortfolioSection } from "./PortfolioSection";
import { AIEvaluationsSection } from "./AIEvaluationsSection";
import { CvManagerSection } from "./CvManagerSection";

import {
  Star, BadgeCheck, Briefcase, ShieldCheck,
  GraduationCap, Award, Code2, Plus, Save,
} from "lucide-react";
import { useState } from "react";
import type { FreelancerProfile } from "../types/profile.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIRTUAL PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

function VirtualProfileView({ profile }: { profile: any }) {
  const [bannerError, setBannerError] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  const name     = profile?.name || "Freelancer";
  const dni      = profile?.dni  || "";
  const initials = getInitials(name);

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Banner */}
          <div className="relative h-40 sm:h-48 lg:h-56 bg-gradient-to-r from-[#0a1628] via-[#1e3a8a] to-[#0d9488] overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
            {profile?.bannerUrl && !bannerError && (
              <img src={profile.bannerUrl} alt="Banner"
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setBannerError(true)} />
            )}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
              <div className="absolute -bottom-20 right-20 w-96 h-96 rounded-full bg-cyan-300 blur-3xl" />
            </div>
            <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-v" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-v)" />
            </svg>
          </div>

          {/* Foto + Info */}
          <div className="px-4 sm:px-6 lg:px-8 pb-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 lg:gap-8 -mt-10 sm:-mt-12 lg:-mt-14 relative z-10">
              <div className="relative shrink-0 mx-auto sm:mx-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl border-4 border-white shadow-xl bg-white overflow-hidden">
                  {profile?.profilePhotoUrl && !photoError ? (
                    <img src={profile.profilePhotoUrl} alt={name}
                      className="w-full h-full object-cover"
                      onError={() => setPhotoError(true)} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{initials}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 pt-2 sm:pt-8 lg:pt-14 w-full">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-6">
                  <div className="space-y-2 sm:space-y-3 w-full">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#0a1628] tracking-tight text-center sm:text-left">{name}</h1>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-500 flex-wrap">
                      <span className="inline-flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-slate-400" /> Freelancer
                      </span>
                    </div>
                    <div className="flex justify-center sm:justify-start">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                        <BadgeCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">Freelancer verificado</span>
                      </div>
                    </div>
                    {dni && (
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-500">
                        <span className="font-medium text-slate-700">DNI: {dni}</span>
                      </div>
                    )}
                    {/* Redes sociales (mismo diseño que perfil empresa) */}
                    <div className="flex items-center justify-center sm:justify-start gap-3 mt-4 flex-wrap">
                      <a
                        href={`https://linkedin.com/search/results/all/?keywords=${encodeURIComponent(name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#0a66c2] hover:text-white transition-all"
                        title="LinkedIn"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                      <a
                        href={`https://twitter.com/search?q=${encodeURIComponent(name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white transition-all"
                        title="Twitter / X"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                      <a
                        href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://achanvear.com/freelancer/${profile?.userId || ""}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#1877f2] hover:text-white transition-all"
                        title="Facebook"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                      <a
                        href={`https://instagram.com/${encodeURIComponent(name.replace(/\s+/g, "").toLowerCase())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-gradient-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#8134af] hover:text-white transition-all"
                        title="Instagram"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 pt-1 w-full lg:w-auto justify-center lg:justify-end">
                    <button
                      onClick={() => {
                        const sections = document.querySelector('.space-y-4');
                        if (sections) sections.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border-2 border-[#1e3a8a] text-[#1e3a8a] text-sm font-semibold hover:bg-blue-50 transition-all shadow-sm">
                      <Save className="w-4 h-4" /> Editar Perfil
                    </button>
                    <a href="/freelancer/projects"
                      className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#1e3a8a] text-white text-sm font-semibold hover:bg-[#1e3a8a]/90 transition-all shadow-sm">
                      <Briefcase className="w-4 h-4" /> Explorar Proyectos
                    </a>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Métricas KPI */}
          <div className="border-t border-slate-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100">
              {[
                { icon: Briefcase, color: "bg-blue-50 text-blue-600",   value: "0", label: "Proyectos realizados" },
                { icon: Star,      color: "bg-teal-50 text-teal-600",   value: profile?.reputationScore?.averageStars ? profile.reputationScore.averageStars.toFixed(1) : "—", label: "Calificación" },
                { icon: Code2,     color: "bg-orange-50 text-orange-600", value: String(profile?.skills?.length || 0), label: "Habilidades" },
                { icon: Award,     color: "bg-emerald-50 text-emerald-600", value: String(profile?.certifications?.length || 0), label: "Certificaciones" },
              ].map(({ icon: Icon, color, value, label }) => (
                <div key={label} className="py-5 sm:py-7 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${color.split(" ")[0]}`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color.split(" ")[1]}`} />
                    </div>
                  </div>
                  <p className="text-xl sm:text-3xl font-bold text-[#0a1628]">{value}</p>
                  <p className="text-xs text-slate-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Datos Personales */}
      <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 mt-4 sm:mt-6 lg:mt-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="flex items-start gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-100 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#1e3a8a]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Datos Personales (Verificados)</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Información validada con registros oficiales peruanos</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">DNI</label>
              <div className="flex items-center gap-3">
                <input type="text" value={dni || "—"} readOnly
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 cursor-default outline-none" />
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Verificado
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo</label>
              <input type="text" value={name || "—"} readOnly
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 cursor-default outline-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje informativo */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl sm:rounded-3xl border border-blue-200 shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Completa tu perfil profesional</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Agrega tu experiencia, habilidades, portafolio y más para que las empresas puedan conocerte mejor.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => {
                    const sections = document.querySelector('.space-y-4');
                    if (sections) sections.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3a8a] text-white text-sm font-semibold hover:bg-[#1e3a8a]/90 transition-all shadow-sm">
                  <Plus className="w-4 h-4" /> Editar Perfil
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════════════════════════════

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-8 max-w-7xl mx-auto animate-pulse space-y-5">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="h-40 bg-gray-100" />
          <div className="p-6">
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white" />
            </div>
            <div className="h-6 bg-gray-100 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-32 mb-4" />
            <div className="h-16 bg-gray-100 rounded mb-4" />
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-7 bg-gray-100 rounded mx-auto w-16 mb-1" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-32" />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export function ProfilePage() {
  const { profile, isLoading } = useMyProfile();
  const { user } = useAuthContext();

  if (isLoading) return <ProfileSkeleton />;

  // Construir perfil virtual con datos del usuario si no hay perfil completo
  const isVirtual = !profile || !profile.id;
  const effectiveProfile: FreelancerProfile = !isVirtual ? profile : {
    id: "virtual",

    userId: user?.id || "",
    name: user?.fullName || profile?.name || "Freelancer",
    dni: user?.dni || profile?.dni || "",
    industry: profile?.industry || "",
    specialty: profile?.specialty || "",
    profilePhotoUrl: profile?.profilePhotoUrl || null,
    biography: profile?.biography || "",
    achievements: profile?.achievements || "",
    address: profile?.address || "",
    paymentMethodType: profile?.paymentMethodType || "BANK_TRANSFER",
    curriculumUrl: profile?.curriculumUrl || null,
    cvData: profile?.cvData || null,
    status: profile?.status || "ACTIVE",
    certifications: profile?.certifications || [],
    headline: profile?.headline || "",
    location: profile?.location || "",
    reputationScore: profile?.reputationScore || { averageStars: 0, recommendationPercentage: 0, totalRatings: 0 },
    skills: profile?.skills || [],
    portfolioItems: profile?.portfolioItems || [],
    ratings: profile?.ratings || [],
    availabilityStatus: profile?.availabilityStatus || null,
    cvVisibility: profile?.cvVisibility || null,
    preferredCurrency: profile?.preferredCurrency || null,
    preferredPaymentMethod: profile?.preferredPaymentMethod || null,
    language: profile?.language || null,
    timezone: profile?.timezone || null,
    notificationPreferences: profile?.notificationPreferences || null,
  };

  return (

    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-8 max-w-7xl mx-auto">
        {isVirtual ? (
          <VirtualProfileView profile={effectiveProfile} />
        ) : (
          <ProfileHeader profile={effectiveProfile} />
        )}
        <div className="mt-4 sm:mt-6 lg:mt-8 space-y-4 sm:space-y-6 lg:space-y-8">
          <SkillsSection profile={effectiveProfile} />
          <AchievementsSection profile={effectiveProfile} />
          <CertificationsSection profile={effectiveProfile} />
          <AIEvaluationsSection />
          <CvManagerSection />

          <PortfolioSection profile={effectiveProfile} />
        </div>
      </div>
    </div>
  );

}
