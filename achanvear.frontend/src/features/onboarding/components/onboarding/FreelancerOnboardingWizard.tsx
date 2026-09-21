"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { PersonalizeExperienceStep } from "./steps/PersonalizeExperienceStep";
import { CustomizeProfileStep } from "./steps/CustomizeProfileStep";
import { WalletStep } from "./steps/WalletStep";

// CreateProfileStep ELIMINADO — el CV se sube desde Mi Perfil en el dashboard

type OnboardingData = {
  industry: string;
  speciality: string;
  photo?: File;
  biography: string;
  portfolioLinks: string[];
  achievements: string[];
};

const TOTAL_STEPS = 3;

export function FreelancerOnboardingWizard() {
  const { status } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    industry: "",
    speciality: "",
    biography: "",
    portfolioLinks: [],
    achievements: [],
  });

  useEffect(() => {
    if (status === "UNAUTHENTICATED") {
      window.location.href = "/register";
    }
  }, [status]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    } else {
      window.location.href = "/freelancer";
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalizeExperienceStep
            data={onboardingData}
            onUpdate={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <CustomizeProfileStep
            data={onboardingData}
            onUpdate={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return <WalletStep onNext={handleNext} />;
      default:
        return null;
    }
  };

  if (status === "PENDING") {
    return (
      <div className="grid min-h-screen place-items-center bg-[#EEF2F7]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3A6B] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2F7]">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B3A6B] text-sm font-bold text-white">
                A
              </div>
              <span className="text-base font-bold text-[#1B3A6B]">Achanvear</span>
            </div>
            <span className="text-sm text-slate-500">
              Paso {currentStep} de {TOTAL_STEPS}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200">
            <div
              className="h-1.5 rounded-full bg-[#0EA5A0] transition-all duration-300"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {renderStep()}
      </div>
    </div>
  );
}