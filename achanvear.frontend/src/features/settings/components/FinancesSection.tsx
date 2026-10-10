// features/settings/components/FinancesSection.tsx
"use client";

import { useState } from "react";
import { CreditCard, Loader2, Plus, Trash2, Star, Check, MoreHorizontal, ShieldCheck } from "lucide-react";
import { useCommissions, useUpdateFinances } from "../hooks/useSettings";
import {
  usePayoutMethods,
  useRemovePayoutMethod,
  useSetDefaultPayoutMethod,
} from "@/features/payments/hooks/usePayments";
import { AddPayoutMethodModal } from "@/features/payments/components/AddPayoutMethodModal";
import type { PreferredCurrency } from "../types/settings.types";
import type { PayoutMethod } from "@/features/payments/types/payments.types";

interface Props {
  profile: any; // idealmente tipar con SettingsProfile exportado de settingsApi
}

const cardThemes = [
  { match: ["VISA"], bg: "from-[#003b80] via-[#0066b3] to-[#0ea5a0]", chip: "bg-slate-100/90", brand: "VISA" },
  { match: ["MASTERCARD"], bg: "from-[#151515] via-[#313131] to-[#d97706]", chip: "bg-amber-100/90", brand: "MC" },
  { match: ["AMEX", "AMERICAN"], bg: "from-[#0f766e] via-[#0891b2] to-[#67e8f9]", chip: "bg-cyan-100/90", brand: "AMEX" },
];

function getCardTheme(method: PayoutMethod) {
  const source = `${method.cardBrand ?? ""} ${method.maskedCard ?? ""}`.toUpperCase();
  return cardThemes.find((theme) => theme.match.some((term) => source.includes(term))) ?? cardThemes[0];
}

