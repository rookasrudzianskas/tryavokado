import type { Metadata } from "next";
import { Boxes } from "lucide-react";
import { SectionPlaceholder } from "@/components/app/section-placeholder";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <SectionPlaceholder
      title="Products"
      description="Products imported from your store, ready to advertise."
      icon={Boxes}
      capabilities={[
        "Imported products, variants, and collections",
        "Prices, images, and inventory",
        "Hero and priority product tagging",
        "Margins for budget and ROAS planning",
        "Search, filter, and bulk selection",
        "Direct hand-off into creative and campaigns",
      ]}
      cta={{ label: "Connect a store", href: "/integrations" }}
    />
  );
}
