// features/services/types/service.types.ts

export type ServiceStatus = "ACTIVE" | "PAUSED" | "DRAFT";

export type ServiceCategory =
  | "TECHNOLOGY"
  | "MARKETING"
  | "DESIGN"
  | "LEGAL"
  | "ACCOUNTING"
  | "CONSULTING"
  | "HEALTH"
  | "EDUCATION"
  | "CONSTRUCTION"
  | "LOGISTICS";

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  TECHNOLOGY: "Tecnología",
  MARKETING: "Marketing",
  DESIGN: "Diseño",
  LEGAL: "Legal",
  ACCOUNTING: "Contabilidad",
  CONSULTING: "Consultoría",
  HEALTH: "Salud y Bienestar",
  EDUCATION: "Educación",
  CONSTRUCTION: "Construcción",
  LOGISTICS: "Logística",
};

export const CATEGORY_COLORS: Record<ServiceCategory, string> = {
  TECHNOLOGY: "text-blue-600 bg-blue-50",
  MARKETING: "text-orange-600 bg-orange-50",
  DESIGN: "text-purple-600 bg-purple-50",
  LEGAL: "text-gray-600 bg-gray-100",
  ACCOUNTING: "text-violet-600 bg-violet-50",
  CONSULTING: "text-pink-600 bg-pink-50",
  HEALTH: "text-green-600 bg-green-50",
  EDUCATION: "text-yellow-600 bg-yellow-50",
  CONSTRUCTION: "text-amber-600 bg-amber-50",
  LOGISTICS: "text-cyan-600 bg-cyan-50",
};

export type Modality = "PRESENTIAL" | "REMOTE" | "HYBRID";
export type CoverageType = "LOCAL" | "NATIONAL" | "INTERNATIONAL";
export type BillingType = "PER_HOUR" | "PER_DAY" | "PER_PROJECT" | "MONTHLY" | "CUSTOM";

// ─── Core model ───────────────────────────────────────────────────────────────

export interface Service {
  id: string;
  title: string;
  shortDescription?: string;
  description: string;
  category: ServiceCategory;
  subcategory?: string;
  tags: string[];
  status: ServiceStatus;
  basePrice: number;
  deliveryDays: number;
  views: number;
  sales: number;
  rating: number;
  reviewCount: number;
  imageUrls: string[];
  videoUrls: string[];
  pdfUrls: string[];
  certificateUrls: string[];
  modality?: string;
  coverageType?: string;
  coverageDetails?: string;
  schedule?: string;
  billingType?: string;
  currency?: string;
  whatsapp?: string;
  phone?: string;
  emailContact?: string;
  faqs?: string;
  warrantyInfo?: string;
  cancellationPolicy?: string;
  supportInfo?: string;
  responseTime?: string;
  isFeatured?: boolean;
  isPremium?: boolean;
  isAvailable?: boolean;
  availableImmediately?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Solo servicios de explorar (de otros profesionales)
export interface ExploreService extends Service {
  freelancer: FreelancerInfo;
}

export interface FreelancerInfo {
  id: string;
  name: string;
  title: string;
  avatarUrl?: string;
  verified: boolean;
  phone?: string;
  whatsapp?: string;
}

// ─── Service Detail (con planes) ──────────────────────────────────────────────

export interface ServiceDetail extends Service {
  freelancerUserId: string;
  plans: ServicePlan[];
}

export interface ServicePlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  deliveryDays?: number;
  features: string[];
  isActive: boolean;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface ServiceStats {
  activeServices: number;
  totalSales: number;
  averageRating: number;
  totalViews: number;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedServices {
  items: ExploreService[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// ─── Form ─────────────────────────────────────────────────────────────────────

export interface ServicePlanFormData {
  name: string;
  description: string;
  price: number | "";
  deliveryDays: number | "";
  features: string[];
}

export interface ServiceFormData {
  // Paso 1: Info General
  title: string;
  shortDescription: string;
  category: ServiceCategory | "";
  subcategory: string;
  tags: string[];
  description: string;

  // Paso 2: Detalles
  modality: Modality | "";
  coverageType: CoverageType | "";
  coverageDetails: string;
  schedule: string;
  deliveryDays: number | "";
  availableImmediately: boolean;

  // Paso 3: Precios
  basePrice: number | "";
  billingType: BillingType | "";
  currency: string;
  plans: ServicePlanFormData[];

  // Paso 4: Contacto
  whatsapp: string;
  phone: string;
  emailContact: string;
  responseTime: string;

  // Paso 5: Multimedia
  imageUrls: string[];
  videoUrls: string[];
  pdfUrls: string[];
  certificateUrls: string[];

  // Paso 6: Extras
  faqs: string;
  warrantyInfo: string;
  cancellationPolicy: string;
  supportInfo: string;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface ServiceFilters {
  search: string;
  category: ServiceCategory | "ALL";
  page: number;
  size: number;
}
