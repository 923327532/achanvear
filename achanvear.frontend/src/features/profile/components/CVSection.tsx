// features/profile/components/CVSection.tsx
"use client";

import { useRef } from "react";
import { FileText, Upload, Download, Loader2 } from "lucide-react";
import { useUpdateProfile } from "../hooks/useProfile";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";
import { useState } from "react";
import type { Profile } from "../types/profile.types";

interface Props {
  profile: Profile;
}

function getFileName(url: string | null) {
  if (!url) return null;
  return url.split("/").pop() ?? url;
}

export function CVSection({ profile }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateAsync, isLoading: isSaving } = useUpdateProfile();
  const [isUploading, setIsUploading]        = useState(false);

  const isLoading = isUploading || isSaving;
  const fileName  = getFileName(profile.curriculumUrl);
  const profileId = profile.id;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profileId) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Usar /freelance/storage/upload con folder=CURRICULUM
      const { publicFileUrl } = await onboardingService.uploadFile("CURRICULUM", file);
      await updateAsync({ profileId, payload: { curriculumUrl: publicFileUrl } });
    } catch (err) {
      console.error("Error subiendo CV:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
      <h2 className="text-base font-bold text-[#1B3A6B] mb-5">Gestión de CV</h2>

      <div className="border border-gray-100 rounded-xl p-4 mb-4">
        {fileName ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-[#1B3A6B]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">Currículum Vitae</p>
              <p className="text-xs text-gray-400 truncate">{fileName}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">No has subido tu CV aún</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || !profileId}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-[#1B3A6B] border border-[#1B3A6B]/30 rounded-xl py-2.5 hover:bg-[#1B3A6B]/5 transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {fileName ? "Actualizar CV" : "Subir CV"}
        </button>

        {fileName && (
          <a
            href={profile.curriculumUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}