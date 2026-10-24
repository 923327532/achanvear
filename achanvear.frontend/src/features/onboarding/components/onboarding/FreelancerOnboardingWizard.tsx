"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { BrandLogo } from "@/shared/components/ui/BrandLogo";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";
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
  const { status, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    industry: "",
    speciality: "",
    biography: "",
    portfolioLinks: [],
    achievements: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const profileCreated = useRef(false);

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
      setSaveError(null);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSaveExperience = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await onboardingService.saveIndustry(onboardingData.industry);
      await onboardingService.saveSpecialty(onboardingData.speciality);
      handleNext();
    } catch (err: any) {
      setSaveError(err.message || "Error al guardar tu industria y especialidad");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      if (!profileCreated.current) {
        await onboardingService.createProfile({
          name: user?.fullName || "",
          industry: onboardingData.industry,
          specialty: onboardingData.speciality,
          profilePhotoUrl: null,
          biography: onboardingData.biography,
          achievements: onboardingData.achievements.join("\n"),
          address: "",
          paymentMethodType: "BANK_TRANSFER",
          dni: user?.dni || "",
          curriculumUrl: null,
          certifications: [],
        });
        profileCreated.current = true;
      }
      await onboardingService.personalizeProfile({
        profilePhotoUrl: null,
        biography: onboardingData.biography,
        portfolioLinks: onboardingData.portfolioLinks,
        achievements: onboardingData.achievements,
      });
      handleNext();
    } catch (err: any) {
      setSaveError(err.message || "Error al guardar tu perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalizeExperienceStep
            data={onboardingData}
            onUpdate={updateData}
            onNext={handleSaveExperience}
            onBack={handleBack}
            isLoading={isSaving}
            error={saveError}
          />
        );
      case 2:
        return (
          <CustomizeProfileStep
            data={onboardingData}
            onUpdate={updateData}
            onNext={handleSaveProfile}
            onBack={handleBack}
            isLoading={isSaving}
            error={saveError}
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
              <BrandLogo href={null} size="sm" textClassName="text-base font-bold text-[#1B3A6B]" />
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