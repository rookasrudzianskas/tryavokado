import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";
import { SectionPlaceholder } from "@/components/app/section-placeholder";

export const metadata: Metadata = { title: "Recommendations" };

export default function RecommendationsPage() {
  return (
    <SectionPlaceholder
      title="Recommendations"
      description="An AI analyst that only acts on validated performance data."
      icon={Lightbulb}
      capabilities={[
        "Plain-language wins, problems, and likely causes",
        "Confidence, evidence, and minimum-data checks",
        "Reversible action plans with expected tradeoffs",
        "Deterministic policy validation before anything runs",
        "Your approval required unless a rule allows it",
        "Every applied action recorded in the audit log",
      ]}
      cta={{ label: "See analytics", href: "/analytics" }}
    />
  );
}
