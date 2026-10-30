"use client";

import { X } from "lucide-react";

interface Props { open: boolean; onClose: () => void; }

export function AddPayoutMethodModal({ open, onClose }: Props) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div role="dialog" aria-modal="true" aria-labelledby="payout-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h2 id="payout-title" className="font-semibold">Tarjetas de retiro</h2>
        <button type="button" onClick={onClose} aria-label="Cerrar"><X className="h-5 w-5" /></button>
      </div>
      <p className="mt-4 text-sm text-slate-600">El registro de tarjetas de retiro está temporalmente deshabilitado. Te avisaremos cuando esté disponible el registro seguro con el proveedor.</p>
      <button type="button" onClick={onClose} className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-white">Entendido</button>
    </div>
  </div>;
}
