// features/freelance/components/ProjectEditPage.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { freelanceApi } from "../api/freelanceApi";
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
  { id: 2, label: "Presupuesto y Plazos", icon: DollarSign },
  { id: 3, label: "Requisitos y Preferencias", icon: Users },
  { id: 4, label: "Revisión y Publicar", icon: Eye },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrencySymbol(currency: string) {
  const found = CURRENCIES.find((c) => c.value === currency);
  return found?.symbol ?? "S/.";
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export function ProjectEditPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  // ─── Cargar datos del proyecto ──────────────────────────────────────────────
  const projectQuery = useQuery({
    queryKey: ["company-project", projectId],
    queryFn: () => freelanceApi.getById(projectId),
    retry: false,
    enabled: !!projectId,
  });

  const project = projectQuery.data;

  // ─── Form state ─────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [budget, setBudget] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [budgetType, setBudgetType] = useState("");
  const [modality, setModality] = useState("");
  const [providerType, setProviderType] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [currency, setCurrency] = useState("PEN");
  const [language, setLanguage] = useState("es");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [hourlyRateMin, setHourlyRateMin] = useState("");
  const [hourlyRateMax, setHourlyRateMax] = useState("");

  // ─── Precargar datos cuando se carga el proyecto ────────────────────────────
  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description);
      setCategory(project.category);
      setSubcategory(project.subcategory ?? "");
      setBudget(project.budget?.toString() ?? "");
      setEstimatedDays(project.estimatedDays?.toString() ?? "");
      setExperienceLevel(project.experienceLevel ?? "");
      setSkills(project.skills ?? []);
      setBudgetType(project.budgetType ?? "");
      setModality(project.modality ?? "");
      setProviderType(project.providerType ?? "");
      setAttachments(project.attachments ?? []);
      setCurrency(project.currency ?? "PEN");
      setLanguage(project.language ?? "es");
      setMinBudget(project.minBudget?.toString() ?? "");
      setMaxBudget(project.maxBudget?.toString() ?? "");
      setHourlyRateMin(project.hourlyRateMin?.toString() ?? "");
      setHourlyRateMax(project.hourlyRateMax?.toString() ?? "");
    }
  }, [project]);

  // ─── Mutación de actualización ──────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: () =>
      freelanceApi.update(projectId, {
        title,
        description,
        category,
        subcategory: subcategory || undefined,
        budget: budget ? Number(budget) : undefined,
        estimatedDays: Number(estimatedDays),
        experienceLevel: experienceLevel || undefined,
        skills: skills.length > 0 ? skills : undefined,
        budgetType: budgetType || undefined,
        modality: modality || undefined,
        providerType: providerType || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        currency: currency || undefined,
        language: language || undefined,
        minBudget: minBudget ? Number(minBudget) : undefined,
        maxBudget: maxBudget ? Number(maxBudget) : undefined,
        hourlyRateMin: hourlyRateMin ? Number(hourlyRateMin) : undefined,
        hourlyRateMax: hourlyRateMax ? Number(hourlyRateMax) : undefined,
      }),
    onSuccess: () => {
      router.push(`/company/projects/${projectId}`);
    },
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const addSkill = useCallback(() => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setSkillInput("");
    }
  }, [skillInput, skills]);

  const removeSkill = useCallback((skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }, []);

  const handleSubmit = useCallback(() => {
    updateMutation.mutate();
  }, [updateMutation]);

  const currencySymbol = getCurrencySymbol(currency);

  // ─── Validación ─────────────────────────────────────────────────────────────
  const isStep1Valid = title.length >= 5 && description.length >= 20 && category.length >= 3;
  const isStep2Valid = Number(estimatedDays) > 0;
  const isStep3Valid = true;

  const canGoNext =
    (currentStep === 1 && isStep1Valid) ||
    (currentStep === 2 && isStep2Valid) ||
    (currentStep === 3 && isStep3Valid);

  // ─── Loading / Error ────────────────────────────────────────────────────────
  if (projectQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (projectQuery.isError || !project) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Proyecto no encontrado</h2>
          <p className="text-sm text-slate-500 mb-4">El proyecto que intentas editar no existe o no tienes acceso.</p>
          <button
            onClick={() => router.push("/company/projects")}
            className="inline-flex items-center gap-2 bg-[#1e3a8a] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1e3a8a]/90 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a mis proyectos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => router.push(`/company/projects/${projectId}`)}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al proyecto
          </button>
          <h1 className="text-2xl font-bold text-[#0a1628]">Editar Proyecto</h1>
          <p className="text-sm text-slate-500 mt-1">
            Actualiza la información de tu proyecto freelance
          </p>
        </div>
      </div>

      {/* ── Steps Progress ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                currentStep === step.id
                  ? "bg-[#1e3a8a] text-white shadow-sm"
                  : currentStep > step.id
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-white text-slate-400 border border-slate-200"
              }`}
            >
              {currentStep > step.id ? (
                <Check className="w-4 h-4" />
              ) : (
                <step.icon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 rounded-full ${
                  currentStep > step.id ? "bg-emerald-400" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Form Steps ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        {/* Step 1: Detalles del Proyecto */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Título del Proyecto <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Desarrollo de plataforma e-commerce"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                {title.length}/150 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Descripción <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe detalladamente el proyecto, objetivos, entregables..."
                rows={6}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition resize-none"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                {description.length}/5000 caracteres
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Categoría <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ej: Desarrollo Web"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Subcategoría
                </label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="Ej: E-commerce"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Presupuesto y Plazos */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Moneda
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Idioma
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Tipo de Presupuesto
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {BUDGET_TYPES.map((bt) => (
                  <button
                    key={bt.value}
                    type="button"
                    onClick={() => setBudgetType(bt.value)}
                    className={`p-4 rounded-xl border-2 text-left transition ${
                      budgetType === bt.value
                        ? "border-[#1e3a8a] bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-semibold text-sm text-slate-900">{bt.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{bt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {budgetType === "FIXED" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Presupuesto Mínimo ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    placeholder="500"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Presupuesto Máximo ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    placeholder="5000"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>
            )}

            {budgetType === "HOURLY" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Tarifa Mínima por Hora ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={hourlyRateMin}
                    onChange={(e) => setHourlyRateMin(e.target.value)}
                    placeholder="15"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Tarifa Máxima por Hora ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={hourlyRateMax}
                    onChange={(e) => setHourlyRateMax(e.target.value)}
                    placeholder="50"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Presupuesto Total ({currencySymbol})
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="2500"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Duración Estimada (días) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                placeholder="30"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          </div>
        )}

        {/* Step 3: Requisitos y Preferencias */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nivel de Experiencia
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {EXPERIENCE_LEVELS.map((el) => (
                  <button
                    key={el.value}
                    type="button"
                    onClick={() => setExperienceLevel(el.value)}
                    className={`p-4 rounded-xl border-2 text-center transition ${
                      experienceLevel === el.value
                        ? "border-[#1e3a8a] bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <el.icon className="w-6 h-6 mx-auto mb-1.5 text-slate-600" />
                    <p className="font-semibold text-sm text-slate-900">{el.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{el.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Modalidad de Trabajo
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {MODALITIES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setModality(m.value)}
                    className={`p-4 rounded-xl border-2 text-center transition ${
                      modality === m.value
                        ? "border-[#1e3a8a] bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <m.icon className="w-6 h-6 mx-auto mb-1.5 text-slate-600" />
                    <p className="font-semibold text-sm text-slate-900">{m.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Tipo de Proveedor
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PROVIDER_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    type="button"
                    onClick={() => setProviderType(pt.value)}
                    className={`p-4 rounded-xl border-2 text-left transition ${
                      providerType === pt.value
                        ? "border-[#1e3a8a] bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <pt.icon className="w-6 h-6 mb-1.5 text-slate-600" />
                    <p className="font-semibold text-sm text-slate-900">{pt.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{pt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Habilidades Requeridas
              </label>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Ej: React, Node.js, Python..."
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  disabled={!skillInput.trim()}
                  className="px-4 py-3 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e3a8a]/90 transition disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0d9488]/10 text-[#0d9488] rounded-lg text-sm font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-red-500 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Revisión */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Revisa los cambios antes de guardar</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Una vez guardados, los cambios se aplicarán inmediatamente al proyecto.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Título</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{title}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoría</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{category}{subcategory ? ` / ${subcategory}` : ""}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</p>
                <p className="text-sm text-slate-700 mt-1 line-clamp-3">{description}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Presupuesto</p>
                  <p className="text-sm font-semibold text-emerald-600 mt-1">
                    {budgetType === "FIXED"
                      ? minBudget || maxBudget
                        ? `${currencySymbol} ${Number(minBudget || 0).toLocaleString("es-PE")} - ${currencySymbol} ${Number(maxBudget || 0).toLocaleString("es-PE")}`
                        : `${currencySymbol} ${Number(budget || 0).toLocaleString("es-PE")}`
                      : `${currencySymbol} ${Number(hourlyRateMin || 0).toLocaleString("es-PE")}/h - ${currencySymbol} ${Number(hourlyRateMax || 0).toLocaleString("es-PE")}/h`}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duración</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{estimatedDays} días</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Experiencia</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{experienceLevel || "No especificado"}</p>
                </div>
              </div>

              {skills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Habilidades</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Navigation Buttons ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(STEPS.length, prev + 1))}
              disabled={!canGoNext}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#1e3a8a] text-sm font-bold text-white hover:bg-[#1e3a8a]/90 transition disabled:opacity-40 shadow-sm"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700 transition disabled:opacity-40 shadow-sm"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Guardar Cambios
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
