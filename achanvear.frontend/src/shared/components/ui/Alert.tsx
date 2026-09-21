interface AlertProps {
  title?: string;
  message: string;
  variant?: "error" | "info";
}

export function Alert({ title, message, variant = "error" }: AlertProps) {
  const base = "rounded-md p-3 text-sm flex items-start gap-3";
  const style =
    variant === "error"
      ? "bg-rose-50 text-rose-700 border border-rose-100"
      : "bg-sky-50 text-sky-700 border border-sky-100";

  return (
    <div className={`${base} ${style}`} role="alert">
      <div className="flex-1">
        {title ? <div className="font-semibold">{title}</div> : null}
        <div className="mt-1">{message}</div>
      </div>
    </div>
  );
}
