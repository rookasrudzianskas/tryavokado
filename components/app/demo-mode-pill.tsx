import { FlaskConical } from "lucide-react";
import { publicEnv } from "@/lib/env-public";

/** A persistent reminder that the workspace is running on mock adapters. */
export function DemoModePill() {
  if (publicEnv.mode !== "mock") return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
      <FlaskConical className="size-3.5" />
      <span>
        <span className="font-medium">Demo mode</span> — all integrations are
        mocked.
      </span>
    </div>
  );
}
