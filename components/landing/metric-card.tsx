type MetricCardProps = {
  value: string;
  label: string;
  description: string;
};

export function MetricCard({ value, label, description }: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <p className="gradient-text text-4xl font-bold tracking-tight">{value}</p>
      <h3 className="mt-3 font-semibold text-slate-950">{label}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
