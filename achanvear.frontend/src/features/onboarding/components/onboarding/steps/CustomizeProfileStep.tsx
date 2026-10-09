"use client";

import { useState } from "react";

interface CustomizeProfileStepProps {
  data: {
    biography: string;
    portfolioLinks: string[];
    achievements: string[];
  };
  onUpdate: (updates: Partial<CustomizeProfileStepProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

const MIN_BIO_LENGTH = 100;

export function CustomizeProfileStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: CustomizeProfileStepProps) {
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("");
  const [newAchievement, setNewAchievement] = useState("");

  const bioLength = data.biography.trim().length;
  const bioError = bioLength > 0 && bioLength < MIN_BIO_LENGTH;
  const canContinue = bioLength >= MIN_BIO_LENGTH;

  const addPortfolioLink = () => {
    const url = newPortfolioUrl.trim();
    if (!url) return;
    onUpdate({ portfolioLinks: [...data.portfolioLinks, url] });
    setNewPortfolioUrl("");
  };

  const removePortfolioLink = (index: number) => {
    onUpdate({
      portfolioLinks: data.portfolioLinks.filter((_, linkIndex) => linkIndex !== index),
    });
  };

  const addAchievement = () => {
    const achievement = newAchievement.trim();
    if (!achievement) return;
    onUpdate({ achievements: [...data.achievements, achievement] });
    setNewAchievement("");
  };

  const removeAchievement = (index: number) => {
    onUpdate({
      achievements: data.achievements.filter(
        (_, achievementIndex) => achievementIndex !== index,
      ),
    });
  };

  const completedFields =
    (canContinue ? 1 : 0) +
    (data.portfolioLinks.length > 0 ? 1 : 0) +
    (data.achievements.length > 0 ? 1 : 0);
  const completionPercent = Math.round((completedFields / 3) * 100);

  return (
    <div className="w-full max-w-[620px] mx-auto rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-[#1B3A6B]">
          Personaliza tu perfil
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Agrega los detalles que te haran destacar ante empresas
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            Biografia profesional
          </label>
          <textarea
            value={data.biography}
            onChange={(event) => onUpdate({ biography: event.target.value })}
            maxLength={500}
            rows={4}
            className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition ${
              bioError
                ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-slate-300 focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]"
            }`}
            placeholder="Cuentanos sobre tu experiencia profesional..."
          />
          <div className="mt-1 flex items-center justify-between">
            {bioError ? (
              <p className="text-xs text-red-500">
                Minimo {MIN_BIO_LENGTH} caracteres
              </p>
            ) : (
              <span />
            )}
            <p className={`text-xs ${bioError ? "text-red-400" : "text-slate-400"}`}>
              {data.biography.length}/500 caracteres
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">
            Links de portafolio
          </p>
          <div className="space-y-2">
            {data.portfolioLinks.map((link, index) => (
              <div
                key={`${link}-${index}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <span className="flex-1 truncate text-xs text-slate-600">
                  {link}
                </span>
                <button
                  type="button"
                  onClick={() => removePortfolioLink(index)}
                  className="ml-2 text-xs font-medium text-rose-500 hover:text-rose-600"
                >
                  Quitar
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newPortfolioUrl}
                onChange={(event) => setNewPortfolioUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addPortfolioLink();
                  }
                }}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]"
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

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">
            Logros destacados
          </p>
          <div className="space-y-2">
            {data.achievements.map((achievement, index) => (
              <div
                key={`${achievement}-${index}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <span className="flex-1 text-xs text-slate-600">
                  {achievement}
                </span>
                <button
                  type="button"
                  onClick={() => removeAchievement(index)}
                  className="ml-2 text-xs font-medium text-rose-500 hover:text-rose-600"
                >
                  Quitar
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newAchievement}
                onChange={(event) => setNewAchievement(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addAchievement();
                  }
                }}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]"
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

        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600">
              Completitud del perfil
            </p>
            <p className="text-xs font-semibold text-slate-900">
              {completionPercent}%
            </p>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#0EA5A0] transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Atras
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className="rounded-xl bg-[#4A5568] py-3 text-sm font-semibold text-white transition hover:bg-[#2D3748] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
