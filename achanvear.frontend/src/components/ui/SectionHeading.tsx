interface SectionHeadingProps {
  title: string;
  subtitle: string;
}

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl text-center">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{subtitle}</p>
    </div>
  );
}
