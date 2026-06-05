import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { SectionPlaceholder } from "@/components/app/section-placeholder";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <SectionPlaceholder
      title="Analytics"
      description="Clear, elegant performance views across your account."
      icon={BarChart3}
      capabilities={[
        "Spend, revenue, ROAS, CPA, CTR, CPC, CPM",
        "Account, campaign, ad-set, ad, and creative views",
        "Placement, geographic, and time-series breakdowns",
        "Date range, comparison period, and saved views",
        "Data-freshness and attribution disclaimers",
        "CSV export and partial-data warnings",
      ]}
      cta={{ label: "Connect Meta", href: "/integrations" }}
    />
  );
}
