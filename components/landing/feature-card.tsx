import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  tag,
}: FeatureCardProps) {
  return (
    <div className="group rounded-[1.75rem] border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex size-13 items-center justify-center rounded-3xl bg-violet-50 text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white">
          <Icon className="size-6" />
        </div>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
          {tag}
        </span>
      </div>

      <h3 className="text-xl font-semibold tracking-tight text-slate-950">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
