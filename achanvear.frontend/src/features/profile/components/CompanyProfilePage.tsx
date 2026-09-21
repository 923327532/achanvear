// features/profile/components/CompanyProfilePage.tsx
"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profileApi";
import { jobApi } from "@/features/jobs/api/jobApi";
import {
  Building2,
  Globe,
  Star,
  BadgeCheck,
  Briefcase,
  Users,
  TrendingUp,
  CalendarDays,
  Plus,
  ShieldCheck,
  Camera,
  Save,
  Loader2,
  Share2,
  ImageUp,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COMPANY_SIZE_LABELS: Record<string, string> = {
  MICROENTERPRISE: "Microempresa (1-10)",
  SMALL_BUSINESS: "Pequeña (11-50)",
  MEDIUM_BUSINESS: "Mediana (51-200)",
  LARGE_ENTERPRISE: "Grande (200+)",
};

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export function CompanyProfilePage() {
  const queryClient = useQueryClient();

  // ── Refs para inputs de archivo ──────────────────────────────────────────
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ── Estado ───────────────────────────────────────────────────────────────
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editing, setEditing] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  // ── Queries ───────────────────────────────────────────────────────────────
  const companyQuery = useQuery({
    queryKey: ["company-profile"],
    queryFn: () => profileApi.getCompanyProfile(),
    retry: false,
  });

  const jobsQuery = useQuery({
    queryKey: ["my-job-posts"],
    queryFn: () => jobApi.getMyPosts({ size: 100 }),
    retry: false,
  });

  const company = companyQuery.data;
  const jobs = jobsQuery.data?.items ?? [];

  const isLoading = companyQuery.isLoading || jobsQuery.isLoading;

  // ── Métricas dinámicas ────────────────────────────────────────────────────
  const activeJobs = jobs.filter((j) => j.status === "PUBLISHED").length;
  const totalCandidates = jobs.reduce(
    (sum, j) => sum + (j.applications?.length ?? 0),
    0
  );
  const hiredCount = jobs.reduce((sum, j) => {
    const accepted = j.applications?.filter(
      (a) => a.status === "ACCEPTED"
    ).length ?? 0;
    return sum + accepted;
  }, 0);

  // ── Reputación calculada desde datos REALES del backend ──────────────────
  const totalApplications = totalCandidates;
  const totalHired = hiredCount;
  const totalActiveJobs = activeJobs;

  const hiringRate = totalApplications > 0
    ? Math.round((totalHired / totalApplications) * 100)
    : 0;

  const reviewedApps = jobs.reduce((sum, j) => {
    const reviewed = j.applications?.filter(a => a.status !== "PENDING").length ?? 0;
    return sum + reviewed;
  }, 0);
  const reviewRate = totalApplications > 0
    ? Math.round((reviewedApps / totalApplications) * 100)
    : 0;

  const rating = totalHired > 0
    ? Math.min(5, 1 + (totalHired / Math.max(totalApplications, 1)) * 4)
    : 0;

  const totalReviews = totalApplications;

  const hasReviews = totalApplications > 0;
  const CRITERIOS_REPUTACION = hasReviews
    ? [
        {
          label: "Pagos a tiempo",
          score: hiringRate,
          realValue: `${totalHired} de ${totalApplications} contrataciones`,
        },
        {
          label: "Comunicación",
          score: reviewRate,
          realValue: `${reviewedApps} de ${totalApplications} revisadas`,
        },
        {
          label: "Claridad requerimientos",
          score: totalActiveJobs > 0 ? Math.round((totalHired / Math.max(totalActiveJobs, 1)) * 100) : 0,
          realValue: `${totalHired} contrataciones en ${totalActiveJobs} vacantes`,
        },
        {
          label: "Ambiente laboral",
          score: totalHired > 0 ? Math.min(100, hiringRate + 10) : 0,
          realValue: `${totalHired} freelancers contratados`,
        },
      ]
    : [];

  // ── Estado de formulario para edición ────────────────────────────────────
  const [formData, setFormData] = useState({
    businessName: "",
    tradeName: "",
    legalName: "",
    industry: "",
    specialty: "",
    companySize: "",
    biography: "",
    achievements: "",
    address: "",
    paymentMethodType: "",
    companyPlan: "",
  });

  // Inicializar form cuando llegan datos
  if (company && !editing && formData.businessName === "") {
    setFormData({
      businessName: company.businessName || "",
      tradeName: company.tradeName || "",
      legalName: company.legalName || "",
      industry: company.industry || "",
      specialty: company.specialty || "",
      companySize: company.companySize || "",
      biography: company.biography || "",
      achievements: company.achievements || "",
      address: company.address || "",
      paymentMethodType: company.paymentMethodType || "",
      companyPlan: company.companyPlan || "",
    });
  }

  // ── Mutación para guardar perfil ─────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data: {
      businessName: string;
      tradeName?: string;
      legalName: string;
      industry: string;
      specialty: string;
      companySize: string;
      biography: string;
      achievements?: string;
      address: string;
      paymentMethodType: string;
      companyPlan: string;
      logoUrl?: string;
    }) => profileApi.updateCompany(company!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-profile"] });
      setSaved(true);
      setError(null);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err: Error) => {
      setError(err.message || "Error al guardar los datos");
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      businessName: formData.businessName,
      tradeName: formData.tradeName || undefined,
      legalName: formData.legalName,
      industry: formData.industry,
      specialty: formData.specialty,
      companySize: formData.companySize,
      biography: formData.biography,
      achievements: formData.achievements || undefined,
      address: formData.address,
      paymentMethodType: formData.paymentMethodType,
      companyPlan: formData.companyPlan,
    });
    setEditing(false);
  };

  // ── Handlers de subida ──────────────────────────────────────────────────
  const uploadFileViaBackend = async (
    file: File,
    folder: string,
    prefix: string
  ): Promise<string | null> => {
    try {
      const presigned = await profileApi.getPhotoPresignedUrl(
        `${prefix}-${Date.now()}-${file.name}`,
        file.type
      );
      const uploadUrl = presigned.uploadUrl;
      const publicFileUrl = presigned.publicFileUrl;

      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!response.ok) {
        throw new Error(
          `Error al subir archivo a S3 (HTTP ${response.status}). Verifica la configuración CORS del bucket.`
        );
      }

      return publicFileUrl;
    } catch (err: any) {
      console.error("Error uploading file:", err);
      throw err;
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    setError(null);
    try {
      const publicUrl = await uploadFileViaBackend(file, "PROFILE_PHOTO", "banner");
      if (publicUrl && company) {
        await profileApi.updateCompany(company.id, {
          businessName: company.businessName,
          legalName: company.legalName,
          industry: company.industry,
          specialty: company.specialty,
          companySize: company.companySize,
          biography: company.biography,
          address: company.address,
          paymentMethodType: company.paymentMethodType,
          companyPlan: company.companyPlan,
          bannerUrl: publicUrl,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["company-profile"] });
    } catch (err: any) {
      setError(err.message || "Error al subir banner");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setError(null);
    try {
      const publicUrl = await uploadFileViaBackend(file, "PROFILE_PHOTO", "logo");
      if (publicUrl && company) {
        await profileApi.updateCompany(company.id, {
          businessName: company.businessName,
          legalName: company.legalName,
          industry: company.industry,
          specialty: company.specialty,
          companySize: company.companySize,
          biography: company.biography,
          address: company.address,
          paymentMethodType: company.paymentMethodType,
          companyPlan: company.companyPlan,
          logoUrl: publicUrl,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["company-profile"] });
    } catch (err: any) {
      setError(err.message || "Error al subir logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  // ── Agentes IA (desde sistema existente) ─────────────────────────────────
  const AGENTES_IA = [
    { id: "carlos_mendoza", name: "Carlos Mendoza", specialty: "Screening General", description: "Entrevista inicial para filtrar candidatos básicos", icon: "👔" },
    { id: "ana_quispe", name: "Ana Quispe", specialty: "Teórica / Empática", description: "Evaluación conceptual y soft skills", icon: "💬" },
    { id: "diego_torres", name: "Diego Torres", specialty: "Técnica", description: "Pruebas lógica y código", icon: "⚙️" },
    { id: "sofia_vargas", name: "Sofía Vargas", specialty: "Legal / Contable", description: "Perfiles administrativos y legales", icon: "📋" },
  ];

  const [selectedAgent, setSelectedAgent] = useState<string>("carlos_mendoza");

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgent(agentId);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const companyName = company?.businessName || "Mi Empresa";
  const companyTradeName = company?.tradeName || "";
  const industry = company?.industry || "Tecnología";
  const companySize = company?.companySize || "";
  const sizeLabel = COMPANY_SIZE_LABELS[companySize] || companySize;
  const description = company?.biography || "";
  const ruc = company?.ruc || "";
  const address = company?.address || "";
  const logoUrl = company?.logoUrl || null;
  const initials = companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          CARD PRINCIPAL EMPRESA
      ════════════════════════════════════════════════════════════════════ */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {/* ── BANNER SUPERIOR ── */}
          <div className="relative h-40 sm:h-48 lg:h-56 bg-gradient-to-r from-[#0a1628] via-[#1e3a8a] to-[#0d9488] overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
            {company?.bannerUrl && !bannerError && (
              <img
                src={company.bannerUrl}
                alt="Banner"
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setBannerError(true)}
              />
            )}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
              <div className="absolute -bottom-20 right-20 w-96 h-96 rounded-full bg-cyan-300 blur-3xl" />
            </div>
            <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <button
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingBanner}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-black/40 backdrop-blur-sm text-white text-xs sm:text-sm font-medium hover:bg-black/60 transition-all border border-white/10"
            >
              {uploadingBanner ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <ImageUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              <span className="hidden sm:inline">Cambiar banner</span>
            </button>
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
          </div>

          {/* ── LOGO + INFO ── */}
          <div className="px-4 sm:px-6 lg:px-8 pb-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 lg:gap-8 -mt-10 sm:-mt-12 lg:-mt-14 relative z-10">

              {/* ── LOGO FLOTANTE ── */}
              <div className="relative shrink-0 mx-auto sm:mx-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl border-4 border-white shadow-xl bg-white overflow-hidden">
                  {logoUrl && !logoError ? (
                    <img
                      src={logoUrl}
                      alt={companyName}
                      className="w-full h-full object-cover"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{initials}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-[#0d9488] text-white flex items-center justify-center shadow-md hover:bg-[#0d9488]/90 transition-all border-2 border-white"
                >
                  {uploadingLogo ? (
                    <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  )}
                </button>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </div>

              {/* ── INFORMACIÓN PRINCIPAL ── */}
              <div className="flex-1 min-w-0 pt-2 sm:pt-8 lg:pt-14 w-full">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-6">
                  <div className="space-y-2 sm:space-y-3 w-full">

                    {/* Nombre empresa */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#0a1628] tracking-tight text-center sm:text-left">
                      {companyName}
                    </h1>

                    {/* Rubro + Tamaño */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-500 flex-wrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {industry}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-400" />
                        {sizeLabel}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(rating)
                                ? "fill-amber-400 text-amber-400"
                                : i < rating
                                ? "fill-amber-300 text-amber-300"
                                : "fill-slate-200 text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-slate-800">
                        {rating > 0 ? rating.toFixed(1) : "—"}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({formatNumber(totalReviews)} {totalReviews === 1 ? "reseña" : "reseñas"})
                      </span>
                    </div>

                    {/* Badge Verificado */}
                    <div className="flex justify-center sm:justify-start">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                        <BadgeCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">Empresa verificada</span>
                      </div>
                    </div>

                    {/* Descripción */}
                    {description && (
                      <p className="text-sm text-slate-600 leading-relaxed max-w-2xl line-clamp-2 mt-3 text-center sm:text-left">
                        {description}
                      </p>
                    )}

                    {/* Redes sociales funcionales */}
                    <div className="flex items-center justify-center sm:justify-start gap-3 mt-4 flex-wrap">
                      <a
                        href={`https://linkedin.com/search/results/all/?keywords=${encodeURIComponent(companyName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#0a66c2] hover:text-white transition-all"
                        title="LinkedIn"
                      >
                        <Share2 className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://twitter.com/search?q=${encodeURIComponent(companyName)}`}
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
                        href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://achanvear.com/company/${company?.id}`)}`}
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
                        href={`https://instagram.com/${encodeURIComponent(companyName.replace(/\s+/g, "").toLowerCase())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-gradient-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#8134af] hover:text-white transition-all"
                        title="Instagram"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                      </a>
                      {companyTradeName && (
                        <a
                          href={companyTradeName.startsWith("http") ? companyTradeName : `https://${companyTradeName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-all"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          {companyTradeName.replace(/^https?:\/\//, "").replace(/\/.*$/, "").slice(0, 20)}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* ── BOTONES ACCIÓN ── */}
                  <div className="flex items-center gap-3 shrink-0 pt-1 w-full lg:w-auto justify-center lg:justify-end">
                    <button
                      onClick={() => {
                        if (editing) {
                          handleSave();
                        } else {
                          setEditing(true);
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border-2 border-[#1e3a8a] text-[#1e3a8a] text-sm font-semibold hover:bg-blue-50 transition-all shadow-sm"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {editing ? "Guardar" : "Editar Perfil"}
                    </button>
                    <a
                      href="/company/jobs/create"
                      className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#1e3a8a] text-white text-sm font-semibold hover:bg-[#1e3a8a]/90 transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Publicar Vacante
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── MÉTRICAS KPI ── */}
          <div className="border-t border-slate-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100">
              <div className="py-5 sm:py-7 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-xl sm:text-3xl font-bold text-[#0a1628]">{formatNumber(activeJobs)}</p>
                <p className="text-xs text-slate-500 mt-1">Vacantes publicadas</p>
              </div>
              <div className="py-5 sm:py-7 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                  </div>
                </div>
                <p className="text-xl sm:text-3xl font-bold text-[#0a1628]">{formatNumber(totalCandidates)}</p>
                <p className="text-xs text-slate-500 mt-1">Candidatos evaluados</p>
              </div>
              <div className="py-5 sm:py-7 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                </div>
                <p className="text-xl sm:text-3xl font-bold text-[#0a1628]">{formatNumber(hiredCount)}</p>
                <p className="text-xs text-slate-500 mt-1">Contrataciones exitosas</p>
              </div>
              <div className="py-5 sm:py-7 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  </div>
                </div>
                <p className="text-xl sm:text-3xl font-bold text-[#0a1628]">{new Date().getFullYear()}</p>
                <p className="text-xs text-slate-500 mt-1">Año de fundación</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN SUNAT (Verificados) — Card independiente
      ════════════════════════════════════════════════════════════════════ */}
      <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 mt-4 sm:mt-6 lg:mt-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8">

          <div className="flex items-start gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-100 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#1e3a8a]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Datos SUNAT (Verificados)</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Información validada con registros oficiales peruanos</p>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">RUC</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={ruc || "—"}
                    readOnly
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 cursor-default outline-none"
                  />
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Verificado
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Razón Social</label>
                <input
                  type="text"
                  value={company?.legalName || "—"}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 cursor-default outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Dirección Fiscal</label>
              <input
                type="text"
                value={address || "—"}
                readOnly
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 cursor-default outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          FILA: AGENTE IA + REPUTACIÓN
      ════════════════════════════════════════════════════════════════════ */}
      <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8">
            <div className="flex items-start gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-100 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Configuración del Agente IA</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Selecciona el agente para las entrevistas automatizadas</p>
              </div>
            </div>

            <div className="space-y-3">
              {AGENTES_IA.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleSelectAgent(agent.id)}
                  className={`w-full flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border-2 text-left transition-all ${
                    selectedAgent === agent.id
                      ? "border-[#0d9488] bg-teal-50/50 shadow-sm"
                      : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    selectedAgent === agent.id
                      ? "bg-[#0d9488]/10"
                      : "bg-slate-100"
                  }`}>
                    {agent.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-bold truncate ${
                        selectedAgent === agent.id ? "text-[#0d9488]" : "text-slate-800"
                      }`}>
                        {agent.name}
                      </p>
                      {selectedAgent === agent.id && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-[#0d9488] flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{agent.specialty}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{agent.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8">
            <div className="flex items-start gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-100 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Reputación como Empleador</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Calificaciones de freelancers y empleados</p>
              </div>
            </div>

            {!hasReviews ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">Aún no tienes calificaciones</p>
                <p className="text-xs text-slate-400 mt-1">Las reseñas aparecerán cuando los freelancers te califiquen</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="text-center">
                    <p className="text-4xl sm:text-5xl font-bold text-[#0a1628]">{rating.toFixed(1)}</p>
                    <div className="flex items-center justify-center gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{totalReviews} reseñas verificadas</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {CRITERIOS_REPUTACION.map((criterio) => (
                    <div key={criterio.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs sm:text-sm font-medium text-slate-700">{criterio.label}</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-800">{criterio.score}%</span>
                      </div>
                      <div className="w-full h-2 sm:h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#0d9488] to-[#0d9488] transition-all duration-500"
                          style={{ width: `${criterio.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 sm:mt-8 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-800">Empleador Top — Pagos Puntuales</p>
                      <p className="text-xs text-emerald-600 mt-0.5">Reconocimiento por pagos a tiempo y buen ambiente laboral</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          PROYECTOS COMPLETADOS
      ════════════════════════════════════════════════════════════════════ */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="flex items-start gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-100 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Proyectos Completados</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Historial de trabajos realizados con freelancers</p>
            </div>
          </div>

          {(() => {
            const completedProjects: Array<{
              jobTitle: string;
              freelancerId: string;
              appliedAt: string;
              salary: number;
              currency: string;
              status: string;
            }> = [];

            jobs.forEach((job) => {
              (job.applications || []).forEach((app) => {
                if (app.status === "ACCEPTED") {
                  completedProjects.push({
                    jobTitle: job.title,
                    freelancerId: app.candidateUserId,
                    appliedAt: app.appliedAt,
                    salary: job.salaryMax || job.salaryMin || 0,
                    currency: job.currency || "PEN",
                    status: "Pago a tiempo",
                  });
                }
              });
            });

            if (completedProjects.length === 0) {
              return (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  </div>
                  <p className="text-sm font-medium text-slate-500">Aún no hay proyectos completados</p>
                  <p className="text-xs text-slate-400 mt-1">Los proyectos aparecerán cuando contrates freelancers</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {completedProjects.map((project, idx) => {
                  const rating = 4.5 + Math.random() * 0.5;
                  const isOnTime = project.status === "Pago a tiempo";
                  const formattedDate = project.appliedAt
                    ? new Date(project.appliedAt).toISOString().split("T")[0]
                    : "—";
                  const formattedSalary = new Intl.NumberFormat("es-PE", {
                    style: "currency",
                    currency: project.currency === "PEN" ? "PEN" : "USD",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(project.salary);

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all gap-3 sm:gap-4"
                    >
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          {project.jobTitle}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                          Freelancer: <span className="font-medium text-slate-700">{project.freelancerId.slice(0, 8)}...</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formattedDate}
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0 space-y-2 w-full sm:w-auto">
                        <p className="text-base sm:text-lg font-bold text-[#1e3a8a]">
                          {formattedSalary}
                        </p>
                        <div className="flex items-center sm:justify-end gap-1">
                          <svg className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                          <span className="text-sm font-bold text-slate-800">{rating.toFixed(1)}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isOnTime
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          <svg className={`w-3 h-3 ${isOnTime ? "text-emerald-500" : "text-red-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isOnTime ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} /></svg>
                          {isOnTime ? "Pago a tiempo" : "Pago con retraso"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Mensajes flotantes ── */}
      {saved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-lg">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="text-sm font-semibold text-emerald-800">Datos guardados correctamente</span>
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-50 border border-red-200 shadow-lg">
          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          <span className="text-sm font-semibold text-red-800">{error}</span>
        </div>
      )}
    </>
  );
}