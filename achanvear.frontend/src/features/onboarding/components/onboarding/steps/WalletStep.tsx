//steps/WalletStep.tsx
"use client";

import { Gift, ShieldCheck, TrendingUp, CheckCircle2 } from "lucide-react";

interface WalletStepProps {
  onNext: () => void;
}

export function WalletStep({ onNext }: WalletStepProps) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full mx-auto">

      {/* ── Header ── */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[#1B3A6B] mb-1">Tu Billetera Achanvear</h1>
        <p className="text-sm text-slate-500">Recibe tus pagos de forma segura y transparente</p>
      </div>

      {/* ── Balance Card ── */}
      <div className="bg-gradient-to-br from-[#1B3A6B] to-[#0EA5A0] rounded-2xl px-6 py-8 mb-6 text-white flex flex-col items-center justify-center text-center min-h-[160px]">
        <p className="text-xs font-medium text-white/70 mb-1">Balance actual</p>
        <p className="text-5xl font-bold tracking-tight mb-5">S/. 0.00</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
          <Gift className="h-3.5 w-3.5" />
          Primer trabajo GRATIS
        </span>
      </div>

      {/* ── Features ── */}
      <div className="space-y-4 mb-6">

        {/* Primer trabajo gratis */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <Gift className="h-4.5 w-4.5 text-emerald-600" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Tu primer trabajo es 100% tuyo</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              No cobramos comisión en tu primer proyecto o servicio. Empieza a ganar sin costos adicionales.
            </p>
          </div>
        </div>

        {/* Escrow */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
            <ShieldCheck className="h-4.5 w-4.5 text-blue-600" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Pagos protegidos con Escrow</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              El dinero de la empresa está bloqueado en fideicomiso hasta que completes los hitos del proyecto. Tu trabajo está protegido.
            </p>
          </div>
        </div>

        {/* Comisiones */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <TrendingUp className="h-4.5 w-4.5 text-amber-600" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Comisiones justas y transparentes</p>
            <p className="text-xs text-slate-500 mt-0.5 mb-2 leading-relaxed">
              A partir del segundo trabajo, cobramos entre 3% y 5% según el monto:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                Menos de S/. 5,000: 5%
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                S/. 5,000 - S/. 15,000: 4%
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                Más de S/. 15,000: 3%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cómo funciona ── */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">¿Cómo funciona?</h3>
        <div className="space-y-2.5">
          {[
            { label: "Completa trabajos:", desc: "Ya sea proyectos freelance o servicios que ofrezcas" },
            { label: "Recibe pagos:", desc: "El dinero se libera automáticamente a tu wallet cuando la empresa apruebe" },
            { label: "Retira cuando quieras:", desc: "Transfiere a tu cuenta bancaria o Yape sin mínimos" },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0EA5A0]" strokeWidth={2} />
              <p className="text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-800">{label}</span>{" "}{desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <button
        type="button"
        onClick={onNext}
        className="w-full rounded-2xl bg-[#1B3A6B] py-3.5 text-sm font-semibold text-white hover:bg-[#16305a] transition-colors"
      >
        Ir a mi Dashboard
      </button>

      <p className="mt-3 text-center text-xs text-slate-400">
        Podrás ver tu wallet en cualquier momento desde el menú lateral
      </p>

    </div>
  );
}