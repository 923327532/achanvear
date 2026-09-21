"use client";

import { useRef, useState } from "react";
import { Camera, Link2, Award, Plus, Loader2, X, GraduationCap, ExternalLink } from "lucide-react";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface Certification {
  name: string;
  issuingOrganization: string;
  credentialUrl: string;
}

interface CustomizeProfileStepProps {
  data: any;
  onUpdate: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const EMPTY_CERT: Certification = { name: "", issuingOrganization: "", credentialUrl: "" };

export function CustomizeProfileStep({ data, onUpdate, onNext, onBack }: CustomizeProfileStepProps) {
  const { user } = useAuth();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Completitud ──────────────────────────────────────────────────────────────
  const certifications: Certification[] = data.certifications || [];
  const portfolioLinks: string[]        = data.portfolioLinks  || [""];
  const achievements: string[]          = data.achievements    || [""];

  const MIN_BIO_LENGTH = 100;
  const bioLength = (data.biography || "").trim().length;
  const bioError = bioLength > 0 && bioLength < MIN_BIO_LENGTH;

  const calculateCompletion = () => {
    let completed = 0;
    if (data.photo) completed += 20;
    if (bioLength >= MIN_BIO_LENGTH) completed += 20;
    if (portfolioLinks.some((l: string) => l.trim())) completed += 20;
    if (achievements.some((a: string) => a.trim())) completed += 20;
    if (certifications.some((c) => c.name.trim())) completed += 20;
    return completed;
  };

  const completion = calculateCompletion();
  const barColor   = completion === 100 ? "bg-emerald-500" : "bg-[#0EA5A0]";

  // ─── Foto ─────────────────────────────────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      onUpdate({ photo: file });
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ─── Portfolio ────────────────────────────────────────────────────────────────
  const updatePortfolioLink = (i: number, value: string) => {
    const updated = [...portfolioLinks];
    updated[i] = value;
    onUpdate({ portfolioLinks: updated });
  };
  const addPortfolioLink    = () => onUpdate({ portfolioLinks: [...portfolioLinks, ""] });
  const removePortfolioLink = (i: number) => {
    const updated = portfolioLinks.filter((_: string, idx: number) => idx !== i);
    onUpdate({ portfolioLinks: updated.length > 0 ? updated : [""] });
  };

  // ─── Logros ───────────────────────────────────────────────────────────────────
  const updateAchievement = (i: number, value: string) => {
    const updated = [...achievements];
    updated[i] = value;
    onUpdate({ achievements: updated });
  };
  const addAchievement    = () => onUpdate({ achievements: [...achievements, ""] });
  const removeAchievement = (i: number) => {
    const updated = achievements.filter((_: string, idx: number) => idx !== i);
    onUpdate({ achievements: updated.length > 0 ? updated : [""] });
  };

  // ─── Certificaciones ─────────────────────────────────────────────────────────
  const updateCert = (i: number, field: keyof Certification, value: string) => {
    const updated = certifications.map((c, idx) => idx === i ? { ...c, [field]: value } : c);
    onUpdate({ certifications: updated });
  };
  const addCert    = () => onUpdate({ certifications: [...certifications, { ...EMPTY_CERT }] });
  const removeCert = (i: number) => {
    onUpdate({ certifications: certifications.filter((_: Certification, idx: number) => idx !== i) });
  };

  // ─── Subir foto ───────────────────────────────────────────────────────────────
  const uploadPhoto = async (file: File): Promise<string | null> => {
  try {
    const { publicFileUrl } = await onboardingService.uploadFile("PROFILE_PHOTO", file);
    return publicFileUrl;
  } catch (err) {
    console.error("Error subiendo foto:", err); // ← ver qué falla
    return null;
  }
};

  // ─── Submit ───────────────────────────────────────────────────────────────────
  const handleFinish = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      let profilePhotoUrl: string | null = null;
      if (data.photo) {
        profilePhotoUrl = await uploadPhoto(data.photo);
      }

      await onboardingService.createProfile({
        name:              user?.fullName ?? "",
        industry:          data.industry  ?? "",
        specialty:         data.speciality ?? "",
        profilePhotoUrl,
        biography:         data.biography ?? "",
        achievements:      achievements.filter((a: string) => a.trim()).join(" || "),
        address:           "",
        paymentMethodType: "BANK_TRANSFER",
        dni:               user?.dni ?? "",
        curriculumUrl:     null,
        certifications:    certifications
          .filter((c) => c.name.trim())
          .map((c) => ({
            name:                c.name.trim(),
            issuingOrganization: c.issuingOrganization.trim(),
            credentialUrl:       c.credentialUrl.trim(),
          })),
      });

      onNext();
    } catch (err: any) {
      setError(err?.message ?? "Error al guardar el perfil. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[620px] mx-auto rounded-2xl bg-white p-8 shadow-sm border border-slate-200">

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-[#1B3A6B]">Personaliza tu Perfil</h1>
        <p className="mt-1.5 text-sm text-slate-500">Agrega los detalles que te harán destacar</p>
      </div>

      {/* Foto */}
      <div className="mb-6 flex flex-col items-center">
        <button type="button" onClick={() => fileInputRef.current?.click()} className="relative group">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-[#1B3A6B] flex items-center justify-center">
            {photoPreview
              ? <img src={photoPreview} alt="Foto de perfil" className="h-full w-full object-cover" />
              : <Camera className="h-8 w-8 text-white/60" strokeWidth={1.5} />}
          </div>
          <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#0EA5A0] border-2 border-white">
            <Camera className="h-3 w-3 text-white" />
          </div>
        </button>
        <p className="mt-2.5 text-xs text-slate-500">Sube una foto profesional (Recomendado)</p>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
      </div>

      {/* Biografía */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-800 mb-2">Biografía Profesional</label>
        <textarea
          value={data.biography || ""}
          onChange={(e) => onUpdate({ biography: e.target.value })}
          maxLength={500} rows={4}
          className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none transition resize-none ${
            bioError
              ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-slate-200 focus:border-[#1B3A6B]"
          }`}
          placeholder="Cuéntanos sobre ti, tu experiencia y qué te apasiona de tu trabajo..."
        />
        <div className="mt-1 flex items-center justify-between">
          {bioError ? (
            <p className="text-xs text-red-500">Mínimo {MIN_BIO_LENGTH} caracteres</p>
          ) : (
            <span />
          )}
          <p className={`text-xs ${bioError ? "text-red-400" : "text-slate-400"}`}>
            {(data.biography || "").length}/500 caracteres
          </p>
        </div>
      </div>


      {/* Links de Portafolio */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-800">Links de Portafolio</label>
          <button type="button" onClick={addPortfolioLink}
            className="flex items-center gap-1 text-xs font-semibold text-[#1B3A6B] hover:text-[#162f58] transition">
            <Plus className="h-3.5 w-3.5" /> Agregar
          </button>
        </div>
        <div className="space-y-2">
          {portfolioLinks.map((link: string, i: number) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
              <Link2 className="h-4 w-4 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
              <input type="url" value={link} onChange={(e) => updatePortfolioLink(i, e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                placeholder="https://github.com/tu-usuario" />
              {portfolioLinks.length > 1 && (
                <button type="button" onClick={() => removePortfolioLink(i)}
                  className="flex-shrink-0 text-slate-300 hover:text-red-400 transition">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Logros Destacados */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-800">Logros Destacados</label>
          <button type="button" onClick={addAchievement}
            className="flex items-center gap-1 text-xs font-semibold text-[#1B3A6B] hover:text-[#162f58] transition">
            <Plus className="h-3.5 w-3.5" /> Agregar
          </button>
        </div>
        <div className="space-y-2">
          {achievements.map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
              <Award className="h-4 w-4 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
              <input type="text" value={item} onChange={(e) => updateAchievement(i, e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                placeholder="Ej: Lideré proyecto que aumentó eficiencia en 40%" />
              {achievements.length > 1 && (
                <button type="button" onClick={() => removeAchievement(i)}
                  className="flex-shrink-0 text-slate-300 hover:text-red-400 transition">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Certificaciones */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-800">Certificaciones</label>
          <button type="button" onClick={addCert}
            className="flex items-center gap-1 text-xs font-semibold text-[#1B3A6B] hover:text-[#162f58] transition">
            <Plus className="h-3.5 w-3.5" /> Agregar
          </button>
        </div>

        {certifications.length === 0 ? (
          <button type="button" onClick={addCert}
            className="w-full rounded-xl border border-dashed border-slate-200 py-4 text-xs text-slate-400 hover:border-[#1B3A6B]/30 hover:text-[#1B3A6B] transition">
            + Agregar certificación
          </button>
        ) : (
          <div className="space-y-3">
            {certifications.map((cert, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#1B3A6B]" strokeWidth={1.5} />
                    <span className="text-xs font-semibold text-slate-700">Certificación {i + 1}</span>
                  </div>
                  <button type="button" onClick={() => removeCert(i)}
                    className="text-slate-300 hover:text-red-400 transition">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <input type="text" value={cert.name}
                  onChange={(e) => updateCert(i, "name", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#1B3A6B] transition"
                  placeholder="Nombre del certificado" />
                <input type="text" value={cert.issuingOrganization}
                  onChange={(e) => updateCert(i, "issuingOrganization", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#1B3A6B] transition"
                  placeholder="Organización emisora" />
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
                  <input type="url" value={cert.credentialUrl}
                    onChange={(e) => updateCert(i, "credentialUrl", e.target.value)}
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                    placeholder="https://... (URL de verificación)" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info final */}
      <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-[#0EA5A0]/5 border border-[#0EA5A0]/20 px-4 py-3.5">
        <Award className="h-4 w-4 flex-shrink-0 text-[#0EA5A0] mt-0.5" strokeWidth={1.5} />
        <div>
            <p className="text-xs font-semibold text-[#0EA5A0]">Tu perfil siempre estará en tus manos</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Una vez completado el registro, podrás actualizar tus logros, agregar nuevas certificaciones y enriquecer tu perfil en cualquier momento desde tu cuenta.
            </p>
          </div>
      </div>

      {/* Completitud */}
      <div className="mb-6 rounded-xl bg-slate-50 border border-slate-100 px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-800">Completitud del Perfil</span>
          <span className={`text-sm font-bold ${completion === 100 ? "text-emerald-500" : "text-[#0EA5A0]"}`}>
            {completion}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${completion}%` }} />
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1">
          {[
            { label: "Foto",         done: !!data.photo },
            { label: "Bio",          done: bioLength >= MIN_BIO_LENGTH },

            { label: "Portfolio",    done: portfolioLinks.some((l: string) => l.trim()) },
            { label: "Logros",       done: achievements.some((a: string) => a.trim()) },
            { label: "Certificados", done: certifications.some((c) => c.name.trim()) },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${done ? "bg-[#0EA5A0]" : "bg-slate-300"}`} />
              <span className={`text-[10px] ${done ? "text-[#0EA5A0]" : "text-slate-400"}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={onBack} disabled={isSubmitting}
          className="rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40">
          Atrás
        </button>
        <button type="button" onClick={handleFinish} disabled={isSubmitting}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] py-3 text-sm font-semibold text-white transition hover:bg-[#162f58] disabled:opacity-60">
          {isSubmitting
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
            : "Finalizar y comenzar"}
        </button>
      </div>
    </div>
  );
}