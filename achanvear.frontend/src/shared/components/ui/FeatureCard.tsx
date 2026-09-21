interface FeatureCardProps {
  title: string;
  description: string;
}

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-3 text-sm text-slate-600">{description}</p>
    </div>
  );
}
