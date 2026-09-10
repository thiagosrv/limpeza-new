import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type MetricTone = "blue" | "yellow" | "success" | "danger";

const toneClasses: Record<MetricTone, string> = {
  blue: "bg-brand-blue-50 text-brand-blue-600",
  yellow: "bg-brand-yellow-50 text-brand-yellow-600",
  success: "bg-state-success-50 text-state-success-600",
  danger: "bg-state-danger-50 text-state-danger-600",
};

export function MetricCard({
  icon: Icon,
  label,
  value,
  tone = "blue",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone?: MetricTone;
}) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <span className={cn("flex size-10 items-center justify-center rounded-xl", toneClasses[tone])}>
        <Icon className="size-5" />
      </span>
      <div>
        <p className="font-display text-2xl font-extrabold tabular-nums text-slate-900">{value}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-500">{label}</p>
      </div>
    </Card>
  );
}
