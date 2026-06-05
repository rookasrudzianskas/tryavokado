import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Marks data that comes from a mock adapter so demo and real data are never
 * visually confused. Rendered wherever mock-sourced records appear.
 */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge variant="warning" className={cn("gap-1", className)}>
      <FlaskConical className="size-3" />
      Demo data
    </Badge>
  );
}
