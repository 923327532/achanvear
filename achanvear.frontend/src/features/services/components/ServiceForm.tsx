// features/services/components/ServiceForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Code2, TrendingUp, Palette, Scale, Calculator,
  Briefcase, Camera, Loader2, ArrowLeft,
  Heart, GraduationCap, HardHat, Truck,
  ChevronLeft, ChevronRight, Check, Plus, X,
  Globe, MapPin, Clock, DollarSign, Phone, Mail,
  FileText, Video, Shield, HelpCircle, Wifi,
  Building, Award, Star, Lightbulb, Bot, Send,
} from "lucide-react";
import type { Service, ServiceFormData, ServiceCategory, ServicePlanFormData } from "../types/service.types";
import { CATEGORY_LABELS } from "../types/service.types";

interface Props {
  service?: Service;
  onSubmit: (data: ServiceFormData, publish: boolean) => Promise<void>;
  isSubmitting: boolean;
  // Datos precargados del perfil del freelancer
  freelancerProfile?: {
    name: string;
    headline: string;
    location: string;
    whatsapp?: string;
    phone?: string;
    email?: string;
    portfolioUrl?: string;
    skills?: string[];
  };
}

const CATEGORY_OPTIONS: { value: ServiceCategory; icon: React.ElementType; color: string }[] = [
  { value: "TECHNOLOGY", icon: Code2, color: "text-blue-600" },
  { value: "MARKETING", icon: TrendingUp, color: "text-orange-500" },
  { value: "DESIGN", icon: Palette, color: "text-purple-500" },
  { value: "LEGAL", icon: Scale, color: "text-gray-600" },
  { value: "ACCOUNTING", icon: Calculator, color: "text-violet-600" },
  { value: "CONSULTING", icon: Briefcase, color: "text-pink-500" },
  { value: "HEALTH", icon: Heart, color: "text-green-600" },
  { value: "EDUCATION", icon: GraduationCap, color: "text-yellow-600" },
  { value: "CONSTRUCTION", icon: HardHat, color: "text-amber-600" },
  { value: "LOGISTICS", icon: Truck, color: "text-cyan-600" },
];

const MODALITY_OPTIONS = [
  { value: "PRESENTIAL", label: "Presencial", icon: Building },
  { value: "REMOTE", label: "Remoto", icon: Wifi },
  { value: "HYBRID", label: "Híbrido", icon: Globe },
];

const COVERAGE_OPTIONS = [
  { value: "LOCAL", label: "Local", icon: MapPin },
  { value: "NATIONAL", label: "Nacional", icon: Globe },
  { value: "INTERNATIONAL", label: "Internacional", icon: Globe },
];

const BILLING_OPTIONS = [
  { value: "PER_HOUR", label: "Por hora" },
  { value: "PER_DAY", label: "Por día" },
  { value: "PER_PROJECT", label: "Por proyecto" },
  { value: "MONTHLY", label: "Mensual" },
  { value: "CUSTOM", label: "Cotización personalizada" },
];

const RESPONSE_TIME_OPTIONS = [
  "En menos de 1 hora",
  "En menos de 2 horas",
  "En menos de 6 horas",
  "En menos de 12 horas",
  "En menos de 24 horas",
  "En menos de 48 horas",
];

const CURRENCY_OPTIONS = [
  { value: "PEN", label: "S/. (Soles)" },
  { value: "USD", label: "$ (Dólares)" },
  { value: "EUR", label: "€ (Euros)" },
];

const TIPS = [
  "Usa un título claro y específico que explique el valor",
  "Detalla exactamente qué entregarás al cliente",
  "Incluye imágenes de tu trabajo anterior (portfolio)",
  "Establece plazos realistas que puedas cumplir",
];

type Step = "general" | "details" | "pricing" | "contact" | "multimedia" | "extras";

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "Info General", icon: FileText },
  { id: "details", label: "Detalles", icon: Clock },
  { id: "pricing", label: "Precios", icon: DollarSign },
  { id: "contact", label: "Contacto", icon: Phone },
  { id: "multimedia", label: "Multimedia", icon: Camera },
  { id: "extras", label: "Extras", icon: Shield },
];

