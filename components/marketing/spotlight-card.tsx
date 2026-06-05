"use client";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Card with a cursor-following brand spotlight + hover border-brighten + lift.
 *  A restrained, Vercel-style micro-interaction. */
export function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -200, y: -200 });

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setPos({ x: -200, y: -200 })}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(240px circle at ${pos.x}px ${pos.y}px, oklch(0.72 0.15 142 / 0.12), transparent 70%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
