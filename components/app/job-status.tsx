import {
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  CircleSlash,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type JobState =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

const CONFIG: Record<
  JobState,
  { label: string; icon: typeof Clock; className: string; spin?: boolean }
> = {
  queued: { label: "Queued", icon: Clock, className: "text-muted-foreground" },
  running: { label: "Running", icon: Loader2, className: "text-primary", spin: true },
  succeeded: { label: "Complete", icon: CheckCircle2, className: "text-success" },
  failed: { label: "Failed", icon: XCircle, className: "text-destructive" },
  cancelled: { label: "Cancelled", icon: CircleSlash, className: "text-muted-foreground" },
};

/** Reusable job-status indicator backing every durable background job in the UI. */
export function JobStatus({
  state,
  progress,
  step,
  error,
  showBar = true,
  className,
}: {
  state: JobState;
  progress?: number;
  step?: string;
  error?: string | null;
  showBar?: boolean;
  className?: string;
}) {
  const config = CONFIG[state];
  const Icon = config.icon;
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 text-sm">
        <Icon className={cn("size-4", config.className, config.spin && "animate-spin")} />
        <span className={cn("font-medium", config.className)}>{config.label}</span>
        {step && state === "running" && (
          <span className="text-muted-foreground">· {step}</span>
        )}
      </div>
      {showBar && (state === "running" || state === "queued") && (
        <Progress value={progress ?? (state === "queued" ? 0 : 10)} />
      )}
      {state === "failed" && error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
