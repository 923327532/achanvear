"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";
import { setAuthToken } from "@/lib/storage";
import {
  RegisterFormData,
  INDUSTRIES,
  SPECIALTIES,
  PortfolioLink,
  Achievement,
} from "@/features/onboarding/types/onboarding.types";
import { StepCreateAccount } from "./StepCreateAccount";
import { StepIndustry } from "./StepIndustry";
import { StepSpecialty } from "./StepSpecialty";
import { StepCreateProfile } from "./StepCreateProfile";
import { StepPersonalizeProfile } from "./StepPersonalizeProfile";
import { StepWallet } from "./StepWallet";

type OnboardingStep = 
  | "register"
  | "industry" 
  | "specialty"
  | "createProfile"
  | "personalizeProfile"
  | "wallet";

const STEP_ORDER: OnboardingStep[] = [
  "register",
  "industry",
  "specialty",
  "createProfile",
  "personalizeProfile",
  "wallet",
];

const STEP_COUNT = STEP_ORDER.length;

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("register");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store data across steps
  const [userData, setUserData] = useState<{
    id: string;
    email: string;
    fullName: string;
    dni: string;
  } | null>(null);

  const [industry, setIndustry] = useState<string>("");
  const [specialty, setSpecialty] = useState<string>("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [biography, setBiography] = useState<string>("");
  const [portfolioLinks, setPortfolioLinks] = useState<PortfolioLink[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const progressPercent = ((currentIndex) / (STEP_COUNT - 1)) * 100;

  const goToStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
    setError(null);
  }, []);

  const goNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < STEP_COUNT) {
      goToStep(STEP_ORDER[nextIndex]);
    }
  }, [currentIndex, goToStep]);

  const goBack = useCallback(() => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      goToStep(STEP_ORDER[prevIndex]);
    }
  }, [currentIndex, goToStep]);

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await onboardingService.register(data);
      const loginResult = await onboardingService.loginAfterRegister(
        data.email,
        data.password
      );
      setAuthToken(loginResult.accessToken);
      setUserData({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        dni: user.dni,
      });
      goNext();
    } catch (err: any) {
      setError(err.message || "Error al crear cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndustry = async () => {
    if (!industry) {
      setError("Selecciona una industria");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onboardingService.saveIndustry(industry);
      goNext();
    } catch (err: any) {
      setError(err.message || "Error al guardar industria");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpecialty = async () => {
    if (!specialty) {
      setError("Selecciona una especialidad");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onboardingService.saveSpecialty(specialty);
      goNext();
    } catch (err: any) {
      setError(err.message || "Error al guardar especialidad");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProfile = async (curriculumFile: File | null) => {
    setIsLoading(true);
    setError(null);
    try {
      await onboardingService.createProfile({
        name: userData?.fullName || "",
        industry,
        specialty,
        profilePhotoUrl,
        biography,
        achievements: achievements.map((a) => a.description).join("\n"),
        address: "",
        paymentMethodType: "BANK_TRANSFER",
        dni: userData?.dni || "",
        curriculumUrl: null,
        certifications: [],
      });
      goNext();
    } catch (err: any) {
      setError(err.message || "Error al crear perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalizeProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onboardingService.personalizeProfile({
        profilePhotoUrl,
        biography,
        portfolioLinks: portfolioLinks.map((p) => p.url),
        achievements: achievements.map((a) => a.description),
      });
      goNext();
    } catch (err: any) {
      setError(err.message || "Error al guardar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishOnboarding = () => {
    window.location.href = "/freelancer";
  };

  const renderStep = () => {
    switch (currentStep) {
      case "register":
        return (
          <StepCreateAccount
            onSubmit={handleRegister}
            isLoading={isLoading}
            error={error}
            onClearError={() => setError(null)}
          />
        );
      case "industry":
        return (
          <StepIndustry
            selected={industry}
            onSelect={setIndustry}
            onContinue={handleIndustry}
            onBack={goBack}
            isLoading={isLoading}
            error={error}
          />
        );
      case "specialty":
        return (
          <StepSpecialty
            industry={industry}
            selected={specialty}
            onSelect={setSpecialty}
            onContinue={handleSpecialty}
            onBack={goBack}
            isLoading={isLoading}
            error={error}
          />
        );
      case "createProfile":
        return (
          <StepCreateProfile
            onContinue={handleCreateProfile}
            onBack={goBack}
            isLoading={isLoading}
            error={error}
          />
        );
      case "personalizeProfile":
        return (
          <StepPersonalizeProfile
            profilePhotoUrl={profilePhotoUrl}
            onProfilePhotoChange={setProfilePhotoUrl}
            biography={biography}
            onBiographyChange={setBiography}
            portfolioLinks={portfolioLinks}
            onPortfolioLinksChange={setPortfolioLinks}
            achievements={achievements}
            onAchievementsChange={setAchievements}
            onContinue={handlePersonalizeProfile}
            onBack={goBack}
            isLoading={isLoading}
            error={error}
          />
        );
      case "wallet":
        return (
          <StepWallet
            onFinish={handleFinishOnboarding}
            userName={userData?.fullName || ""}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Achanvear
          </h1>
        </div>
        <div className="mb-8">
          <div className="flex items-center gap-2">
            {STEP_ORDER.slice(0, -1).map((_, index) => (
              <div key={index} className="flex items-center gap-2 flex-1">
                <div
                  className={`h-2 w-2 rounded-full transition-all ${
                    index <= currentIndex
                      ? "bg-slate-900"
                      : "bg-slate-200"
                  }`}
                />
                {index < STEP_ORDER.length - 2 && (
                  <div className="flex-1 h-0.5 bg-slate-200">
                    <div
                      className="h-full bg-slate-900 transition-all"
                      style={{
                        width: index < currentIndex ? "100%" : "0%",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1">{renderStep()}</div>
      </div>
    </div>
  );
}