import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const styles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700",
  secondary:
    "rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100",
  ghost:
    "rounded-full px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`${styles[variant]} ${className}`} {...props} />;
}