const EMPTY_FORM: ServiceFormData = {
  title: "",
  shortDescription: "",
  category: "",
  subcategory: "",
  tags: [],
  description: "",
  modality: "",
  coverageType: "",
  coverageDetails: "",
  schedule: "",
  deliveryDays: "",
  availableImmediately: false,
  basePrice: "",
  billingType: "",
  currency: "PEN",
  plans: [],
  whatsapp: "",
  phone: "",
  emailContact: "",
  responseTime: "",
  imageUrls: [],
  videoUrls: [],
  pdfUrls: [],
  certificateUrls: [],
  faqs: "",
  warrantyInfo: "",
  cancellationPolicy: "",
  supportInfo: "",
};

export function ServiceForm({ service, onSubmit, isSubmitting, freelancerProfile }: Props) {
  const router = useRouter();
  const isEditMode = !!service;

  const [form, setForm] = useState<ServiceFormData>(EMPTY_FORM);
  const [currentStep, setCurrentStep] = useState<Step>("general");
  const [statusEdit, setStatusEdit] = useState<"ACTIVE" | "PAUSED">("ACTIVE");
  const [tagInput, setTagInput] = useState("");
  const [faqInputs, setFaqInputs] = useState<{ question: string; answer: string }[]>([]);
  
  // ── Estado del chat IA ─────────────────────────────────────────────────────
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Cargar datos del perfil del freelancer al inicio
  useEffect(() => {
    if (freelancerProfile) {
      setForm(prev => ({
        ...prev,
        whatsapp: freelancerProfile.whatsapp || prev.whatsapp,
        phone: freelancerProfile.phone || prev.phone,
        emailContact: freelancerProfile.email || prev.emailContact,
        tags: freelancerProfile.skills || prev.tags,
      }));
    }
  }, [freelancerProfile]);

  useEffect(() => {
    if (service) {
      setForm({
        title: service.title,
        shortDescription: service.shortDescription || "",
        category: service.category,
        subcategory: service.subcategory || "",
        tags: service.tags || [],
        description: service.description,
        modality: (service.modality as any) || "",
        coverageType: (service.coverageType as any) || "",
        coverageDetails: service.coverageDetails || "",
        schedule: service.schedule || "",
        deliveryDays: service.deliveryDays,
        availableImmediately: service.availableImmediately || false,
        basePrice: service.basePrice,
        billingType: (service.billingType as any) || "",
        currency: service.currency || "PEN",
        plans: [],
        whatsapp: service.whatsapp || "",
        phone: service.phone || "",
        emailContact: service.emailContact || "",
        responseTime: service.responseTime || "",
        imageUrls: service.imageUrls || [],
        videoUrls: service.videoUrls || [],
        pdfUrls: service.pdfUrls || [],
        certificateUrls: service.certificateUrls || [],
        faqs: service.faqs || "",
        warrantyInfo: service.warrantyInfo || "",
        cancellationPolicy: service.cancellationPolicy || "",
        supportInfo: service.supportInfo || "",
      });
      setStatusEdit(service.status === "PAUSED" ? "PAUSED" : "ACTIVE");
    }
  }, [service]);

  const stepIndex = STEPS.findIndex(s => s.id === currentStep);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === STEPS.length - 1;

  const isValid =
    form.title.trim().length > 0 &&
    form.category !== "" &&
    form.description.trim().length >= 10 &&
    Number(form.basePrice) > 0 &&
    Number(form.deliveryDays) > 0;

  const handleSubmit = async (publish: boolean) => {
    if (!isValid) return;
    // Convertir FAQs a JSON string
    const faqsJson = faqInputs.length > 0
      ? JSON.stringify(faqInputs)
      : form.faqs;
    await onSubmit(
      isEditMode
        ? { ...form, faqs: faqsJson, status: statusEdit } as any
        : { ...form, faqs: faqsJson },
      publish
    );
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) });
  };

  const addPlan = () => {
    setForm({
      ...form,
      plans: [...form.plans, { name: "", description: "", price: "", deliveryDays: "", features: [] }],
    });
  };

  const updatePlan = (index: number, data: Partial<ServicePlanFormData>) => {
    const plans = [...form.plans];
    plans[index] = { ...plans[index], ...data };
    setForm({ ...form, plans });
  };

  const removePlan = (index: number) => {
    setForm({ ...form, plans: form.plans.filter((_, i) => i !== index) });
  };

  const addPlanFeature = (planIndex: number, feature: string) => {
    const plans = [...form.plans];
    if (feature && !plans[planIndex].features.includes(feature)) {
      plans[planIndex].features.push(feature);
    }
    setForm({ ...form, plans });
  };

  const removePlanFeature = (planIndex: number, feature: string) => {
    const plans = [...form.plans];
    plans[planIndex].features = plans[planIndex].features.filter(f => f !== feature);
    setForm({ ...form, plans });
  };

  const addFaq = () => {
    setFaqInputs([...faqInputs, { question: "", answer: "" }]);
  };

  const updateFaq = (index: number, data: Partial<{ question: string; answer: string }>) => {
    const faqs = [...faqInputs];
    faqs[index] = { ...faqs[index], ...data };
    setFaqInputs(faqs);
  };

  const removeFaq = (index: number) => {
    setFaqInputs(faqInputs.filter((_, i) => i !== index));
  };

  // ── IA: autocompletar servicio ─────────────────────────────────────────────
  const handleAiAssist = async () => {
    const trimmed = aiPrompt.trim();
    if (!trimmed || aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const { serviceApi } = await import("../api/serviceApi");
      const suggestion = await serviceApi.aiSuggest(trimmed);
      
      setForm(prev => ({
        ...prev,
        title: suggestion.title || prev.title,
        shortDescription: suggestion.shortDescription || prev.shortDescription,
        description: suggestion.description || prev.description,
        category: (suggestion.category as any) || prev.category,
        subcategory: suggestion.subcategory || prev.subcategory,
        tags: suggestion.tags?.length ? suggestion.tags : prev.tags,
        modality: (suggestion.modality as any) || prev.modality,
        coverageType: (suggestion.coverageType as any) || prev.coverageType,
        coverageDetails: suggestion.coverageDetails || prev.coverageDetails,
        schedule: suggestion.schedule || prev.schedule,
        deliveryDays: suggestion.deliveryDays || prev.deliveryDays,
        availableImmediately: suggestion.availableImmediately ?? prev.availableImmediately,
        basePrice: suggestion.basePrice || prev.basePrice,
        billingType: (suggestion.billingType as any) || prev.billingType,
        currency: suggestion.currency || prev.currency,
        plans: suggestion.plans?.length ? suggestion.plans.map(p => ({
          name: p.name,
          description: p.description,
          price: p.price || "",
          deliveryDays: p.deliveryDays || "",
          features: p.features || [],
        })) : prev.plans,
        whatsapp: suggestion.whatsapp || prev.whatsapp,
        phone: suggestion.phone || prev.phone,
        emailContact: suggestion.emailContact || prev.emailContact,
        responseTime: suggestion.responseTime || prev.responseTime,
        faqs: suggestion.faqs || prev.faqs,
        warrantyInfo: suggestion.warrantyInfo || prev.warrantyInfo,
        cancellationPolicy: suggestion.cancellationPolicy || prev.cancellationPolicy,
        supportInfo: suggestion.supportInfo || prev.supportInfo,
      }));
      
      setAiPrompt("");
      setShowAiChat(false);
    } catch {
      setAiError("No pudimos completar la sugerencia. Intenta nuevamente en unos segundos.");
    } finally {
      setAiLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
      {STEPS.map(({ id, label, icon: Icon }, index) => {
        const isActive = currentStep === id;
        const isCompleted = stepIndex > index;
        return (
          <button
            key={id}
            onClick={() => setCurrentStep(id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap transition-all ${
              isActive
                ? "bg-[#1B3A6B] text-white"
                : isCompleted
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {isCompleted ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(" ")[0]}</span>
          </button>
        );
      })}
    </div>
  );

  const renderGeneralStep = () => (
    <div className="space-y-4">
      {/* Título */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Título del Servicio <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Ej: Desarrollo de sitio web profesional con React"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          maxLength={80}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
        />
        <p className="text-xs text-gray-400 mt-1">{form.title.length}/80 caracteres</p>
      </div>

      {/* Descripción corta */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Descripción Corta
        </label>
        <input
          type="text"
          placeholder="Breve resumen del servicio (máx. 300 caracteres)"
          value={form.shortDescription}
          onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
          maxLength={300}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
        />
      </div>

      {/* Categoría */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Categoría <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORY_OPTIONS.map(({ value, icon: Icon, color }) => (
            <button
              key={value}
              onClick={() => setForm({ ...form, category: value })}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                form.category === value
                  ? "border-[#1B3A6B] bg-[#1B3A6B] text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Icon className={`w-4 h-4 ${form.category === value ? "text-white" : color}`} />
              {CATEGORY_LABELS[value as ServiceCategory]}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategoría */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subcategoría</label>
        <input
          type="text"
          placeholder="Ej: Desarrollo Web, Diseño UX/UI, Marketing Digital..."
          value={form.subcategory}
          onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
        />
      </div>

      {/* Tags / Etiquetas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Etiquetas (Tags)</label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            placeholder="Agrega una etiqueta y presiona Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
          />
          <button
            onClick={addTag}
            className="p-2.5 bg-[#1B3A6B] text-white rounded-xl hover:bg-[#0EA5A0] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {form.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
              {tag}
              <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        {freelancerProfile?.skills && (
          <p className="text-xs text-gray-400 mt-2">
            💡 Se cargaron {freelancerProfile.skills.length} habilidades de tu perfil como etiquetas
          </p>
        )}
      </div>

      {/* Descripción completa */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Descripción Completa <span className="text-red-500">*</span>
        </label>
        <textarea
          placeholder="Describe en detalle qué incluye tu servicio, beneficios, experiencia..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={6}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">{form.description.length} caracteres (mín. 10)</p>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-4">
      {/* Modalidad */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Modalidad de Trabajo</label>
        <div className="grid grid-cols-3 gap-3">
          {MODALITY_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setForm({ ...form, modality: value as any })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${
                form.modality === value
                  ? "border-[#1B3A6B] bg-[#1B3A6B] text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cobertura */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Cobertura</label>
        <div className="grid grid-cols-3 gap-3">
          {COVERAGE_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setForm({ ...form, coverageType: value as any })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${
                form.coverageType === value
                  ? "border-[#1B3A6B] bg-[#1B3A6B] text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Detalles de cobertura (distritos, ciudades, países)"
          value={form.coverageDetails}
          onChange={(e) => setForm({ ...form, coverageDetails: e.target.value })}
          className="w-full mt-3 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
        />
      </div>

      {/* Horarios */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Horarios de Atención</label>
        <input
          type="text"
          placeholder="Ej: Lunes a Viernes 9am - 6pm"
          value={form.schedule}
          onChange={(e) => setForm({ ...form, schedule: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
        />
      </div>

      {/* Tiempo de entrega */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Tiempo de Entrega (días) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          placeholder="7"
          value={form.deliveryDays}
          onChange={(e) => setForm({ ...form, deliveryDays: e.target.value === "" ? "" : Number(e.target.value) })}
          min={1}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
        />
      </div>

      {/* Disponibilidad inmediata */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.availableImmediately}
            onChange={(e) => setForm({ ...form, availableImmediately: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-[#1B3A6B] focus:ring-[#0EA5A0]"
          />
          <div>
            <span className="text-sm font-semibold text-gray-700">Disponibilidad inmediata</span>
            <p className="text-xs text-gray-400">Puedo empezar el proyecto de inmediato</p>
          </div>
        </label>
      </div>
    </div>
  );

  const renderPricingStep = () => (
    <div className="space-y-4">
      {/* Precio base */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Precio Base <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="500"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: e.target.value === "" ? "" : Number(e.target.value) })}
            min={1}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
          />
          <select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
          >
            {CURRENCY_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tipo de cobro */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Cobro</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BILLING_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setForm({ ...form, billingType: value as any })}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                form.billingType === value
                  ? "border-[#1B3A6B] bg-[#1B3A6B] text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Planes / Paquetes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Planes o Paquetes</label>
            <p className="text-xs text-gray-400">Ofrece diferentes niveles de servicio</p>
          </div>
          <button
            onClick={addPlan}
            className="flex items-center gap-1 text-xs font-medium text-[#1B3A6B] bg-[#1B3A6B]/5 px-3 py-1.5 rounded-lg hover:bg-[#1B3A6B]/10 transition-colors"
          >
            <Plus className="w-3 h-3" /> Agregar Plan
          </button>
        </div>
        {form.plans.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No has agregado planes aún. Puedes ofrecer hasta 3 planes (Básico, Profesional, Premium)</p>
        )}
        {form.plans.map((plan, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">Plan {index + 1}</span>
              <button onClick={() => removePlan(index)} className="text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="Nombre del plan (Ej: Básico)"
                value={plan.name}
                onChange={(e) => updatePlan(index, { name: e.target.value })}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0]"
              />
              <input
                type="number"
                placeholder="Precio"
                value={plan.price}
                onChange={(e) => updatePlan(index, { price: e.target.value === "" ? "" : Number(e.target.value) })}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0]"
              />
            </div>
            <input
              type="text"
              placeholder="Descripción del plan"
              value={plan.description}
              onChange={(e) => updatePlan(index, { description: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0]"
            />
            <input
              type="number"
              placeholder="Días de entrega para este plan"
              value={plan.deliveryDays}
              onChange={(e) => updatePlan(index, { deliveryDays: e.target.value === "" ? "" : Number(e.target.value) })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0]"
            />
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Características del plan:</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {plan.features.map((f) => (
                  <span key={f} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">
                    {f}
                    <button onClick={() => removePlanFeature(index, f)} className="text-emerald-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Agregar característica"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPlanFeature(index, (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30"
                />
                <button
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                    addPlanFeature(index, input.value);
                    input.value = "";
                  }}
                  className="text-xs text-[#0EA5A0] font-medium hover:underline"
                >
                  + Agregar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContactStep = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Información de Contacto</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">WhatsApp</label>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-500" />
              <input
                type="text"
                placeholder="+51 999 888 777"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-500" />
              <input
                type="text"
                placeholder="+51 999 888 777"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Correo Electrónico</label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.emailContact}
                onChange={(e) => setForm({ ...form, emailContact: e.target.value })}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tiempo de Respuesta Promedio</label>
            <select
              value={form.responseTime}
              onChange={(e) => setForm({ ...form, responseTime: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors"
            >
              <option value="">Seleccionar tiempo de respuesta</option>
              {RESPONSE_TIME_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Upload helpers ─────────────────────────────────────────────────────────
  const [uploading, setUploading] = useState<{ images: boolean; videos: boolean; pdfs: boolean; certs: boolean }>({
    images: false, videos: false, pdfs: false, certs: false,
  });

  const handleFileUpload = async (
    files: FileList | null,
    type: "images" | "videos" | "pdfs" | "certs"
  ) => {
    if (!files || files.length === 0) return;

    const uploadKey = type === "images" ? "images" : type === "videos" ? "videos" : type === "pdfs" ? "pdfs" : "certs";
    const formKey = type === "images" ? "imageUrls" : type === "videos" ? "videoUrls" : type === "pdfs" ? "pdfUrls" : "certificateUrls";

    setUploading(prev => ({ ...prev, [uploadKey]: true }));

    try {
      const { storageApi } = await import("../api/storageApi");
      const s3Type = type === "images" ? "IMAGES"
        : type === "videos" ? "VIDEOS"
        : type === "pdfs" ? "PDFS"
        : "CERTIFICATES";

      const urls = await storageApi.uploadFiles(s3Type, Array.from(files));
      setForm(prev => ({
        ...prev,
        [formKey]: [...prev[formKey], ...urls],
      }));
    } catch (err: any) {
      alert("Error al subir archivos: " + (err.message || "Error desconocido"));
    } finally {
      setUploading(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const removeFile = (type: "imageUrls" | "videoUrls" | "pdfUrls" | "certificateUrls", index: number) => {
    setForm(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const renderFileUploadZone = (
    label: string,
    icon: React.ElementType,
    description: string,
    hint: string,
    type: "images" | "videos" | "pdfs" | "certs",
    formKey: "imageUrls" | "videoUrls" | "pdfUrls" | "certificateUrls",
    accept: string,
    multiple: boolean
  ) => {
    const Icon = icon;
    const isUploading = type === "images" ? uploading.images : type === "videos" ? uploading.videos : type === "pdfs" ? uploading.pdfs : uploading.certs;

    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>

        {/* Files preview */}
        {form[formKey].filter(Boolean).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {form[formKey].filter(Boolean).map((url, i) => (
              <div key={i} className="relative group">
                {type === "images" ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt={`${label} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ) : type === "videos" ? (
                  <div className="w-20 h-20 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
                    <Video className="w-6 h-6 text-gray-400" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => removeFile(formKey, i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload zone */}
        <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#0EA5A0]/40 transition-colors cursor-pointer block">
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files, type)}
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#0EA5A0]" />
              <p className="text-sm text-gray-500">Subiendo...</p>
            </div>
          ) : (
            <>
              <Icon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{description}</p>
              <p className="text-xs text-gray-400 mt-1">{hint}</p>
            </>
          )}
        </label>
      </div>
    );
  };

  const renderMultimediaStep = () => (
    <div className="space-y-6">
      {renderFileUploadZone(
        "Imágenes del Servicio", Camera,
        "Haz clic para seleccionar imágenes",
        "PNG, JPG, WebP - Max 5MB cada una",
        "images", "imageUrls", "image/png,image/jpeg,image/jpg,image/webp,image/gif", true
      )}
      {renderFileUploadZone(
        "Videos (Opcional)", Video,
        "Haz clic para seleccionar videos",
        "MP4, WebM, OGG - Max 10MB - Máx 1:30 min de duración",
        "videos", "videoUrls", "video/mp4,video/webm,video/ogg,video/quicktime", true
      )}
      {renderFileUploadZone(
        "Archivos PDF", FileText,
        "Haz clic para seleccionar PDFs",
        "PDF - Max 10MB",
        "pdfs", "pdfUrls", "application/pdf", true
      )}
      {renderFileUploadZone(
        "Certificados", Award,
        "Haz clic para seleccionar certificados",
        "PDF, PNG, JPG - Max 10MB",
        "certs", "certificateUrls", "application/pdf,image/png,image/jpeg", true
      )}
    </div>
  );

  const renderExtrasStep = () => (
    <div className="space-y-6">
      {/* FAQs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Preguntas Frecuentes (FAQs)</label>
            <p className="text-xs text-gray-400">Resuelve las dudas comunes de tus clientes</p>
          </div>
          <button
            onClick={addFaq}
            className="flex items-center gap-1 text-xs font-medium text-[#1B3A6B] bg-[#1B3A6B]/5 px-3 py-1.5 rounded-lg hover:bg-[#1B3A6B]/10 transition-colors"
          >
            <Plus className="w-3 h-3" /> Agregar FAQ
          </button>
        </div>
        {faqInputs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500">FAQ {index + 1}</span>
              <button onClick={() => removeFaq(index)} className="text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Pregunta"
              value={faq.question}
              onChange={(e) => updateFaq(index, { question: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0]"
            />
            <textarea
              placeholder="Respuesta"
              value={faq.answer}
              onChange={(e) => updateFaq(index, { answer: e.target.value })}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] resize-none"
            />
          </div>
        ))}
        {faqInputs.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No hay preguntas frecuentes aún</p>
        )}
      </div>

      {/* Garantía */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Garantía del Servicio</label>
        <textarea
          placeholder="Describe la garantía que ofreces con tu servicio"
          value={form.warrantyInfo}
          onChange={(e) => setForm({ ...form, warrantyInfo: e.target.value })}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors resize-none"
        />
      </div>

      {/* Políticas de cancelación */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Políticas de Cancelación</label>
        <textarea
          placeholder="Describe tus políticas de cancelación y reembolso"
          value={form.cancellationPolicy}
          onChange={(e) => setForm({ ...form, cancellationPolicy: e.target.value })}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors resize-none"
        />
      </div>

      {/* Soporte post servicio */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Soporte Post-Servicio</label>
        <textarea
          placeholder="Describe el soporte que ofreces después de entregar el servicio"
          value={form.supportInfo}
          onChange={(e) => setForm({ ...form, supportInfo: e.target.value })}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] transition-colors resize-none"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-gray-50/50">
      <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white border border-gray-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A6B]">
              {isEditMode ? "Editar Servicio" : "Crear Nuevo Servicio Profesional"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEditMode
                ? "Actualiza la información de tu servicio"
                : "Completa la información en 6 pasos para publicar tu servicio"}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        {renderStepIndicator()}

        {/* Step content */}
        {currentStep === "general" && renderGeneralStep()}
        {currentStep === "details" && renderDetailsStep()}
        {currentStep === "pricing" && renderPricingStep()}
        {currentStep === "contact" && renderContactStep()}
        {currentStep === "multimedia" && renderMultimediaStep()}
        {currentStep === "extras" && renderExtrasStep()}

        {/* Tips */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-[#0EA5A0]" />
            <span className="text-sm font-semibold text-[#0EA5A0]">Consejos para destacar tu servicio</span>
          </div>
          <ul className="space-y-1.5">
            {TIPS.map((tip) => (
              <li key={tip} className="text-xs text-gray-600 flex items-start gap-1.5">
                <span className="text-[#0EA5A0] mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation & Submit */}
        <div className="flex items-center justify-between gap-3 pt-6 pb-8">
          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={() => setCurrentStep(STEPS[stepIndex - 1].id)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 bg-white rounded-xl px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isEditMode && (
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting || !form.title}
                className="text-sm font-medium text-gray-600 border border-gray-200 bg-white rounded-xl px-5 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Guardar como Borrador
              </button>
            )}
            {isLastStep ? (
              <button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting || !isValid}
                className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl px-6 py-3 hover:bg-[#0EA5A0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditMode ? "Guardar Cambios" : "Publicar Servicio"}
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(STEPS[stepIndex + 1].id)}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1B3A6B] rounded-xl px-5 py-3 hover:bg-[#0EA5A0] transition-colors"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Estado — solo en edición */}
        {isEditMode && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Estado</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStatusEdit("ACTIVE")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  statusEdit === "ACTIVE"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                ✓ Activo
              </button>
              <button
                onClick={() => setStatusEdit("PAUSED")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  statusEdit === "PAUSED"
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                ⏸ Pausado
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botón flotante IA */}
      <button
        type="button"
        onClick={() => setShowAiChat(!showAiChat)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
        title="Asistente IA - Autocompletar servicio"
      >
        <Bot className="w-7 h-7" />
      </button>

      {/* Chat IA que se abre al hacer clic en el ícono 🤖 */}
      {showAiChat && (
        <div className="fixed bottom-24 left-3 right-3 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-[70] sm:left-auto sm:right-6 sm:w-[340px]">
          <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="text-sm font-semibold">Asistente IA</span>
            </div>
            <button type="button" onClick={() => setShowAiChat(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-4 py-6 bg-slate-50 min-h-[160px] flex flex-col justify-center">
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Describe tu servicio profesional y la IA autocompletará todos los campos del formulario.
            </p>
            {aiError && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {aiError}
              </p>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiAssist(); } }}
                placeholder="Ej: Desarrollo web con React y Node.js..."
                disabled={aiLoading}
                className="flex-1 h-9 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleAiAssist}
                disabled={!aiPrompt.trim() || aiLoading}
                className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
