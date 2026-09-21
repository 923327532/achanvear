// features/services/components/ServiceStatusBadge.tsx
import { CheckCircle, PauseCircle, FileText } from "lucide-react";
import type { ServiceStatus } from "../types/service.types";

interface Props {
  status: ServiceStatus;
}

const CONFIG: Record<ServiceStatus, { label: string; icon: React.ElementType; className: string }> = {
  ACTIVE: {
    label: "Activo",
    icon: CheckCircle,
    className: "text-emerald-600 bg-emerald-50 border border-emerald-200",
  },
  PAUSED: {
    label: "Pausado",
    icon: PauseCircle,
    className: "text-amber-600 bg-amber-50 border border-amber-200",
  },
  DRAFT: {
    label: "Borrador",
    icon: FileText,
    className: "text-gray-600 bg-gray-100 border border-gray-200",
  },
};

export function ServiceStatusBadge({ status }: Props) {
  const { label, icon: Icon, className } = CONFIG[status];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full text-xs px-2 py-0.5 font-medium ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}