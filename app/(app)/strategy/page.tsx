import type { Metadata } from "next";
import { Target } from "lucide-react";
import { SectionPlaceholder } from "@/components/app/section-placeholder";

export const metadata: Metadata = { title: "Strategy" };

export default function StrategyPage() {
  return (
    <SectionPlaceholder
      title="Strategy"
      description="A guided brief that becomes an editable, structured strategy plan."
      icon={Target}
      capabilities={[
        "Branching questions — irrelevant ones are hidden",
        "Business, budget, goals, and preferences",
        "Recommended campaign structure and allocation",
        "Audience strategy and product selection",
        "Creative-testing and measurement plans",
        "Launch-readiness checklist",
      ]}
      cta={{ label: "Start with your brand", href: "/brand" }}
    />
  );
}
