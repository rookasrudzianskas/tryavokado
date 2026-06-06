"use client";
import { useEffect, useRef, useState } from "react";
import { Globe, MoreHorizontal, Sparkles, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BrandPreview, CreativeConcept } from "@/lib/brand/types";

type GenStatus = "loading" | "done" | "fallback";

/**
 * A realistic Meta-feed ad mockup. The creative image is generated on the spot
 * with Nano Banana (Gemini 2.5 Flash Image); while it generates we show a
 * branded shimmer, and if generation is unavailable we fall back to a clean
 * branded gradient. The feed chrome (avatar, copy, link card, CTA) is drawn in
 * the brand's own colors.
 */
export function AdPreview({
  concept,
  brand,
  generate = true,
  className,
}: {
  concept: CreativeConcept;
  brand: BrandPreview;
  generate?: boolean;
  className?: string;
}) {
  const primary = brand.palette[0]?.hex ?? "#3f7d44";
  const accent = brand.palette[1]?.hex ?? "#1f9d8a";
  const initial = brand.companyName.charAt(0).toUpperCase();

  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<GenStatus>(generate ? "loading" : "fallback");
  const started = useRef(false);

  useEffect(() => {
    if (!generate || started.current) return;
    started.current = true;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/creative/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            company: brand.companyName,
            summary: brand.summary,
            keywords: brand.keywords,
            primaryHex: primary,
            concept: {
              name: concept.name,
              angle: concept.angle,
              format: concept.format,
              headline: concept.headline,
            },
          }),
        });
        const json = (await res.json()) as { image?: string | null };
        if (json.image) {
          setImage(json.image);
          setStatus("done");
        } else {
          setStatus("fallback");
        }
      } catch {
        setStatus("fallback");
      }
    })();
    return () => controller.abort();
  }, [generate, brand, concept, primary]);

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

      {/* creative image */}
      <div
        className="relative aspect-square w-full"
        style={{ background: `linear-gradient(145deg, ${primary}, ${accent})` }}
      >
        {/* generated photo */}
        {status === "done" && image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`${brand.companyName} ad creative — ${concept.name}`}
            className="absolute inset-0 size-full animate-[fadeIn_0.7s_ease] object-cover"
          />
        )}

        {/* loading shimmer */}
        {status === "loading" && (
          <>
            <div className="absolute inset-0 bg-dots opacity-[0.18]" />
            <div className="absolute inset-0 animate-[shimmerSweep_1.6s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
              <Sparkles className="size-5 animate-pulse" />
              <span className="text-xs font-medium text-white/90">
                Generating creative…
              </span>
            </div>
          </>
        )}

        {/* gradient fallback: show the headline on the branded gradient */}
        {status === "fallback" && (
          <>
            <div className="absolute inset-0 bg-dots opacity-[0.18]" />
            <div className="absolute inset-0 flex items-end p-5">
              <p
                className="font-display text-2xl font-semibold leading-tight text-white"
                style={{ textShadow: "0 1px 12px rgba(0,0,0,0.25)" }}
              >
                {concept.headline}
              </p>
            </div>
          </>
        )}

        {/* format pill (always on top) */}
        <div className="absolute left-4 top-4 z-10">
          <span className="rounded-md bg-black/30 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {concept.format}
          </span>
        </div>
      </div>

      {/* link card */}
      <div className="flex items-center gap-3 border-t border-border bg-muted/40 px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {brand.domain}
          </p>
          <p className="truncate text-sm font-semibold text-foreground">
            {concept.headline}
          </p>
          <p className="truncate text-xs text-muted-foreground">
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
