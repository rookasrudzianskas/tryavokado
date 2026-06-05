import type { Metadata } from "next";
import { Images } from "lucide-react";
import { SectionPlaceholder } from "@/components/app/section-placeholder";

export const metadata: Metadata = { title: "Assets" };

export default function AssetsPage() {
  return (
    <SectionPlaceholder
      title="Assets"
      description="A premium library for your images, video, UGC, and logos."
      icon={Images}
      capabilities={[
        "Drag-and-drop, signed direct-to-storage uploads",
        "Resumable uploads for large video",
        "Folders, tags, grid and list views",
        "AI inspection kept separate from your approvals",
        "Approval state, rejection notes, duplicate detection",
        "Archive, restore, and usage history",
      ]}
      cta={{ label: "Back to overview", href: "/overview" }}
    />
  );
}
