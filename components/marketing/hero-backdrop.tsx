"use client";
import { motion, useReducedMotion } from "framer-motion";

/** Ambient, Vercel-style hero backdrop: hairline grid + a slow breathing brand
 *  glow + a sweeping gradient hairline. Purely decorative, motion-reduced aware. */
export function HeroBackdrop() {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid mask-fade-b opacity-[0.45]" />

      <motion.div
        className="absolute left-1/2 top-[-12rem] size-[38rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.72_0.15_142/0.22),transparent_68%)] blur-2xl"
        initial={false}
        animate={
          reduce
            ? undefined
            : { scale: [1, 1.12, 1], opacity: [0.55, 0.85, 0.55] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
        <motion.div
          className="h-px w-1/3 bg-gradient-to-r from-transparent via-brand/70 to-transparent"
          initial={{ x: "-120%" }}
          animate={reduce ? undefined : { x: "420%" }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 2,
          }}
        />
      </div>
    </div>
  );
}
