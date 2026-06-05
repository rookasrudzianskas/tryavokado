import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { SectionPlaceholder } from "@/components/app/section-placeholder";

export const metadata: Metadata = { title: "Brand" };

export default function BrandPage() {
  return (
    <SectionPlaceholder
      title="Brand"
      description="Structured, editable brand intelligence generated from your store and website."
      icon={Sparkles}
      capabilities={[
        "Company summary, mission, and story",
        "Audience, motivations, and objections",
        "Voice, messaging pillars, and approved vocabulary",
        "Visual identity and accessible palette",
        "Evidence drawer for every conclusion",
        "Versioning, autosave, and a designed PDF export",
      ]}
      cta={{ label: "Connect a store to begin", href: "/integrations" }}
    />
  );
}
