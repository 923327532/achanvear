// features/freelance/components/ProjectCreatePage.tsx
"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { freelanceApi } from "../api/freelanceApi";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";
import { ProjectAiAssistant } from "./ProjectAiAssistant";
import type { ProjectAiSuggestion } from "../api/freelanceApi";
import { PROJECT_CATEGORIES } from "../types/freelance.types";
import {
  Rocket,
  Loader2,
  ArrowLeft,
  Check,
  X,
  Plus,
  Upload,
  FileText,
  Trash2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Briefcase,
  DollarSign,
  Clock,
  Send,
  Eye,
  Tag,
  Users,
  Monitor,
  Globe,
  Building2,
  UserCheck,
  GraduationCap,
  Star,
  Languages,
  Wallet,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────────

const EXPERIENCE_LEVELS = [
  { value: "JUNIOR", label: "Junior", icon: GraduationCap, desc: "0-2 años de experiencia" },
  { value: "MID", label: "Mid-Level", icon: UserCheck, desc: "3-5 años de experiencia" },
  { value: "SENIOR", label: "Senior", icon: Star, desc: "6+ años de experiencia" },
] as const;

const BUDGET_TYPES = [
  { value: "FIXED", label: "Precio Fijo", desc: "Pago único por el proyecto completo" },
  { value: "HOURLY", label: "Por Hora", desc: "Pago basado en horas trabajadas" },
] as const;

const MODALITIES = [
  { value: "REMOTE", label: "Remoto", icon: Globe },
  { value: "HYBRID", label: "Híbrido", icon: Monitor },
  { value: "ONSITE", label: "Presencial", icon: Building2 },
] as const;

const PROVIDER_TYPES = [
  { value: "INDIVIDUAL", label: "Freelancer Individual", icon: Users, desc: "Una sola persona" },
  { value: "AGENCY", label: "Agencia o Equipo", icon: Building2, desc: "Empresa o grupo de trabajo" },
] as const;

const CURRENCIES = [
  { value: "PEN", label: "S/. (PEN)", symbol: "S/." },
  { value: "USD", label: "$ (USD)", symbol: "$" },
] as const;

const LANGUAGES = [
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
  { value: "pt", label: "Portugués" },
  { value: "fr", label: "Francés" },
] as const;

const STEPS = [
  { id: 1, label: "Detalles del Proyecto", icon: Briefcase },
  { id: 2, label: "Presupuesto y Duración", icon: DollarSign },
  { id: 3, label: "Publicar", icon: Send },
];

// ─── Fallback de especialidades por categoría ──────────────────────────────────

const SPECIALTIES_MAP: Record<string, string[]> = {
  "Desarrollo Web": [
    "Frontend",
    "Backend",
    "Full Stack",
    "CMS (WordPress, Shopify)",
    "E-commerce",
    "APIs y Microservicios",
  ],
  "App Móvil": [
    "iOS (Swift)",
    "Android (Kotlin/Java)",
    "React Native",
    "Flutter",
    "Cross-Platform",
  ],
  "Diseño": [
    "UI/UX Design",
    "Diseño Gráfico",
    "Diseño de Logos",
    "Ilustración",
    "Motion Graphics",
    "Diseño 3D",
  ],
  "Marketing": [
    "SEO",
    "SEM / Google Ads",
    "Redes Sociales",
    "Email Marketing",
    "Content Marketing",
    "Analítica Web",
  ],
  "Consultoría": [
    "Consultoría TI",
    "Consultoría de Negocios",
    "Transformación Digital",
    "Ciberseguridad",
    "Cloud Computing",
  ],
  "Legal": [
    "Derecho Corporativo",
    "Derecho Laboral",
    "Propiedad Intelectual",
    "Contratos",
    "Derecho Tributario",
  ],
  "Contabilidad": [
    "Contabilidad General",
    "Tributación",
    "Auditoría",
    "Nóminas",
    "Finanzas Corporativas",
  ],
  "Otros": [
    "Traducción",
    "Redacción",
    "Soporte Técnico",
    "Data Entry",
    "Asistente Virtual",
  ],
};

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  title: string;
  category: string;
  subcategory: string;
  description: string;
  skills: string[];
  experienceLevel: string;
  budgetType: string;
  budget: string;
  minBudget: string;
  maxBudget: string;
  hourlyRateMin: string;
  hourlyRateMax: string;
  currency: string;
  language: string;
  estimatedDays: string;
  modality: string;
  providerType: string;
  attachments: File[];
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ProjectCreatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Wizard step ───────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // ─── Form data ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState<FormData>({
    title: "",
    category: "",
    subcategory: "",
    description: "",
    skills: [],
    experienceLevel: "",
    budgetType: "FIXED",
    budget: "",
    minBudget: "",
    maxBudget: "",
    hourlyRateMin: "",
    hourlyRateMax: "",
    currency: "PEN",
    language: "es",
    estimatedDays: "",
    modality: "",
    providerType: "",
    attachments: [],
  });

  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Queries ───────────────────────────────────────────────────────────────
  const industriesQuery = useQuery({
    queryKey: ["catalog-industries"],
    queryFn: () => onboardingService.getCatalogIndustries(),
    retry: false,
  });

  const specialtiesQuery = useQuery({
    queryKey: ["catalog-specialties", form.category],
    queryFn: () => onboardingService.getCatalogSpecialties(form.category),
    enabled: !!form.category,
    retry: false,
  });

  // ─── Create mutation ───────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: () => {
      const payload: Parameters<typeof freelanceApi.create>[0] = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        subcategory: form.subcategory || undefined,
        estimatedDays: parseInt(form.estimatedDays, 10),
        experienceLevel: form.experienceLevel || undefined,
        skills: form.skills.length > 0 ? form.skills : undefined,
        budgetType: form.budgetType || undefined,
        modality: form.modality || undefined,
        providerType: form.providerType || undefined,
        attachments: form.attachments.length > 0
          ? form.attachments.map((f) => f.name)
          : undefined,
        currency: form.currency || undefined,
        language: form.language || undefined,
      };

      if (form.budgetType === "FIXED") {
        payload.budget = parseFloat(form.budget);
        payload.minBudget = form.minBudget ? parseFloat(form.minBudget) : undefined;
        payload.maxBudget = form.maxBudget ? parseFloat(form.maxBudget) : undefined;
      } else {
        payload.budget = form.budget ? parseFloat(form.budget) : undefined;
        payload.hourlyRateMin = form.hourlyRateMin ? parseFloat(form.hourlyRateMin) : undefined;
        payload.hourlyRateMax = form.hourlyRateMax ? parseFloat(form.hourlyRateMax) : undefined;
      }

      return freelanceApi.create(payload);
    },
    onSuccess: () => {
      router.push(`/company/projects`);
    },
    onError: (err: Error) => {
      setErrors({ submit: err.message || "Error al crear el proyecto" });
    },
  });

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      updateField("skills", [...form.skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    updateField("skills", form.skills.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    updateField("attachments", [...form.attachments, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    updateField("attachments", form.attachments.filter((_, i) => i !== index));
  };

  // ─── Validation per step ───────────────────────────────────────────────────

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim() || form.title.trim().length < 5) {
      errs.title = "El título debe tener al menos 5 caracteres";
    }
    if (!form.category) {
      errs.category = "Selecciona una categoría";
    }
    if (!form.description.trim() || form.description.trim().length < 20) {
      errs.description = "La descripción debe tener al menos 20 caracteres";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};

    if (form.budgetType === "FIXED") {
      if (!form.budget || parseFloat(form.budget) <= 0) {
        errs.budget = "Ingresa un presupuesto válido";
      }
    } else {
      if (!form.hourlyRateMin || parseFloat(form.hourlyRateMin) <= 0) {
        errs.hourlyRateMin = "Ingresa una tarifa mínima válida";
      }
      if (!form.hourlyRateMax || parseFloat(form.hourlyRateMax) <= 0) {
        errs.hourlyRateMax = "Ingresa una tarifa máxima válida";
      }
      if (form.hourlyRateMin && form.hourlyRateMax &&
          parseFloat(form.hourlyRateMin) > parseFloat(form.hourlyRateMax)) {
        errs.hourlyRateMin = "La tarifa mínima no puede ser mayor a la máxima";
      }
    }

    if (!form.estimatedDays || parseInt(form.estimatedDays, 10) <= 0) {
      errs.estimatedDays = "Ingresa una duración válida";
    }
    if (!form.modality) {
      errs.modality = "Selecciona una modalidad de trabajo";
    }
    if (!form.providerType) {
      errs.providerType = "Selecciona el tipo de proveedor";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    createMutation.mutate();
  };

  // ─── AI Suggestion handler ────────────────────────────────────────────────
  const handleAiSuggestion = (suggestion: ProjectAiSuggestion) => {
    const newForm: FormData = {
      title: suggestion.title || form.title,
      category: suggestion.category || form.category,
      subcategory: suggestion.subcategory || form.subcategory,
      description: suggestion.description || form.description,
      skills: suggestion.skills ? suggestion.skills.split(",").map(s => s.trim()).filter(Boolean) : form.skills,
      experienceLevel: suggestion.experienceLevel || form.experienceLevel,
      budgetType: suggestion.budgetType || form.budgetType,
      budget: suggestion.budget != null ? String(suggestion.budget) : form.budget,
      minBudget: suggestion.minBudget != null ? String(suggestion.minBudget) : form.minBudget,
      maxBudget: suggestion.maxBudget != null ? String(suggestion.maxBudget) : form.maxBudget,
      hourlyRateMin: suggestion.hourlyRateMin != null ? String(suggestion.hourlyRateMin) : form.hourlyRateMin,
      hourlyRateMax: suggestion.hourlyRateMax != null ? String(suggestion.hourlyRateMax) : form.hourlyRateMax,
      currency: suggestion.currency || form.currency,
      language: suggestion.language || form.language,
      estimatedDays: suggestion.estimatedDays != null ? String(suggestion.estimatedDays) : form.estimatedDays,
      modality: suggestion.modality || form.modality,
      providerType: suggestion.providerType || form.providerType,
      attachments: form.attachments,
    };
    setForm(newForm);
  };

  const currencySymbol = CURRENCIES.find((c) => c.value === form.currency)?.symbol || "S/.";

  // ─── Render helpers ────────────────────────────────────────────────────────

  const renderStepIndicator = () => (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, idx) => (
        <div key={s.id} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (s.id < step) setStep(s.id);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              step === s.id
                ? "bg-[#1e3a8a] text-white shadow-md"
                : step > s.id
                ? "bg-emerald-100 text-emerald-700 cursor-pointer"
                : "bg-slate-100 text-slate-400 cursor-default"
            }`}
          >
            {step > s.id ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                {s.id}
              </span>
            )}
            <span className="hidden sm:inline">{s.label}</span>
          </button>
          {idx < STEPS.length - 1 && (
            <div
              className={`w-8 h-0.5 ${
                step > s.id ? "bg-emerald-400" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderError = (field: string) => {
    if (!errors[field]) return null;
    return <p className="text-xs text-red-500 mt-1">{errors[field]}</p>;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1: Detalles del Proyecto
  // ═══════════════════════════════════════════════════════════════════════════
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Título */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Título del Proyecto <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Ej: Desarrollo de plataforma e-learning"
          className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm outline-none transition ${
            errors.title
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-slate-200 focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
          }`}
        />
        {renderError("title")}
      </div>

      {/* Categoría y Subcategoría */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <h3 className="text-sm font-bold text-slate-900">Categoría y Especialidad</h3>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            value={form.category}
            onChange={(e) => {
              updateField("category", e.target.value);
              updateField("subcategory", "");
            }}
            className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm outline-none transition ${
              errors.category
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
            }`}
          >
            <option value="">Seleccionar categoría...</option>
            {(industriesQuery.data && industriesQuery.data.length > 0
              ? industriesQuery.data
              : PROJECT_CATEGORIES
            ).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {renderError("category")}
        </div>

        {form.category && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Especialidad
            </label>
            <select
              value={form.subcategory}
              onChange={(e) => updateField("subcategory", e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="">Seleccionar especialidad...</option>
              {(specialtiesQuery.data && specialtiesQuery.data.length > 0
                ? specialtiesQuery.data
                : SPECIALTIES_MAP[form.category] ?? []
              ).map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Descripción */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Descripción del Proyecto <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={6}
          placeholder="Describe en detalle lo que necesitas: objetivos, alcance, tecnologías, entregables esperados..."
          className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm outline-none transition resize-y ${
            errors.description
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-slate-200 focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
          }`}
        />
        <p className="text-xs text-slate-400 mt-1">
          {form.description.length} caracteres (mín. 20)
        </p>
        {renderError("description")}
      </div>

      {/* Skills */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Habilidades Requeridas
        </label>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            placeholder="Ej: React, Node.js, Python..."
            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
          />
          <button
            type="button"
            onClick={addSkill}
            disabled={!skillInput.trim()}
            className="px-4 py-2 bg-[#1e3a8a] text-white rounded-xl text-sm font-semibold hover:bg-[#1e3a8a]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>
        {form.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium"
              >
                <Tag className="w-3 h-3" />
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:text-red-500 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Experiencia */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Nivel de Experiencia Requerido
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {EXPERIENCE_LEVELS.map((level) => {
            const Icon = level.icon;
            const isSelected = form.experienceLevel === level.value;
            return (
              <button
                key={level.value}
                type="button"
                onClick={() => updateField("experienceLevel", level.value)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-[#1e3a8a] bg-blue-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? "text-[#1e3a8a]" : "text-slate-400"}`} />
                  <span className={`text-sm font-semibold ${isSelected ? "text-[#1e3a8a]" : "text-slate-700"}`}>
                    {level.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{level.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2: Presupuesto y Duración
  // ═══════════════════════════════════════════════════════════════════════════
  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Tipo de Presupuesto */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Tipo de Presupuesto
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BUDGET_TYPES.map((bt) => {
            const isSelected = form.budgetType === bt.value;
            return (
              <button
                key={bt.value}
                type="button"
                onClick={() => updateField("budgetType", bt.value)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className={`w-4 h-4 ${isSelected ? "text-emerald-600" : "text-slate-400"}`} />
                  <span className={`text-sm font-semibold ${isSelected ? "text-emerald-700" : "text-slate-700"}`}>
                    {bt.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{bt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Moneda e Idioma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            <Wallet className="w-4 h-4 inline -ml-0.5 text-blue-600" />
            {' '}Moneda
          </label>
          <div className="grid grid-cols-2 gap-3">
            {CURRENCIES.map((cur) => {
              const isSelected = form.currency === cur.value;
              return (
                <button
                  key={cur.value}
                  type="button"
                  onClick={() => updateField("currency", cur.value)}
                  className={`text-center p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-[#1e3a8a] bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className={`text-sm font-semibold ${isSelected ? "text-[#1e3a8a]" : "text-slate-700"}`}>
                    {cur.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            <Languages className="w-4 h-4 inline -ml-0.5 text-blue-600" />
            {' '}Idioma
          </label>
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((lang) => {
              const isSelected = form.language === lang.value;
              return (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => updateField("language", lang.value)}
                  className={`text-center p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-[#1e3a8a] bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className={`text-sm font-semibold ${isSelected ? "text-[#1e3a8a]" : "text-slate-700"}`}>
                    {lang.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Presupuesto Dinámico según tipo */}
      {form.budgetType === "FIXED" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Presupuesto - Precio Fijo</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Presupuesto Total ({currencySymbol}) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">{currencySymbol}</span>
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => updateField("budget", e.target.value)}
                  placeholder="5000"
                  min="1"
                  className={`w-full pl-10 pr-3 py-3 bg-white border rounded-xl text-sm outline-none transition ${
                    errors.budget
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-slate-200 focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
                  }`}
                />
              </div>
              {renderError("budget")}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Presupuesto Mín. ({currencySymbol})</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">{currencySymbol}</span>
                  <input
                    type="number"
                    value={form.minBudget}
                    onChange={(e) => updateField("minBudget", e.target.value)}
                    placeholder="3000"
                    min="1"
                    className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Presupuesto Máx. ({currencySymbol})</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">{currencySymbol}</span>
                  <input
                    type="number"
                    value={form.maxBudget}
                    onChange={(e) => updateField("maxBudget", e.target.value)}
                    placeholder="7000"
                    min="1"
                    className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Tarifa por Hora</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Tarifa Mín. ({currencySymbol}/hora) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">{currencySymbol}</span>
                  <input
                    type="number"
                    value={form.hourlyRateMin}
                    onChange={(e) => updateField("hourlyRateMin", e.target.value)}
                    placeholder="15"
                    min="1"
                    className={`w-full pl-10 pr-3 py-3 bg-white border rounded-xl text-sm outline-none transition ${
                      errors.hourlyRateMin
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
                    }`}
                  />
                </div>
                {renderError("hourlyRateMin")}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Tarifa Máx. ({currencySymbol}/hora) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">{currencySymbol}</span>
                  <input
                    type="number"
                    value={form.hourlyRateMax}
                    onChange={(e) => updateField("hourlyRateMax", e.target.value)}
                    placeholder="25"
                    min="1"
                    className={`w-full pl-10 pr-3 py-3 bg-white border rounded-xl text-sm outline-none transition ${
                      errors.hourlyRateMax
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
                    }`}
                  />
                </div>
                {renderError("hourlyRateMax")}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Presupuesto Estimado Total ({currencySymbol})</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">{currencySymbol}</span>
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => updateField("budget", e.target.value)}
                  placeholder="5000"
                  min="1"
                  className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duración */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          <Clock className="w-3.5 h-3.5 inline -ml-0.5 text-blue-600" />
          {' '}Duración Estimada (días) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={form.estimatedDays}
          onChange={(e) => updateField("estimatedDays", e.target.value)}
          placeholder="30"
          min="1"
          className={`w-full max-w-xs px-4 py-3 bg-white border rounded-xl text-sm outline-none transition ${
            errors.estimatedDays
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-slate-200 focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
          }`}
        />
        {renderError("estimatedDays")}
      </div>

      {/* Modalidad */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Modalidad de Trabajo <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODALITIES.map((mod) => {
            const Icon = mod.icon;
            const isSelected = form.modality === mod.value;
            return (
              <button
                key={mod.value}
                type="button"
                onClick={() => updateField("modality", mod.value)}
                className={`text-center p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-[#1e3a8a] bg-blue-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-1 ${isSelected ? "text-[#1e3a8a]" : "text-slate-400"}`} />
                <span className={`text-sm font-semibold ${isSelected ? "text-[#1e3a8a]" : "text-slate-700"}`}>
                  {mod.label}
                </span>
              </button>
            );
          })}
        </div>
        {renderError("modality")}
      </div>

      {/* Tipo de Proveedor */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Tipo de Proveedor <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PROVIDER_TYPES.map((pt) => {
            const Icon = pt.icon;
            const isSelected = form.providerType === pt.value;
            return (
              <button
                key={pt.value}
                type="button"
                onClick={() => updateField("providerType", pt.value)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-purple-600 bg-purple-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? "text-purple-600" : "text-slate-400"}`} />
                  <span className={`text-sm font-semibold ${isSelected ? "text-purple-700" : "text-slate-700"}`}>
                    {pt.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{pt.desc}</p>
              </button>
            );
          })}
        </div>
        {renderError("providerType")}
      </div>

      {/* Archivos Adjuntos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Archivos Adjuntos
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#1e3a8a] hover:bg-blue-50/30 transition"
        >
          <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-600">
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-slate-400 mt-1">
            PDF, DOC, imágenes (máx. 10MB cada uno)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
          />
        </div>

        {form.attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            {form.attachments.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700 truncate">{file.name}</span>
                  <span className="text-xs text-slate-400 shrink-0">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="p-1 hover:bg-red-100 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3: Publicar (Resumen)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderStep3 = () => {
    const experienceLabel = EXPERIENCE_LEVELS.find((l) => l.value === form.experienceLevel)?.label || "No especificado";
    const budgetTypeLabel = BUDGET_TYPES.find((b) => b.value === form.budgetType)?.label || "No especificado";
    const modalityLabel = MODALITIES.find((m) => m.value === form.modality)?.label || "No especificado";
    const providerLabel = PROVIDER_TYPES.find((p) => p.value === form.providerType)?.label || "No especificado";

    return (
      <div className="space-y-6">
        {/* Resumen del Proyecto */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Eye className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Revisa los detalles antes de publicar
            </span>
          </div>

          <div className="space-y-5">
            {/* Título */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Título</p>
              <p className="text-lg font-bold text-[#1e3a8a]">{form.title}</p>
            </div>

            {/* Categoría */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Categoría</p>
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                  {form.category}
                </span>
              </div>
              {form.subcategory && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Especialidad</p>
                  <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                    {form.subcategory}
                  </span>
                </div>
              )}
            </div>

            {/* Descripción */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Descripción</p>
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">{form.description}</p>
            </div>

            {/* Skills */}
            {form.skills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Habilidades</p>
                <div className="flex flex-wrap gap-1.5">
                  {form.skills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <hr className="border-slate-100" />

            {/* Presupuesto y Duración */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Presupuesto</p>
                <p className="text-xl font-bold text-emerald-600">
                  {currencySymbol} {parseFloat(form.budget).toLocaleString("es-PE")}
                </p>
                <p className="text-xs text-slate-400">{budgetTypeLabel}</p>
                {form.budgetType === "FIXED" && form.minBudget && form.maxBudget && (
                  <p className="text-xs text-slate-500 mt-1">
                    Rango: {currencySymbol} {parseFloat(form.minBudget).toLocaleString("es-PE")} - {currencySymbol} {parseFloat(form.maxBudget).toLocaleString("es-PE")}
                  </p>
                )}
                {form.budgetType === "HOURLY" && form.hourlyRateMin && form.hourlyRateMax && (
                  <p className="text-xs text-slate-500 mt-1">
                    Tarifa: {currencySymbol} {parseFloat(form.hourlyRateMin).toLocaleString("es-PE")}/h - {currencySymbol} {parseFloat(form.hourlyRateMax).toLocaleString("es-PE")}/h
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Duración</p>
                <p className="text-xl font-bold text-[#1e3a8a]">{form.estimatedDays} días</p>
              </div>
            </div>

            {/* Moneda e Idioma */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Moneda</p>
                <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                  {CURRENCIES.find((c) => c.value === form.currency)?.label || form.currency}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Idioma</p>
                <span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
                  {LANGUAGES.find((l) => l.value === form.language)?.label || form.language}
                </span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Modalidad, Proveedor, Experiencia */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Modalidad</p>
                <span className="inline-block px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-medium">
                  {modalityLabel}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Proveedor</p>
                <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                  {providerLabel}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Experiencia</p>
                <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
                  {experienceLabel}
                </span>
              </div>
            </div>

            {/* Archivos */}
            {form.attachments.length > 0 && (
              <>
                <hr className="border-slate-100" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Archivos Adjuntos ({form.attachments.length})
                  </p>
                  <div className="space-y-1.5">
                    {form.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error de submit */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        {/* Botón de publicar */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="px-10 py-3.5 bg-[#1e3a8a] text-white rounded-xl font-bold text-base hover:bg-[#1e3a8a]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-900/20"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Publicar Proyecto
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => router.push("/company")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition mb-2 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
        <span className="text-sm font-medium">Volver al dashboard</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[#0a1628]">
          Publicar Nuevo Proyecto
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Completa los detalles de tu proyecto freelance en 3 pasos
        </p>
      </div>

      {/* Step indicator */}
      {renderStepIndicator()}

      {/* Step content */}
      <div className="min-h-[400px]">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-8 py-2.5 bg-[#1e3a8a] text-white rounded-xl font-semibold hover:bg-[#1e3a8a]/90 transition flex items-center gap-2 shadow-md"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* AI Project Assistant flotante */}
      <ProjectAiAssistant onApplySuggestion={handleAiSuggestion} />
    </div>
  );
}