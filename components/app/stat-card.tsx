import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  className,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  delta?: { value: string; direction: "up" | "down"; good?: boolean };
  hint?: string;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "gap-0 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && <Icon className="size-4 text-muted-foreground/70" />}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium",
              (delta.good ?? delta.direction === "up")
                ? "text-success"
                : "text-destructive",
            )}
          >
            {delta.direction === "up" ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {delta.value}
          </span>
        )}
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  );
}
