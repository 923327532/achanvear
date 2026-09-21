import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <label className="mb-4 block text-sm font-medium text-slate-700">
      <span className="block text-sm font-semibold text-slate-900">{label}</span>
      <input
        className={`mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 ${className}`}
        {...props}
      />
      {error ? <span className="mt-2 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
