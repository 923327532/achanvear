import { Button } from "@/components/ui/Button";
import { GOOGLE_AUTH_URL } from "@/lib/constants";

export function SocialAuthButtons() {
  return (
    <div className="flex flex-col gap-3">
      <a
        href={GOOGLE_AUTH_URL}
        className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
      >
        Iniciar con Google
      </a>
      <div className="relative text-center text-xs uppercase tracking-[0.22em] text-slate-400">
        <span className="relative bg-white px-3">o continuar con</span>
      </div>
    </div>
  );
}
