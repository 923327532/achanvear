// src/features/onboarding/types/onboarding.types.ts

// ─── Freelancer ───────────────────────────────────────────────────────────────

export interface RegisterFormData {
  fullName: string;
  dni: string;
  email: string;
  password: string;
  confirmPassword?: string;
  passwordConfirmation?: string;
  phone?: string;
  acceptedTerms?: boolean;
}

export interface PortfolioLink {
  id: string;
  url: string;
}

export interface Achievement {
  id: string;
  description: string;
}

export interface OnboardingFormData {
  industry: string;
  specialty: string;
  profilePhoto?: File;
  bio: string;
  portfolioLinks: string[];
  achievements: string[];
}

// ─── Constantes para el onboarding ────────────────────────────────────────────

export const INDUSTRIES = [
  "Tecnología",
  "Marketing",
  "Diseño",
  "Legal",
  "Contabilidad",
  "Consultoría",
  "Salud",
  "Educación",
  "Construcción",
  "Logística",
];

export const SPECIALTIES: Record<string, string[]> = {
  "Tecnología": ["Desarrollo Web", "App Móvil", "DevOps", "Data Science", "Ciberseguridad", "Soporte Técnico"],
  "Marketing": ["SEO", "SEM", "Redes Sociales", "Content Marketing", "Email Marketing"],
  "Diseño": ["UX/UI", "Diseño Gráfico", "Ilustración", "Motion Graphics"],
  "Legal": ["Derecho Corporativo", "Derecho Laboral", "Propiedad Intelectual"],
  "Contabilidad": ["Contabilidad General", "Tributación", "Auditoría"],
  "Consultoría": ["Consultoría Estratégica", "Consultoría TI", "Consultoría RRHH"],
  "Salud": ["Medicina General", "Enfermería", "Psicología"],
  "Educación": ["Docencia", "Tutoría", "Capacitación Corporativa"],
  "Construcción": ["Arquitectura", "Ingeniería Civil", "Supervisión"],
  "Logística": ["Cadena de Suministro", "Transporte", "Almacenamiento"],
};

// ─── Company — movido desde features/company/types/company.ts ─────────────────

export interface CompanyOnboardingData {
  // Step 1: Create Account
  ruc: string;
  razonSocial: string;
  representanteLegal: string;
  representanteLegalDni: string;
  phone?: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  acceptTerms: boolean;
  // Step 2: Configure Company
  industry: string;
  // Step 3: Speciality
  speciality: string;
  // Step 4: Corporate Profile
  logoFile?: File;
  logoUrl?: string;
  companySize: string;
  description: string;
  address: string;
  // Step 5: Plan Selection
  selectedPlan: string;
  billingCycle: "monthly" | "yearly";
  // Step 6: Confirm Plan
  planConfirmed: boolean;
  // Step 7: Payment and Escrow
  paymentMethod: string;
  acceptEscrowTerms: boolean;
  // Step 8: AI Agent
  selectedAgent: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  yearlyPrice: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  maxActiveJobs: number;
  maxInterviews: number;
  availableAgents: string[];
  proctoringLevel: string;
  videoStorageDays: number;
  hasExecutiveReports: boolean;
  hasKanbanPipeline: boolean;
  hasWhiteLabel: boolean;
  hasReportsApi: boolean;
  hasAccountManager: boolean;
  supportLevel: string;
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  idealFor: string[];
  specialization: string;
}