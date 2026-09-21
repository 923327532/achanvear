// features/settings/types/company-settings.types.ts
// Tipos específicos para la configuración de COMPANY

export type CompanySettingsSection =
  | "team"
  | "agent"
  | "billing"
  | "privacy"
  | "security"
  | "general";

export interface TeamMember {
  id: string;
  companyId: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  invitedAt: string;
}

export interface AgentOption {
  id: string;
  name: string;
  specialty: string;
  description: string;
  icon: string;
}

export interface PlanOption {
  planType: string;
  displayName: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxProjects: number;
  maxInvitesPerProject: number;
  benefits: string[];
  isPopular: boolean;
  isActive: boolean;
  description: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  savingsPercentage: number;
  isPopular: boolean;
  isActive: boolean;
}

export interface WalletInfo {
  id: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalSpent: number;
  currency: string;
  isActive: boolean;
}

export interface PaymentsOverview {
  publishedProjectsCount: number;
  remainingFreeProjects: number;
  canPublishMoreProjects: boolean;
  currentPlan: string;
  planExpirationDate: string;
  totalEarned: number;
  pendingRelease: number;
  availableForWithdrawal: number;
  totalCommissionsPaid: number;
  upgradeMessage: string;
}

export interface CompanyPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface PrivacySettings {
  incognitoMode: boolean;
  showContactInfo: boolean;
  showInDirectory: boolean;
  visibilityNotifications: boolean;
}
