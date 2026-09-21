"use client";

import { useState, useEffect } from "react";
import { FileText, Building, Rocket, Crown, CheckCircle2, Bot, Shield, MessageCircle, Eye, TrendingUp, Users, ArrowRight, Star, Zap, Video, Brain, GraduationCap, Code, Scale } from "lucide-react";
import { ApiError } from "@/lib/errors";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";
import type { CompanyOnboardingData, Plan } from "@/features/onboarding/types/onboarding.types";

interface PlanSummaryStepProps {
  data: CompanyOnboardingData;
  onUpdate: (updates: Partial<CompanyOnboardingData>) => void;
  onNext: (fromStep?: number) => void;
  onBack: () => void;
}

export function PlanSummaryStep({ data, onUpdate, onNext, onBack }: PlanSummaryStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSelectedPlan();
  }, []);

  const loadSelectedPlan = async () => {
    try {
      const plans = await onboardingService.getPlans();
      const plan = plans.find(p => p.id === data.selectedPlan);
      setSelectedPlan(plan || null);
    } catch (err) {
      console.error("Error loading plans:", err);
      setSelectedPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleContinue = async () => {
    // Free plan: continuar sin pago
    if (selectedPlan?.id === "FREE") {
      onUpdate({ planConfirmed: true });
      onNext();
      return;
    }

    // Paid plans: redirigir a MercadoPago
    setIsProcessing(true);
    setPaymentError(null);
    try {
      const initPoint = await onboardingService.subscribeToPlan(
        selectedPlan!.id,
        data.email
      );
      // Redirigir a MercadoPago
      window.location.href = initPoint;
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Error al procesar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando plan...</p>
        </div>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
        <p className="text-slate-600">Plan no encontrado</p>
        <button onClick={onBack} className="mt-4 text-teal-600 font-semibold">Volver</button>
      </div>
    );
  }

  const price = data.billingCycle === "yearly" && selectedPlan.price > 0
    ? Math.round(selectedPlan.price * 12 * 0.8)
    : selectedPlan.price;

  const pricePerMonth = data.billingCycle === "yearly" && selectedPlan.price > 0
    ? Math.round(selectedPlan.price * 12 * 0.8 / 12)
    : selectedPlan.price;

  const savings = selectedPlan.price > 0
    ? (selectedPlan.price * 12) - Math.round(selectedPlan.price * 12 * 0.8)
    : 0;

  switch (selectedPlan.id) {
    case "FREE":
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="inline-block bg-[#64748B]/10 text-[#64748B] text-xs font-bold px-3 py-1 rounded-full border border-[#64748B]/20 mb-4">
              Plan Gratuito
            </div>
            <h1 className="text-4xl font-bold text-[#0F172A] mb-4">
              ¡Bienvenido a Achanvear!
            </h1>
            <p className="text-lg text-[#64748B] mb-8 max-w-2xl mx-auto">
              Tu cuenta está lista. Estás en el <strong>Plan Free</strong> y puedes empezar a publicar vacantes ahora mismo.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { icon: <FileText className="w-5 h-5" />, text: `${selectedPlan.maxActiveJobs === -1 ? "Publicaciones ilimitadas" : `${selectedPlan.maxActiveJobs} publicación activa`}`, desc: "Publica una vacante a la vez" },
                { icon: <Users className="w-5 h-5" />, text: "Match básico con candidatos", desc: "Encuentra candidatos compatibles" },
                { icon: <Eye className="w-5 h-5" />, text: "Ver perfiles públicos", desc: "Acceso a perfiles de profesionales" },
                { icon: <MessageCircle className="w-5 h-5" />, text: `Mensajería limitada (${selectedPlan.maxInterviews > 0 ? `${selectedPlan.maxInterviews}/mes` : "5/mes"})`, desc: "Contacta a candidatos" },
              ].map((feature, i) => (
                <div key={i} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-left">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg text-[#1B3A6B]">
                      {feature.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-[#0F172A] mb-1">{feature.text}</p>
                      <p className="text-sm text-[#64748B]">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-[#EBF0F7] to-[#DBEAFE] border-2 border-[#3B82F6]/20 rounded-xl p-6 mb-8 text-left">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-[#3B82F6] flex-shrink-0" />
                <div>
                  <p className="font-bold text-[#0F172A] mb-1">¿Necesitas más funcionalidades?</p>
                  <p className="text-sm text-[#64748B]">Actualiza a un plan premium en cualquier momento desde tu panel</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={onBack} className="flex-1 border-2 border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition">
                Volver a planes
              </button>
              <button onClick={handleContinue} className="flex-1 bg-gradient-to-r from-[#1B3A6B] to-[#0EA5A0] hover:from-[#0F172A] hover:to-[#0d928d] text-white font-bold py-3 rounded-xl transition">
                Ir al Panel de Control
              </button>
            </div>
            <p className="text-sm text-[#64748B] mt-4">Puedes actualizar tu plan en cualquier momento desde Configuración</p>
          </div>
        </div>
      );

    case "BASIC":
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-10">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] rounded-2xl">
                  <Building className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="inline-block bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-bold px-3 py-1 rounded-full border border-[#3B82F6]/20 mb-4">
                Plan Beginner
              </div>
              <h1 className="text-4xl font-bold text-[#0F172A] mb-3">Perfecto para MYPES y Startups</h1>
              <p className="text-lg text-[#64748B] mb-6">Comienza a automatizar tu proceso de reclutamiento con IA</p>
              <div className="inline-block p-6 bg-gradient-to-br from-[#EBF0F7] to-[#DBEAFE] rounded-2xl border-2 border-[#3B82F6]/20">
                <div className="flex items-baseline gap-2 justify-center mb-2">
                  <span className="text-sm font-semibold text-[#64748B]">S/.</span>
                  <span className="text-5xl font-extrabold text-[#1B3A6B]">{pricePerMonth}</span>
                  <span className="text-lg text-[#64748B]">/mes</span>
                </div>
                {data.billingCycle === "yearly" && (
                  <p className="text-sm text-[#10B981] font-semibold">Facturado S/. {price} al año • Ahorras 20%</p>
                )}
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-6 text-center">Todo lo que incluye tu plan</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: <FileText className="w-5 h-5" />, title: `${selectedPlan.maxActiveJobs === -1 ? "Publicaciones ilimitadas" : `${selectedPlan.maxActiveJobs} Publicaciones Activas`}`, desc: "Publica vacantes simultáneas" },
                  { icon: <Bot className="w-5 h-5" />, title: "Agente Carlos (Screening)", desc: "Entrevistas automáticas de screening inicial" },
                  { icon: <Zap className="w-5 h-5" />, title: `${selectedPlan.maxInterviews === -1 ? "Entrevistas Ilimitadas" : `${selectedPlan.maxInterviews} Entrevistas IA/mes`}`, desc: "Evaluaciones por voz con IA" },
                  { icon: <Shield className="w-5 h-5" />, title: "Proctoring Básico", desc: "Verificación básica de identidad" },
                  { icon: <MessageCircle className="w-5 h-5" />, title: "Mensajería Ilimitada", desc: "Contacta candidatos sin límites" },
                  { icon: <FileText className="w-5 h-5" />, title: "Soporte por Email", desc: "Asistencia vía correo electrónico" },
                ].map((feature, i) => (
                  <div key={i} className="p-5 bg-white border border-[#E2E8F0] hover:border-[#3B82F6]/30 rounded-xl transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#EBF0F7] rounded-xl text-[#3B82F6] flex-shrink-0">{feature.icon}</div>
                      <div>
                        <p className="font-bold text-[#0F172A] mb-1">{feature.title}</p>
                        <p className="text-sm text-[#64748B]">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7] border-2 border-[#F59E0B]/20 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#F59E0B] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-[#0F172A] mb-2">Próximos pasos:</p>
                  <ol className="text-sm text-[#64748B] space-y-1 list-decimal list-inside">
                    <li>Configurar método de pago seguro</li>
                    <li>Seleccionar agente IA predeterminado</li>
                    <li>Acceder a tu panel de empresa</li>
                  </ol>
                </div>
              </div>
            </div>
            {paymentError && <Alert message={paymentError} />}
            <div className="flex gap-4">
              <button onClick={onBack} className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition">
                Volver a planes
              </button>
              <button onClick={handleContinue} disabled={isProcessing} className="flex-1 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E3A8A] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50">
                {isProcessing ? "Redirigiendo a MercadoPago..." : "Continuar al pago"}
              </button>
            </div>
          </div>
        </div>
      );

    case "PREMIUM":
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-10">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-[#0EA5A0] to-[#0d928d] rounded-2xl">
                    <Rocket className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Star className="w-8 h-8 text-[#F59E0B] fill-[#F59E0B]" />
                  </div>
                </div>
              </div>
              <div className="inline-block bg-[#0EA5A0]/20 text-[#0EA5A0] text-xs font-bold px-3 py-1 rounded-full border border-[#0EA5A0]/30 mb-4">
                Plan Profesional - Más Popular
              </div>
              <h1 className="text-4xl font-bold text-[#0F172A] mb-3">La Solución Completa de Reclutamiento IA</h1>
              <p className="text-lg text-[#64748B] mb-6">Todo lo que necesitas para optimizar tu proceso de selección</p>
              <div className="inline-block p-6 bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] rounded-2xl border-2 border-[#0EA5A0]/30">
                <div className="flex items-baseline gap-2 justify-center mb-2">
                  <span className="text-sm font-semibold text-[#64748B]">S/.</span>
                  <span className="text-5xl font-extrabold text-[#0EA5A0]">{pricePerMonth}</span>
                  <span className="text-lg text-[#64748B]">/mes</span>
                </div>
                {data.billingCycle === "yearly" && (
                  <p className="text-sm text-[#059669] font-semibold">Facturado S/. {price} al año • Ahorras 20%</p>
                )}
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 text-center">Acceso a los 4 Agentes IA</h2>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                {[
                  { name: "Carlos", role: "Screening", icon: <Brain className="w-8 h-8 text-[#1B3A6B]" />, color: "bg-[#DBEAFE]" },
                  { name: "Ana", role: "Teórica", icon: <GraduationCap className="w-8 h-8 text-[#7C3AED]" />, color: "bg-[#F3E8FF]" },
                  { name: "Diego", role: "Técnica", icon: <Code className="w-8 h-8 text-[#D97706]" />, color: "bg-[#FEF3C7]" },
                  { name: "Sofía", role: "Legal", icon: <Scale className="w-8 h-8 text-[#059669]" />, color: "bg-[#D1FAE5]" },
                ].map((agent, i) => (
                  <div key={i} className={`${agent.color} p-4 rounded-xl text-center border-0`}>
                    <div className="flex justify-center mb-2">{agent.icon}</div>
                    <p className="font-bold text-[#0F172A] mb-1">{agent.name}</p>
                    <p className="text-sm text-[#64748B]">{agent.role}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-6 text-center">Funcionalidades Premium Incluidas</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: <FileText className="w-5 h-5" />, title: `${selectedPlan.maxActiveJobs === -1 ? "Publicaciones Ilimitadas" : `${selectedPlan.maxActiveJobs} Publicaciones Activas`}`, desc: "Gestiona múltiples vacantes simultáneamente" },
                  { icon: <Bot className="w-5 h-5" />, title: "4 Agentes IA Completos", desc: "Carlos, Ana, Diego y Sofía a tu disposición" },
                  { icon: <Zap className="w-5 h-5" />, title: "Entrevistas Ilimitadas", desc: "Sin límites en evaluaciones con IA" },
                  { icon: <Shield className="w-5 h-5" />, title: "Proctoring Anti-fraude Avanzado", desc: "Máxima seguridad en entrevistas" },
                  { icon: <Video className="w-5 h-5" />, title: "Videos S3 Ilimitados", desc: "Descarga y almacenamiento sin límites" },
                  { icon: <TrendingUp className="w-5 h-5" />, title: "Reportes Ejecutivos IA", desc: "Analytics avanzados con inteligencia artificial" },
                ].map((feature, i) => (
                  <div key={i} className="p-5 bg-white border-2 border-[#0EA5A0]/20 hover:border-[#0EA5A0] rounded-xl transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-[#0EA5A0]/10 to-[#0EA5A0]/5 rounded-xl text-[#0EA5A0] flex-shrink-0">{feature.icon}</div>
                      <div className="flex-1">
                        <p className="font-bold text-[#0F172A] mb-1">{feature.title}</p>
                        <p className="text-sm text-[#64748B]">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#DBEAFE] to-[#EBF0F7] border-2 border-[#3B82F6]/20 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#0EA5A0] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-[#0F172A] mb-3">¿Por qué elegir el Plan Profesional?</p>
                  <ul className="text-sm text-[#64748B] space-y-2">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Acceso completo a todas las herramientas de IA sin restricciones</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Ahorra tiempo con evaluaciones automáticas ilimitadas</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Toma decisiones basadas en datos con reportes ejecutivos</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Gestiona múltiples procesos de selección simultáneamente</li>
                  </ul>
                </div>
              </div>
            </div>
            {paymentError && <Alert message={paymentError} />}
            <div className="flex gap-4">
              <button onClick={onBack} className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition">
                Volver a planes
              </button>
              <button onClick={handleContinue} disabled={isProcessing} className="flex-1 bg-gradient-to-r from-[#0EA5A0] to-[#0d928d] hover:from-[#0d928d] hover:to-[#0c8682] text-white font-semibold py-3 rounded-xl shadow-lg transition disabled:opacity-50">
                {isProcessing ? "Redirigiendo a MercadoPago..." : "Continuar al pago"}
              </button>
            </div>
          </div>
        </div>
      );

    case "ENTERPRISE":
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-10">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-2xl shadow-lg">
                    <Crown className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3">
                    <Star className="w-10 h-10 text-[#F59E0B]" />
                  </div>
                </div>
              </div>
              <div className="inline-block bg-gradient-to-r from-[#F59E0B]/10 to-[#D97706]/10 text-[#F59E0B] text-xs font-bold px-3 py-1 rounded-full border border-[#F59E0B]/20 mb-4">
                Plan Enterprise - Corporativo
              </div>
              <h1 className="text-4xl font-bold text-[#0F172A] mb-3">Solución Enterprise Premium</h1>
              <p className="text-lg text-[#64748B] mb-6">Para corporaciones que requieren máxima personalización y soporte dedicado</p>
              <div className="inline-block p-6 bg-gradient-to-br from-[#FFFBEB] to-[#FDE68A] rounded-2xl border-2 border-[#F59E0B]/30">
                <div className="flex items-baseline gap-2 justify-center mb-2">
                  <span className="text-sm font-semibold text-[#64748B]">S/.</span>
                  <span className="text-5xl font-extrabold text-[#F59E0B]">{pricePerMonth}</span>
                  <span className="text-lg text-[#64748B]">/mes</span>
                </div>
                {data.billingCycle === "yearly" && (
                  <p className="text-sm text-[#92400E] font-semibold">Facturado S/. {price} al año • Ahorras 20%</p>
                )}
                <div className="mt-2 bg-white/80 text-[#F59E0B] text-xs font-bold px-2 py-0.5 rounded-full inline-block">
                  Incluye todo del Plan Profesional
                </div>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-6 text-center">Funcionalidades Enterprise Exclusivas</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: <Star className="w-5 h-5" />, title: "Publicaciones Ilimitadas", desc: "Sin límites en vacantes activas" },
                  { icon: <Users className="w-5 h-5" />, title: "White-label Personalizado", desc: "Plataforma con tu marca corporativa" },
                  { icon: <TrendingUp className="w-5 h-5" />, title: "API Completa de Reportes", desc: "Integración total con tus sistemas" },
                  { icon: <Shield className="w-5 h-5" />, title: "Soporte 24/7 Prioritario", desc: "Asistencia inmediata en todo momento" },
                ].map((feature, i) => (
                  <div key={i} className="p-5 bg-gradient-to-br from-white to-[#FFFBEB] border-2 border-[#F59E0B]/20 hover:border-[#F59E0B] rounded-xl transition-all">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-xl text-white flex-shrink-0 shadow-md">{feature.icon}</div>
                      <div className="flex-1">
                        <p className="font-bold text-[#0F172A] mb-1 text-lg">{feature.title}</p>
                        <p className="text-sm text-[#64748B]">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#1B3A6B] to-[#0EA5A0] rounded-xl p-8 mb-8 text-white">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Shield className="w-12 h-12" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Soporte Premium 24/7</h3>
                  <p className="text-white/90 mb-4">Tu Account Manager dedicado y equipo de soporte disponible en todo momento.</p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span>Respuesta en menos de 1 hora</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>SLA Garantizado 99.9%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {paymentError && <Alert message={paymentError} />}
            <div className="flex gap-4">
              <button onClick={onBack} className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition">
                Volver a planes
              </button>
              <button onClick={handleContinue} disabled={isProcessing} className="flex-1 bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#F59E0B]/30 transition disabled:opacity-50">
                {isProcessing ? "Redirigiendo a MercadoPago..." : "Continuar al pago"}
              </button>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <p className="text-slate-600">Plan no reconocido</p>
          <button onClick={onBack} className="mt-4 text-teal-600 font-semibold">Volver</button>
        </div>
      );
  }
}