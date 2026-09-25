"use client";

import { useState, useRef } from "react";
import { Camera, Pencil, Check, X, Loader2, BadgeCheck } from "lucide-react";
import { useUpdateProfile, useUploadFile } from "../hooks/useProfile";
import type { Profile } from "../types/profile.types";

interface Props {
  profile: Profile;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export function ProfileHeader({ profile }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [biography, setBiography] = useState(profile.biography ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateAsync, isLoading: isSaving }   = useUpdateProfile();
  const { uploadAsync, isLoading: isUploading } = useUploadFile();

  const profileId   = profile.id;
  const displayName = profile.name || "Freelancer";
  const initials    = getInitials(displayName);

  const handleSave = async () => {
    if (!profileId) return;
    await updateAsync({ profileId, payload: { biography } });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setBiography(profile.biography ?? "");
    setIsEditing(false);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profileId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const publicUrl = await uploadAsync({ file, folder: "PROFILE_PHOTO" });
    await updateAsync({ profileId, payload: { profilePhotoUrl: publicUrl } });
  };

  const averageStars  = profile.reputationScore?.averageStars ?? 0;
  const totalRatings  = profile.reputationScore?.totalRatings ?? 0;
  const recommendPct  = profile.reputationScore?.recommendationPercentage ?? 0;
  const certCount     = (profile.certifications ?? []).length;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-5">
      <div className="h-40 bg-gradient-to-r from-[#1B3A6B] to-[#0EA5A0]" />

      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-[#1B3A6B] flex items-center justify-center">
              {profile.profilePhotoUrl ? (
                <img src={profile.profilePhotoUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{initials}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !profileId}
              className="absolute bottom-0 right-0 w-7 h-7 bg-[#0EA5A0] rounded-full flex items-center justify-center border-2 border-white hover:bg-teal-600 transition-colors disabled:opacity-50"
            >
              {isUploading
                ? <Loader2 className="w-3 h-3 text-white animate-spin" />
                : <Camera className="w-3 h-3 text-white" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              disabled={!profileId}
              className="flex items-center gap-1.5 text-sm font-medium text-[#1B3A6B] border border-[#1B3A6B]/30 px-4 py-2 rounded-xl hover:bg-[#1B3A6B]/5 transition-colors disabled:opacity-40"
            >
              <Pencil className="w-3.5 h-3.5" /> Editar perfil
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={handleCancel}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                <X className="w-3.5 h-3.5" /> Cancelar
              </button>
              <button onClick={handleSave} disabled={isSaving}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1B3A6B] px-4 py-2 rounded-xl hover:bg-[#0EA5A0] transition-colors disabled:opacity-50">
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Guardar
              </button>
            </div>
          )}
        </div>

        {/* Nombre */}
        <h1 className="text-xl font-bold text-[#1B3A6B] mb-1">{displayName}</h1>

        {/* Specialty • Industry */}
        {(profile.specialty || profile.industry) && (
          <p className="text-sm text-gray-500 mb-2">
            {[profile.specialty, profile.industry].filter(Boolean).join(" • ")}
          </p>
        )}

        {/* Verificado */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0EA5A0] bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            <BadgeCheck className="w-3.5 h-3.5" />
            Verificado por Achanvear
          </span>
        </div>

        {/* Biografía */}
        {isEditing ? (
          <textarea
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] resize-none mb-3"
            placeholder="Cuéntanos sobre ti..."
          />
        ) : (
          profile.biography && (
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{profile.biography}</p>
          )
        )}

        {/* Redes sociales (mismo diseño que perfil empresa) */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <a
            href={`https://linkedin.com/search/results/all/?keywords=${encodeURIComponent(displayName)}`}
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
            href={`https://twitter.com/search?q=${encodeURIComponent(displayName)}`}
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
            href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://achanvear.com/freelancer/${profile.userId || ""}`)}`}
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
            href={`https://instagram.com/${encodeURIComponent(displayName.replace(/\s+/g, "").toLowerCase())}`}
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

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100 mt-4">
          <div className="text-center">
            <p className="text-xl font-bold text-amber-500">
              {averageStars > 0 ? averageStars.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Calificación</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[#1B3A6B]">{totalRatings}</p>
            <p className="text-xs text-gray-400 mt-0.5">Reseñas</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[#0EA5A0]">
              {recommendPct > 0 ? `${recommendPct}%` : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Recomendación</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-emerald-600">{certCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">Certificaciones</p>
          </div>
        </div>
      </div>
    </div>
  );
}
