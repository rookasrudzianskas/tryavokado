"use client";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** A card wrapper with a slowly-rotating gradient hairline border (Vercel-style). */
export function GradientBorder({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-px", className)}>
      <motion.div
        aria-hidden
        className="absolute inset-[-150%] opacity-70"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, oklch(0.72 0.15 142 / 0.9) 40deg, transparent 110deg, transparent 360deg)",
        }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative h-full rounded-[calc(1rem-1px)] bg-card">
        {children}
      </div>
    </div>
  );
}
