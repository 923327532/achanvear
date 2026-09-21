"use client";

import { useState } from "react";
// Tipos locales (no exportados desde onboarding.types)
interface PortfolioLink { id: string; url: string; }
interface Achievement { id: string; description: string; }


interface StepPersonalizeProfileProps {
  profilePhotoUrl: string | null;
  onProfilePhotoChange: (url: string | null) => void;
  biography: string;
  onBiographyChange: (bio: string) => void;
  portfolioLinks: PortfolioLink[];
  onPortfolioLinksChange: (links: PortfolioLink[]) => void;
  achievements: Achievement[];
  onAchievementsChange: (achievements: Achievement[]) => void;
  onContinue: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

export function StepPersonalizeProfile({
  profilePhotoUrl,
  onProfilePhotoChange,
  biography,
  onBiographyChange,
  portfolioLinks,
  onPortfolioLinksChange,
  achievements,
  onAchievementsChange,
  onContinue,
  onBack,
  isLoading,
  error,
}: StepPersonalizeProfileProps) {
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("");
  const [newAchievement, setNewAchievement] = useState("");

  const addPortfolioLink = () => {
    if (!newPortfolioUrl.trim()) return;
    onPortfolioLinksChange([
      ...portfolioLinks,
      { id: crypto.randomUUID(), url: newPortfolioUrl.trim() },
    ]);
    setNewPortfolioUrl("");
  };

  const removePortfolioLink = (id: string) => {
    onPortfolioLinksChange(portfolioLinks.filter((l) => l.id !== id));
  };

  const addAchievement = () => {
    if (!newAchievement.trim()) return;
    onAchievementsChange([
      ...achievements,
      { id: crypto.randomUUID(), description: newAchievement.trim() },
    ]);
    setNewAchievement("");
  };

  const removeAchievement = (id: string) => {
    onAchievementsChange(achievements.filter((a) => a.id !== id));
  };

  const MIN_BIO_LENGTH = 100;
  const bioLength = biography.trim().length;
  const bioError = bioLength > 0 && bioLength < MIN_BIO_LENGTH;

  const totalFields = 5;
  const completedFields =
    (profilePhotoUrl ? 1 : 0) +
    (bioLength >= MIN_BIO_LENGTH ? 1 : 0) +
    (portfolioLinks.length > 0 ? 1 : 0) +
    (achievements.length > 0 ? 1 : 0) +
    1; // always count address as basic
  const completionPercent = Math.round((completedFields / totalFields) * 100);



  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          Personaliza tu Perfil
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Agrega los detalles que te haran destacar
        </p>
      </div>

      <div className="space-y-5">
        {/* Profile photo */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">
            Sube una foto profesional (Recomendado)
          </p>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-sm font-medium overflow-hidden">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                "Foto"
              )}
            </div>
            <button
              type="button"
              onClick={() => onProfilePhotoChange("/placeholder-profile.jpg")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Subir foto
            </button>
          </div>
        </div>

        {/* Biography */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Biografia Profesional
          </label>
          <textarea
            value={biography}
            onChange={(e) => onBiographyChange(e.target.value)}
            maxLength={500}
            rows={4}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition resize-none ${
              bioError
                ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            }`}
            placeholder="Cuentanos sobre tu experiencia profesional..."
          />
          <div className="mt-1 flex items-center justify-between">
            {bioError ? (
              <p className="text-xs text-red-500">Mínimo {MIN_BIO_LENGTH} caracteres</p>
            ) : (
              <span />
            )}
            <p className={`text-xs ${bioError ? "text-red-400" : "text-slate-400"}`}>
              {biography.length}/500 caracteres
            </p>
          </div>
        </div>


        {/* Portfolio links */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">
            Links de Portafolio
          </p>
          <div className="space-y-2">
            {portfolioLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <span className="text-xs text-slate-600 truncate flex-1">
                  {link.url}
                </span>
                <button
                  type="button"
                  onClick={() => removePortfolioLink(link.id)}
                  className="text-xs text-rose-500 hover:text-rose-600 ml-2"
                >
                  Quitar
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newPortfolioUrl}
                onChange={(e) => setNewPortfolioUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPortfolioLink();
                  }
                }}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={addPortfolioLink}
                disabled={!newPortfolioUrl.trim()}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">
            Logros Destacados
          </p>
          <div className="space-y-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <span className="text-xs text-slate-600 flex-1">
                  {achievement.description}
                </span>
                <button
                  type="button"
                  onClick={() => removeAchievement(achievement.id)}
                  className="text-xs text-rose-500 hover:text-rose-600 ml-2"
                >
                  Quitar
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAchievement();
                  }
                }}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                placeholder="Describe tu logro..."
              />
              <button
                type="button"
                onClick={addAchievement}
                disabled={!newAchievement.trim()}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>

        {/* Info block */}
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-xs font-semibold text-amber-800">
            IA validara tus logros
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Nuestro sistema verificara automaticamente la consistencia de tus
            logros con tu experiencia
          </p>
        </div>

        {/* Completion indicator */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-slate-600">
              Completitud del Perfil
            </p>
            <p className="text-xs font-semibold text-slate-900">
              {completionPercent}%
            </p>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          Atras
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={isLoading}
          className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Guardando..." : "Finalizar y comenzar"}
        </button>
      </div>
    </div>
  );
}