function PayoutCard({
  method,
  menuOpen,
  onToggleMenu,
  onSetDefault,
  onRemove,
}: {
  method: PayoutMethod;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onSetDefault: () => void;
  onRemove: () => void;
}) {
  const theme = getCardTheme(method);

  return (
    <div className="relative min-w-0">
      {/* RESPONSIVE: min-h-[11.5rem]. Con overflow-hidden la proporción 1.586:1 no deja crecer la tarjeta,
          y a 284px (~147px de alto) el contenido se recortaba. */}
      <div className={`relative min-h-[11.5rem] aspect-[1.586/1] overflow-hidden rounded-xl bg-gradient-to-br ${theme.bg} p-4 text-white shadow-lg shadow-slate-200`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-1/2 top-0 h-full w-1/2 bg-white/20" />
          <div className="absolute bottom-0 left-0 h-1/3 w-full bg-black/15" />
          <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        </div>
        <div className="relative flex h-full flex-col justify-between">
          {/* RESPONSIVE: pr-10 para que "Principal" no quede debajo del botón de tres puntos */}
          <div className="flex items-start justify-between gap-3 pr-10">
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-wide">Tarjeta de retiro</p>
              <p className="mt-1 truncate text-xs text-white/75">{method.provider || "Izipay Dispersion"}</p>
            </div>
            {method.isDefault && (
              <span className="flex-shrink-0 rounded-full bg-white/18 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                Principal
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className={`h-7 w-9 rounded-md ${theme.chip} shadow-inner`}>
              <div className="grid h-full grid-cols-2 grid-rows-2 gap-px p-1">
                <span className="rounded-sm bg-slate-300/80" />
                <span className="rounded-sm bg-slate-400/70" />
                <span className="rounded-sm bg-slate-400/70" />
                <span className="rounded-sm bg-slate-300/80" />
              </div>
            </div>
            {/* RESPONSIVE: más chico y con menos espaciado de letras en celular; a 284px el número
                completo (22 caracteres) no cabía en el ancho de la tarjeta */}
            <p className="whitespace-nowrap font-mono text-xs tracking-[0.08em] text-white drop-shadow-sm sm:text-sm sm:tracking-[0.12em]">
              4000  1234  5678  {method.lastFourDigits || "****"}
            </p>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/65">Titular</p>
              <p className="truncate font-mono text-xs uppercase tracking-[0.12em]">
                {method.accountHolderName || "Profesional"}
              </p>
            </div>
            <p className="flex-shrink-0 text-xl font-black italic tracking-tight">{theme.brand}</p>
          </div>
        </div>
      </div>

      <div className="absolute right-3 top-3">
        <button
          onClick={onToggleMenu}
          aria-label="Opciones de la tarjeta"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={onToggleMenu} />
            <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-slate-100 bg-white py-1 shadow-xl">
              {!method.isDefault && (
                <button
                  onClick={onSetDefault}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <Star className="h-4 w-4 text-amber-400" />
                  Establecer principal
                </button>
              )}
              <button
                onClick={onRemove}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar metodo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function FinancesSection({ profile }: Props) {
  const [currency, setCurrency] = useState<PreferredCurrency>(
    (profile?.preferredCurrency as PreferredCurrency) ?? "PEN"
  );
  const [saved, setSaved] = useState(false);
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { commissions, isLoading: loadingCommissions } = useCommissions();
  const { updateAsync: updateFinances, isLoading: isSaving } = useUpdateFinances(profile);
  const { methods, isLoading: loadingMethods } = usePayoutMethods();
  const { removeAsync } = useRemovePayoutMethod();
  const { setDefaultAsync } = useSetDefaultPayoutMethod();

  const handleSave = async () => {
    await updateFinances({ preferredCurrency: currency });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemove = async (id: string) => {
    await removeAsync(id);
    setOpenMenuId(null);
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAsync(id);
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* RESPONSIVE: p-4 en celular, p-6 desde sm (en las 4 tarjetas de sección) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#1B3A6B]">Finanzas y Pagos</h2>
            <p className="mt-1 text-sm text-slate-500">
              Configura moneda, tarjetas de retiro y revisa la comision de la plataforma.
            </p>
          </div>
          <div className="inline-flex flex-shrink-0 items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Escrow con comision 5%
          </div>
        </div>
      </div>

      {/* Moneda preferida */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Moneda Preferida</label>
        <div className="flex flex-wrap items-center gap-3">
          {(["PEN", "USD"] as PreferredCurrency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                currency === c
                  ? "border-[#0EA5A0] bg-teal-50 text-[#1B3A6B]"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {c === "PEN" ? "S/. Soles" : "$ Dólares"}
            </button>
          ))}
        </div>
      </div>

      {/* Método de retiro */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {/* RESPONSIVE: flex-wrap; el botón "Agregar tarjeta" baja de línea en vez de comprimir el texto */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <label className="block text-sm font-semibold text-gray-700">Método de retiro</label>
            <p className="text-xs text-gray-400 mt-0.5">
              Configura la tarjeta donde recibirás tus ganancias cuando solicites un retiro.
            </p>
          </div>
          <button
            onClick={() => setMethodModalOpen(true)}
            className="flex flex-shrink-0 items-center gap-1.5 text-xs font-semibold text-white bg-[#1B3A6B] px-3.5 py-2 rounded-xl hover:bg-[#0EA5A0] transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar tarjeta
          </button>
        </div>

        {loadingMethods ? (
          <div className="text-center py-6">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
          </div>
        ) : methods.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
            <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aún no tienes un método de retiro.</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Agrega una tarjeta para poder retirar tus ganancias desde tu sección de Pagos.
            </p>
          </div>
        ) : (
          // RESPONSIVE: con el menú lateral de Configuración al lado (desde lg) el contenido mide ~450px, así que
          // las tarjetas pasan a 2 columnas solo desde xl y a 3 desde 2xl. Entre md y lg (pantalla completa) siguen en 2.
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
            {methods.map((m) => (
              <PayoutCard
                key={m.id}
                method={m}
                menuOpen={openMenuId === m.id}
                onToggleMenu={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                onSetDefault={() => handleSetDefault(m.id)}
                onRemove={() => handleRemove(m.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Historial de comisiones */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Historial de Comisiones (5%)
        </label>
        {/* RESPONSIVE: la tabla se muestra SIEMPRE con sus 5 columnas. En pantallas angostas se desplaza
            horizontalmente dentro de su recuadro (min-w-[560px]) en vez de recortarse (antes overflow-hidden). */}
        <div className="rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Fecha</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Proyecto</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Monto Bruto</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Comisión 5%</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Monto Neto</th>
              </tr>
            </thead>
            <tbody>
              {loadingCommissions ? (
                <tr>
                  <td colSpan={5} className="text-center py-6">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : commissions.map((c, i) => (
                <tr key={i} className="border-t border-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{c.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{c.project}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">
                    S/. {c.grossAmount.toLocaleString("es-PE")}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-500 text-right whitespace-nowrap">
                    -S/. {(c.grossAmount * 0.05).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#0EA5A0] text-right whitespace-nowrap">
                    S/. {c.netAmount.toLocaleString("es-PE")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      {/* RESPONSIVE: botones apilados a ancho completo en celular (Guardar arriba), en fila a la derecha desde sm */}
      <div className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-end">
        <button className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex w-full sm:w-auto items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1B3A6B] px-5 py-2.5 rounded-xl hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
          {saved ? "Guardado" : "Guardar Cambios"}
        </button>
      </div>

      <AddPayoutMethodModal open={methodModalOpen} onClose={() => setMethodModalOpen(false)} />
    </div>
  );
}