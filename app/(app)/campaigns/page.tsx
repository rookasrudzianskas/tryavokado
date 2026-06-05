import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import { SectionPlaceholder } from "@/components/app/section-placeholder";

export const metadata: Metadata = { title: "Campaigns" };

export default function CampaignsPage() {
  return (
    <SectionPlaceholder
      title="Campaigns"
      description="Build, validate, and approve campaign drafts — created paused by default."
      icon={Megaphone}
      capabilities={[
        "Campaign → ad set → ad → creative hierarchy",
        "Budget, schedule, audience, and placement summary",
        "Validation warnings and clearly-labelled estimates",
        "Final review with explicit confirmation",
        "Paused/draft creation with saved external IDs",
        "Idempotent retries and a full audit log",
      ]}
      cta={{ label: "Check Meta readiness", href: "/integrations" }}
    />
  );
}
