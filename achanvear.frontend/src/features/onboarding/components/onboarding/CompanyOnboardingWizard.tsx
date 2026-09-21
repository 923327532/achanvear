// src/features/onboarding/components/CompanyOnboardingWizard.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Alert } from "@/components/ui/Alert";
import type { CompanyOnboardingData } from "@/features/onboarding/types/onboarding.types";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";
import { ConfigureCompanyStep } from "./steps/company/ConfigureCompanyStep";
import { CompanySpecialityStep } from "./steps/company/CompanySpecialityStep";
import { CorporateProfileStep } from "./steps/company/CorporateProfileStep";
import { PlanSelectionStep } from "./steps/company/PlanSelectionStep";
import { PlanSummaryStep } from "./steps/company/PlanSummaryStep";
import { PaymentEscrowStep } from "./steps/company/PaymentEscrowStep";
import { AIAgentStep } from "./steps/company/AIAgentStep";
import axios from "axios";

const COMPANY_ID_KEY = "company_onboarding_id";

export function CompanyOnboardingWizard() {
  const router = useRouter();
  const { user, status } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(COMPANY_ID_KEY);
    }
    return null;
  });
  const [isInitializing, setIsInitializing] = useState(true);

  const getSavedData = (): Partial<CompanyOnboardingData> => {
    try {
      const saved = sessionStorage.getItem("company_onboarding_data");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const [onboardingData, setOnboardingData] = useState<CompanyOnboardingData>(() => {
    const saved = getSavedData();
    return {
      ruc: user?.ruc || saved.ruc || "",
      razonSocial: user?.representanteLegal || saved.razonSocial || "",
      representanteLegal: user?.representanteLegal || saved.representanteLegal || "",
      representanteLegalDni: user?.representanteDni || saved.representanteLegalDni || "",
      email: user?.email || saved.email || "",
      password: "",
      passwordConfirmation: "",
      acceptTerms: false,
      industry: "",
      speciality: "",
      logoFile: undefined,
      logoUrl: "",
      companySize: "",
      description: "",
      address: "",
      selectedPlan: "free",
      billingCycle: "monthly",
      planConfirmed: false,
      paymentMethod: "",
      acceptEscrowTerms: false,
      selectedAgent: "",
    };
  });

  const updateData = (updates: Partial<CompanyOnboardingData>) => {
    setOnboardingData((prev) => {
      const next = { ...prev, ...updates };
      sessionStorage.setItem("company_onboarding_data", JSON.stringify(next));
      return next;
    });
  };

  const totalSteps = 7;

  useEffect(() => {
    if (status === "PENDING") return;

    const init = async () => {
      setIsInitializing(true);

      if (status !== "AUTHENTICATED" || !user) {
        router.push("/register");
        return;
      }

      const savedData = getSavedData();

      setOnboardingData((prev) => ({
        ...prev,
        email: user.email || prev.email,
        ruc: savedData.ruc || prev.ruc,
        razonSocial: savedData.razonSocial || prev.razonSocial,
        representanteLegal: savedData.representanteLegal || prev.representanteLegal,
        representanteLegalDni: savedData.representanteLegalDni || prev.representanteLegalDni,
      }));

      // Verificar si ya tiene una compañía creada (para continuar onboarding)
      try {
        const existingCompany = await onboardingService.getCompanyProfile();
        if (existingCompany?.id) {
          setCompanyId(existingCompany.id);
          sessionStorage.setItem(COMPANY_ID_KEY, existingCompany.id);
        }
      } catch {
        // No tiene compañía aún
      }

      setIsInitializing(false);
    };

    init();
  }, [user, status]);

  /**
   * Maneja el avance entre pasos, guardando en backend cada paso.
   */
  const handleNext = async () => {
    setSubmitError(null);

    try {
      switch (currentStep) {
        case 1: {
          // PASO 1: Inicializar compañía en backend
          const companySizeMap: Record<string, string> = {
            micro: "MICROENTERPRISE", MICRO: "MICROENTERPRISE",
            small: "SMALL_BUSINESS",  SMALL: "SMALL_BUSINESS",
            medium: "MEDIUM_BUSINESS", MEDIUM: "MEDIUM_BUSINESS",
            large: "LARGE_ENTERPRISE", LARGE: "LARGE_ENTERPRISE",
            MICROENTERPRISE: "MICROENTERPRISE",
            SMALL_BUSINESS: "SMALL_BUSINESS",
            MEDIUM_BUSINESS: "MEDIUM_BUSINESS",
            LARGE_ENTERPRISE: "LARGE_ENTERPRISE",
          };

          const response = await onboardingService.initCompany({
            businessName: onboardingData.razonSocial.trim(),
            legalName: onboardingData.representanteLegal.trim(),
            representativeDni: onboardingData.representanteLegalDni,
            ruc: onboardingData.ruc?.trim() || undefined,
            industry: onboardingData.industry,
          });
          setCompanyId(response.id);
          sessionStorage.setItem(COMPANY_ID_KEY, response.id);
          break;
        }
        case 2: {
          // PASO 2: Guardar industria
          await onboardingService.saveCompanyIndustry(onboardingData.industry);
          break;
        }
        case 3: {
          // PASO 3: Guardar especialidad
          await onboardingService.saveCompanySpecialty(onboardingData.speciality);
          break;
        }
        case 4: {
          // PASO 4: Guardar perfil corporativo
          const companySizeMap: Record<string, string> = {
            micro: "MICROENTERPRISE", MICRO: "MICROENTERPRISE",
            small: "SMALL_BUSINESS",  SMALL: "SMALL_BUSINESS",
            medium: "MEDIUM_BUSINESS", MEDIUM: "MEDIUM_BUSINESS",
            large: "LARGE_ENTERPRISE", LARGE: "LARGE_ENTERPRISE",
            MICROENTERPRISE: "MICROENTERPRISE",
            SMALL_BUSINESS: "SMALL_BUSINESS",
            MEDIUM_BUSINESS: "MEDIUM_BUSINESS",
            LARGE_ENTERPRISE: "LARGE_ENTERPRISE",
          };

          // Subir logo a través del backend (evita CORS de S3)
          let logoUrl = onboardingData.logoUrl;
          if (onboardingData.logoFile) {
            try {
              const { publicFileUrl } = await onboardingService.uploadFile("PROFILE_PHOTO", onboardingData.logoFile);
              logoUrl = publicFileUrl;
              // Actualizar el estado con la URL del logo
              updateData({ logoUrl: publicFileUrl });
            } catch (uploadErr) {
              console.error("Error al subir logo:", uploadErr);
              // Continuamos aunque falle la subida del logo
            }
          }

          await onboardingService.saveCorporateProfile({
            companySize: companySizeMap[onboardingData.companySize] || "SMALL_BUSINESS",
            biography: onboardingData.description,
            address: onboardingData.address,
            logoUrl: logoUrl || undefined,
          });
          break;
        }
        case 5: {
          // PASO 5: Guardar plan
          // Mapear IDs del frontend a valores del enum CompanyPlan del backend
          const planMap: Record<string, string> = {
            free: "FREE", FREE: "FREE",
            basic: "PYME_STARTUP", BASIC: "PYME_STARTUP",
            premium: "PROFESSIONAL", PREMIUM: "PROFESSIONAL",
            enterprise: "CORPORATE", ENTERPRISE: "CORPORATE",
          };
          await onboardingService.selectPlan(planMap[onboardingData.selectedPlan] || "FREE");
          break;
        }
        case 6: {
          // PASO 6: Guardar método de pago
          const paymentMap: Record<string, string> = {
            bank_transfer: "BANK_TRANSFER", credit_card: "CREDIT_CARD", debit_card: "DEBIT_CARD",
            yape: "YAPE", plin: "PLIN",
          };
          await onboardingService.savePaymentMethod(paymentMap[onboardingData.paymentMethod] || "BANK_TRANSFER");
          break;
        }
        case 7: {
          // PASO 7: Finalizar onboarding
          await onboardingService.completeOnboarding({});
          sessionStorage.removeItem("company_onboarding_data");
          sessionStorage.removeItem(COMPANY_ID_KEY);
          router.push("/company");
          return;
        }
      }

      // Avanzar al siguiente paso
      setCurrentStep((prev) => prev + 1);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al guardar datos");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  if (isInitializing || status === "PENDING") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-900 border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-slate-500">Preparando tu espacio...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <ConfigureCompanyStep data={onboardingData} onUpdate={updateData} onNext={handleNext} onBack={handleBack} />;
      case 2: return <CompanySpecialityStep data={onboardingData} onUpdate={updateData} onNext={handleNext} onBack={handleBack} />;
      case 3: return <CorporateProfileStep data={onboardingData} onUpdate={updateData} onNext={handleNext} onBack={handleBack} />;
      case 4: return <PlanSelectionStep data={onboardingData} onUpdate={updateData} onNext={handleNext} onBack={handleBack} />;
      case 5: return <PlanSummaryStep data={onboardingData} onUpdate={updateData} onNext={handleNext} onBack={handleBack} />;
      case 6: return <PaymentEscrowStep data={onboardingData} onUpdate={updateData} onNext={handleNext} onBack={handleBack} />;
      case 7: return <AIAgentStep data={onboardingData} onUpdate={updateData} onNext={handleNext} onBack={handleBack} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-teal-600 text-white font-bold text-lg">
                A
              </div>
              <span className="text-xl font-bold text-blue-900">Achanvear</span>
            </div>
            <div className="text-sm text-slate-600">
              Paso {currentStep} de {totalSteps}
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-900 to-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>
      <div className={`mx-auto py-12 sm:px-6 lg:px-8 ${
        currentStep === 4 
          ? "w-full max-w-full px-0" 
          : currentStep === 5 || currentStep === 6
          ? "max-w-7xl px-4" 
          : "max-w-4xl px-4"
      }`}>
        {submitError && <Alert message={submitError} />}
        {renderStep()}
      </div>
    </div>
  );
}
