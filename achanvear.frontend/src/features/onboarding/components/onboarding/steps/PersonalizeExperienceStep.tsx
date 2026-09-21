"use client";

import { useState, useEffect } from "react";
import {
  Code2, Scale, Calculator, TrendingUp,
  FileText, HardHat, Stethoscope, Palette, Users,
} from "lucide-react";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";

const INDUSTRY_ICONS: Record<string, React.ElementType> = {
  Tecnología:     Code2,
  Tecnologia:     Code2,
  Derecho:        Scale,
  Contabilidad:   Calculator,
  Marketing:      TrendingUp,
  Administración: FileText,
  Administracion: FileText,
  Ingeniería:     HardHat,
  Ingenieria:     HardHat,
  Salud:          Stethoscope,
  Diseño:         Palette,
  Diseno:         Palette,
  Otros:          Users,
};

const FALLBACK_INDUSTRIES = [
  "Tecnología", "Derecho", "Contabilidad",
  "Marketing", "Administración", "Ingeniería",
  "Salud", "Diseño", "Otros",
];

const FALLBACK_SPECIALTIES: Record<string, string[]> = {
  "Tecnología":     ["Backend", "Frontend", "DevOps", "Mobile", "QA", "Data Science", "Ciberseguridad", "Full Stack"],
  "Derecho":        ["Corporativo", "Laboral", "Penal", "Civil", "Tributario", "Ambiental"],
  "Contabilidad":   ["Auditoría", "Finanzas", "Tributación", "Costos", "Contabilidad General"],
  "Marketing":      ["Digital", "Contenidos", "SEO/SEM", "Brand", "Performance", "CRM"],
  "Administración": ["RRHH", "Operaciones", "Logística", "Gestión de Proyectos", "Estrategia"],
  "Ingeniería":     ["Civil", "Industrial", "Sistemas", "Mecánica", "Eléctrica", "Ambiental"],
  "Salud":          ["Medicina", "Enfermería", "Nutrición", "Psicología", "Farmacia"],
  "Diseño":         ["UX/UI", "Gráfico", "Motion", "Producto", "Branding"],
  "Otros":          ["Consultoría", "Educación", "Comercio", "Arte", "Ciencias"],
};

interface PersonalizeExperienceStepProps {
  data: any;
  onUpdate: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PersonalizeExperienceStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: PersonalizeExperienceStepProps) {
  const [industries, setIndustries] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);

  // Cargar industrias al montar
  useEffect(() => {
    onboardingService
      .getIndustries()
      .then((result) => setIndustries(result.length > 0 ? result : FALLBACK_INDUSTRIES))
      .catch(() => setIndustries(FALLBACK_INDUSTRIES))
      .finally(() => setLoadingIndustries(false));
  }, []);

  // Cargar especialidades cuando cambia la industria
  useEffect(() => {
    if (!data.industry) {
      setSpecialties([]);
      return;
    }
    setLoadingSpecialties(true);
    onboardingService
      .getSpecialtiesByIndustry(data.industry)
      .then((result) => setSpecialties(result.length > 0 ? result : (FALLBACK_SPECIALTIES[data.industry] ?? [])))
      .catch(() => setSpecialties(FALLBACK_SPECIALTIES[data.industry] ?? []))
      .finally(() => setLoadingSpecialties(false));
  }, [data.industry]);

  const handleIndustrySelect = (industry: string) => {
    // Al cambiar industria, resetear especialidad
    onUpdate({ industry, speciality: "" });
  };

  return (
    <div className="w-full max-w-[620px] mx-auto rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-[#1B3A6B]">
          Personaliza tu experiencia
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Cuéntanos sobre tu industria para mostrarte contenido relevante
        </p>
      </div>

      {/* Industrias */}
      <p className="mb-3 text-sm font-semibold text-slate-800">
        ¿A qué industria perteneces?
      </p>

      {loadingIndustries ? (
        <div className="flex justify-center py-12">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#1B3A6B] border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {industries.map((industry) => {
            const Icon = INDUSTRY_ICONS[industry] ?? Users;
            const isSelected = data.industry === industry;
            return (
              <button
                key={industry}
                type="button"
                onClick={() => handleIndustrySelect(industry)}
                className={`flex flex-col items-center justify-center gap-2.5 rounded-xl border py-5 px-3 transition-all ${
                  isSelected
                    ? "border-[#1B3A6B] bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`h-7 w-7 ${isSelected ? "text-[#1B3A6B]" : "text-slate-400"}`}
                  strokeWidth={1.5}
                />
                <span className={`text-xs font-medium ${isSelected ? "text-[#1B3A6B]" : "text-slate-600"}`}>
                  {industry}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Especialidades — aparecen al seleccionar industria */}
      {data.industry && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="mb-3 text-sm font-semibold text-slate-800">
            ¿Cuál es tu especialidad?
          </p>

          {loadingSpecialties ? (
            <div className="flex justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1B3A6B] border-t-transparent" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {specialties.map((speciality) => {
                const isSelected = data.speciality === speciality;
                return (
                  <button
                    key={speciality}
                    type="button"
                    onClick={() => onUpdate({ speciality })}
                    className={`rounded-lg border px-3 py-2.5 text-left text-xs transition-all ${
                      isSelected
                        ? "border-[#1B3A6B] bg-blue-50 text-[#1B3A6B] font-semibold"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {speciality}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Botones */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!data.industry || !data.speciality || loadingIndustries || loadingSpecialties}
          className="rounded-xl bg-[#4A5568] py-3 text-sm font-semibold text-white transition hover:bg-[#2D3748] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}