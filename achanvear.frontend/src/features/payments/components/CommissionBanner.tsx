// features/payments/components/CommissionBanner.tsx
import { CheckCircle } from "lucide-react";

export function CommissionBanner() {
  return (
    <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-5 flex items-start gap-3">
      <div className="w-8 h-8 bg-[#0EA5A0] rounded-xl flex items-center justify-center flex-shrink-0">
        <CheckCircle className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#1B3A6B] mb-1">
          Tu primer proyecto fue GRATIS ✓
        </p>
        <p className="text-xs text-gray-600 mb-2">
          A partir del segundo proyecto o servicio, se aplica una comisión del 3% - 5% según el monto.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            Menos de S/. 5,000: 5%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5A0] flex-shrink-0" />
            S/. 5,000 - S/. 15,000: 4%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B3A6B] flex-shrink-0" />
            Más de S/. 15,000: 3%
          </span>
        </div>
      </div>
    </div>
  );
}