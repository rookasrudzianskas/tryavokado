import { Globe, MoreHorizontal, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BrandPreview, CreativeConcept } from "@/lib/brand/types";

/**
 * A realistic Meta-feed ad mockup rendered in the brand's own colors + copy.
 * Pure presentational graphic — this is what the generated creative would look
 * like in-feed (a preview, not a live ad).
 */
export function AdPreview({
  concept,
  brand,
  className,
}: {
  concept: CreativeConcept;
  brand: BrandPreview;
  className?: string;
}) {
  const primary = brand.palette[0]?.hex ?? "#3f7d44";
  const accent = brand.palette[1]?.hex ?? "#1f9d8a";
  const initial = brand.companyName.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      {/* header */}
      <div className="flex items-center gap-2.5 px-3.5 pt-3.5">
        <div
          className="flex size-9 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {brand.companyName}
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Sponsored <Globe className="size-3" />
          </p>
        </div>
        <MoreHorizontal className="size-4 text-muted-foreground" />
      </div>

      {/* primary text */}
      <p className="line-clamp-3 px-3.5 py-3 text-sm leading-relaxed text-foreground/85">
        {concept.primaryText}
      </p>

      {/* creative image (branded gradient) */}
      <div
        className="relative aspect-[1.91/1] w-full"
        style={{ background: `linear-gradient(145deg, ${primary}, ${accent})` }}
      >
        <div className="absolute inset-0 bg-dots opacity-[0.18]" />
        <div className="absolute left-4 top-4">
          <span className="rounded-md bg-black/25 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {concept.format}
          </span>
        </div>
        <div className="absolute inset-0 flex items-end p-5">
          <p
            className="font-display text-2xl font-semibold leading-tight text-white"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.25)" }}
          >
            {concept.headline}
          </p>
        </div>
      </div>

      {/* link card */}
      <div className="flex items-center gap-3 border-t border-border bg-muted/40 px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {brand.domain}
          </p>
          <p className="truncate text-sm font-semibold text-foreground">
            {concept.description}
          </p>
        </div>
        <span
          className="shrink-0 rounded-md px-3.5 py-2 text-xs font-semibold text-white"
          style={{ backgroundColor: primary }}
        >
          {concept.cta}
        </span>
      </div>

      {/* reactions row */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 text-xs text-muted-foreground">
        <span
          className="flex size-4 items-center justify-center rounded-full"
          style={{ backgroundColor: primary }}
        >
          <ThumbsUp className="size-2.5 text-white" />
        </span>
        Liked by your future customers
      </div>
    </div>
  );
}
