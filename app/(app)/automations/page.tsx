import type { Metadata } from "next";
import { Workflow } from "lucide-react";
import { SectionPlaceholder } from "@/components/app/section-placeholder";

export const metadata: Metadata = { title: "Automations" };

export default function AutomationsPage() {
  return (
    <SectionPlaceholder
      title="Automations"
      description="Safe, user-defined rules with hard limits and an emergency stop."
      icon={Workflow}
      capabilities={[
        "Triggers, conditions, and minimum-data requirements",
        "Notify, pause, or adjust budget within limits",
        "Maximum frequency and per-rule budget caps",
        "Approval requirements and execution history",
        "Workspace-level automation disable switch",
        "Global emergency stop",
      ]}
      cta={{ label: "Review approval controls", href: "/settings" }}
    />
  );
}
