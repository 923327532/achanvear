"use client";

import { useState } from "react";

interface StepCreateProfileProps {
  onContinue: (curriculumFile: File | null) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

type ProfileOption = "cv" | "assistant" | null;

export function StepCreateProfile({
  onContinue,
  onBack,
  isLoading,
  error,
}: StepCreateProfileProps) {
  const [selectedOption, setSelectedOption] = useState<ProfileOption>(null);
  const [curriculumFile, setCurriculumFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
      setCurriculumFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
      setCurriculumFile(file);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          Crea tu Perfil Profesional
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Elige como quieres construir tu perfil
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => {
            setSelectedOption("cv");
            setCurriculumFile(null);
          }}
          className={`w-full rounded-xl border p-4 text-left transition ${
            selectedOption === "cv"
              ? "border-slate-900 bg-slate-900/5"
              : "border-slate-200 bg-white hover:border-slate-400"
          }`}
        >
          <p className="text-sm font-semibold text-slate-900">
            Subir mi CV (PDF)
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Ya tengo mi CV listo. La IA lo analizara y completara mi perfil
            automaticamente.
          </p>
          <p className="mt-1 text-xs font-medium text-slate-700">
            Procesamiento con IA
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedOption("assistant");
            setCurriculumFile(null);
          }}
          className={`w-full rounded-xl border p-4 text-left transition ${
            selectedOption === "assistant"
              ? "border-slate-900 bg-slate-900/5"
              : "border-slate-200 bg-white hover:border-slate-400"
          }`}
        >
          <p className="text-sm font-semibold text-slate-900">
            Crear con Asistente IA
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Te hare preguntas y creare un perfil profesional optimizado desde
            cero.
          </p>
          <p className="mt-1 text-xs font-medium text-slate-700">
            Guiado paso a paso
          </p>
        </button>
      </div>

      {selectedOption === "cv" && (
        <div
          className={`mt-4 rounded-xl border-2 border-dashed p-8 text-center transition ${
            dragOver
              ? "border-slate-900 bg-slate-900/5"
              : "border-slate-300 bg-white"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
        >
          {curriculumFile ? (
            <div>
              <p className="text-sm font-medium text-slate-900">
                {curriculumFile.name}
              </p>
              <p className="text-xs text-slate-500">
                {(curriculumFile.size / 1024).toFixed(1)} KB
              </p>
              <button
                type="button"
                onClick={() => setCurriculumFile(null)}
                className="mt-2 text-xs font-medium text-rose-500 hover:text-rose-600"
              >
                Quitar archivo
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-700">
                Click para subir tu CV
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Solo archivos PDF (max. 5MB)
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="cv-upload"
              />
              <label
                htmlFor="cv-upload"
                className="mt-3 inline-block cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Seleccionar archivo
              </label>
            </div>
          )}
        </div>
      )}

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
          onClick={() => onContinue(curriculumFile)}
          disabled={!selectedOption || isLoading}
          className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creando perfil..." : "Continuar"}
        </button>
      </div>
    </div>
  );
}