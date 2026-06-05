"use client";
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Wraps an element so it subtly pulls toward the cursor on hover. */
export function Magnetic({
  children,
  className,
  strength = 0.35,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const reduce = useReducedMotion();

  return (
    <motion.span
      ref={ref}
      className={cn("inline-block", className)}
      onMouseMove={(e) => {
        if (reduce) return;
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        setPos({
          x: (e.clientX - (rect.left + rect.width / 2)) * strength,
          y: (e.clientY - (rect.top + rect.height / 2)) * strength,
        });
      }}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 220, damping: 16, mass: 0.4 }}
    >
      {children}
    </motion.span>
  );
}
