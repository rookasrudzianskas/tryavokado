import type { Metadata } from "next";
import { Wand2 } from "lucide-react";
import { SectionPlaceholder } from "@/components/app/section-placeholder";

export const metadata: Metadata = { title: "Creative Studio" };

export default function CreativePage() {
  return (
    <SectionPlaceholder
      title="Creative Studio"
      description="Plan and assemble ad concepts, copy, and storyboards tied to your brand."
      icon={Wand2}
      capabilities={[
        "Creative concepts with hook, proof, and CTA",
        "Primary text, headline, and description variants",
        "UGC, founder-story, and product-demo scripts",
        "Storyboards and video shot lists",
        "Compare, approve, reject, and duplicate",
        "Exportable creative briefs",
      ]}
      cta={{ label: "Build your brand first", href: "/brand" }}
    />
  );
}
