// shared/components/ui/Input.tsx
"use client";

import { InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className = "", type, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <label className="mb-4 block text-sm font-medium text-slate-700">
      <span className="block text-sm font-semibold text-slate-900">{label}</span>
      <div className="relative mt-2">
        <input
          type={inputType}
          className={`w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 ${
            isPassword ? "pr-11" : ""
          } ${className}`}
          {...props}
        />
        {/* Toggle ojo — solo aparece en campos de contraseña */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1} // no interrumpe el flujo de Tab del formulario
          >
            {showPassword
              ? <EyeOff className="w-4 h-4" />
              : <Eye className="w-4 h-4" />
            }
          </button>
        )}
      </div>
      {error && <span className="mt-2 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}