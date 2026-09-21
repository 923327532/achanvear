"use client";

import { useState } from "react";
import { ApiError } from "@/lib/errors";
import { Alert } from "@/components/ui/Alert";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";                      // ← actualizado
import type { CompanyOnboardingData } from "@/features/onboarding/types/onboarding.types";        // ← actualizado

interface CorporateProfileStepProps {
  data: CompanyOnboardingData;
  onUpdate: (updates: Partial<CompanyOnboardingData>) => void;
  onNext: (fromStep?: number) => void;
  onBack: () => void;
}

const COMPANY_SIZES = [
  { value: "MICROENTERPRISE", label: "Microempresa (1-10)" },
  { value: "SMALL_BUSINESS", label: "Pequena (11-50)" },
  { value: "MEDIUM_BUSINESS", label: "Mediana (51-200)" },
  { value: "LARGE_ENTERPRISE", label: "Grande (200+)" },
];

export function CorporateProfileStep({ data, onUpdate, onNext, onBack }: CorporateProfileStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size <= 2 * 1024 * 1024 && (file.type === "image/png" || file.type === "image/jpeg")) {
        onUpdate({ logoFile: file });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size <= 2 * 1024 * 1024 && (file.type === "image/png" || file.type === "image/jpeg")) {
        onUpdate({ logoFile: file });
      }
    }
  };

  const handleSubmit = () => {
    if (!data.companySize) {
      setError("Debes seleccionar el tamano de tu empresa");
      return;
    }
    if (!data.description.trim()) {
      setError("Debes proporcionar una descripcion");
      return;
    }
    if (data.description.trim().length < 100) {
      setError("La descripcion debe tener al menos 100 caracteres");
      return;
    }
    onNext();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Perfil Corporativo</h1>
        <p className="text-slate-600">Completa la informacion de tu empresa</p>
      </div>

      {error && <Alert message={error} />}

      <div className="space-y-6">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Logo de la Empresa</label>
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragActive ? "border-teal-600 bg-teal-50" : "border-slate-300 hover:border-slate-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {data.logoFile ? (
              <div className="text-teal-600">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">{data.logoFile.name}</p>
              </div>
            ) : (
              <div>
                <svg className="w-12 h-12 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-slate-600 mb-1">Click para subir logo</p>
                <p className="text-sm text-slate-500">PNG o JPG, maximo 2MB</p>
              </div>
            )}
            <input type="file" accept=".png,.jpg,.jpeg" onChange={handleFileChange} className="hidden" id="logo-upload" />
            <label htmlFor="logo-upload" className="inline-block mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg cursor-pointer hover:bg-slate-200 transition">
              Seleccionar archivo
            </label>
          </div>
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tamano de la empresa</label>
          <div className="grid grid-cols-2 gap-3">
            {COMPANY_SIZES.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => onUpdate({ companySize: size.value })}
                className={`p-4 rounded-2xl border-2 transition-all text-center ${
                  data.companySize === size.value
                    ? "border-teal-600 bg-teal-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="font-semibold text-slate-900">{size.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Dirección de la empresa</label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => onUpdate({ address: e.target.value })}
            className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${
              !data.address.trim() && error ? "border-red-500" : "border-slate-300 focus:border-teal-600"
            }`}
            placeholder="Dirección fiscal de tu empresa"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Descripcion de la empresa</label>
          <textarea
            value={data.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            maxLength={500}
            rows={4}
            className={`w-full rounded-2xl border px-4 py-3 outline-none transition resize-none ${
              (data.description.trim().length > 0 && data.description.trim().length < 100) || (!data.description.trim() && error) ? "border-red-500" : "border-slate-300 focus:border-teal-600"
            }`}
            placeholder="Describe tu empresa..."
          />
          <div className="flex justify-between items-center mt-1">
            {data.description.trim().length > 0 && data.description.trim().length < 100 && (
              <span className="text-xs text-red-500">Minimo 100 caracteres</span>
            )}
            {!data.description.trim() && (
              <span className="text-xs text-slate-400">Minimo 100 caracteres</span>
            )}
            <span className={`text-sm ml-auto ${data.description.trim().length > 0 && data.description.trim().length < 100 ? "text-red-500" : "text-slate-500"}`}>
              {data.description.length}/500 caracteres
            </span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <p className="text-sm text-blue-800"><strong>Tu perfil sera visible para candidatos</strong></p>
          <p className="text-sm text-blue-700 mt-1">Esta informacion ayudara a los profesionales a conocer mejor tu empresa antes de postular</p>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button type="button" onClick={onBack} className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-2xl hover:bg-slate-50 transition">
          Atras
        </button>
        <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-blue-900 to-teal-600 text-white font-semibold py-3 rounded-2xl hover:from-blue-800 hover:to-teal-500 transition-all disabled:opacity-50">
          {isSubmitting ? "Guardando..." : "Continua"}
        </button>
      </div>
    </div>
  );
}