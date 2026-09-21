"use client";

interface StepWalletProps {
  onFinish: () => void;
  userName: string;
}

export function StepWallet({ onFinish, userName }: StepWalletProps) {
  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          Tu Billetera Achanvear
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Recibe tus pagos de forma segura y transparente
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-xs font-medium text-slate-500">Balance actual</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">S/. 0.00</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">
            Primer trabajo GRATIS
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            Tu primer trabajo es 100% tuyo. No cobramos comision en tu primer
            proyecto o servicio. Empieza a ganar sin costos adicionales.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">
            Pagos protegidos con Escrow
          </p>
          <p className="mt-1 text-xs text-slate-500">
            El dinero de la empresa esta bloqueado en fideicomiso hasta que
            completes los hitos del proyecto. Tu trabajo esta protegido.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">
            Comisiones justas y transparentes
          </p>
          <p className="mt-1 text-xs text-slate-500">
            A partir del segundo trabajo, cobramos entre 3% y 5% segun el
            monto:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-500">
            <li>Menos de S/. 5,000: 5%</li>
            <li>S/. 5,000 - S/. 15,000: 4%</li>
            <li>Mas de S/. 15,000: 3%</li>
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">
            Como funciona?
          </p>
          <ul className="mt-2 space-y-2 text-xs text-slate-500">
            <li>
              Completa trabajos: Ya sea proyectos freelance o servicios que
              ofrezcas
            </li>
            <li>
              Recibe pagos: El dinero se libera automaticamente a tu wallet
              cuando la empresa apruebe
            </li>
            <li>
              Retira cuando quieras: Transfiere a tu cuenta bancaria o Yape sin
              minimos
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={onFinish}
          className="w-full rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Ir a mi Dashboard
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">
          Podras ver tu wallet en cualquier momento desde el menu lateral
        </p>
      </div>
    </div>
  );
}