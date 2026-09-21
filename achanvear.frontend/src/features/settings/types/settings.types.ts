// features/settings/types/settings.types.ts

export type AvailabilityStatus =
  | "LOOKING_FOR_JOB"
  | "FREELANCE_ONLY"
  | "OPEN_TO_OFFERS"
  | "NOT_AVAILABLE";

export const AVAILABILITY_CONFIG: Record<
  AvailabilityStatus,
  { label: string; description: string }
> = {
  LOOKING_FOR_JOB:  { label: "Buscando empleo activamente", description: "Visible para todas las empresas" },
  FREELANCE_ONLY:   { label: "Solo proyectos freelance",     description: "No recibir vacantes permanentes" },
  OPEN_TO_OFFERS:   { label: "Abierto a ofertas",            description: "Recibir todo tipo de oportunidades" },
  NOT_AVAILABLE:    { label: "No disponible",                description: "No aparezco en búsquedas" },
};

export type PreferredCurrency = "PEN" | "USD";

export type PaymentMethodType = "CCI" | "YAPE" | "PLIN" | "PAYPAL";

export const PAYMENT_METHOD_CONFIG: Record<
  PaymentMethodType,
  { label: string; icon: string }
> = {
  CCI:    { label: "Cuenta Bancaria (CCI)", icon: "bank" },
  YAPE:   { label: "Yape",                  icon: "zap" },
  PLIN:   { label: "Plin",                  icon: "zap" },
  PAYPAL: { label: "PayPal",                icon: "globe" },
};

export interface CommissionRecord {
  date: string;
  project: string;
  grossAmount: number;
  commissionPct: number;
  netAmount: number;
}

export type IntegrityStatus = "SIN_SANCIONES" | "ADVERTENCIA" | "SUSPENDIDO";

export interface IntegrityRecord {
  id: string;
  description: string;
  date: string;
  status: IntegrityStatus;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  location: string;
  lastActivity: string;
  isCurrent: boolean;
}

export type SettingsSection =
  | "work"
  | "finances"
  | "security"
  | "notifications"
  | "general";