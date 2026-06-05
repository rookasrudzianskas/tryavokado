"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Boxes,
  Palette,
  Rocket,
  Store,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  {
    key: "connect",
    label: "Connect store",
    icon: Store,
    detail: "Shopify · 248 products synced",
  },
  {
    key: "understand",
    label: "Understand brand",
    icon: Sparkles,
    detail: "Brand book · 94% complete",
  },
  {
    key: "build",
    label: "Build ads",
    icon: Palette,
    detail: "6 creative concepts drafted",
  },
  {
    key: "launch",
    label: "Launch (paused)",
    icon: Rocket,
    detail: "Campaign draft · awaiting approval",
  },
  {
    key: "improve",
    label: "Improve",
    icon: BarChart3,
    detail: "3 recommendations to review",
  },
] as const;

const BARS = [38, 52, 47, 63, 71, 58, 80];

export function ProductPreview() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % STAGES.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary/5 blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
          <span className="size-2.5 rounded-full bg-destructive/30" />
          <span className="size-2.5 rounded-full bg-warning/40" />
          <span className="size-2.5 rounded-full bg-success/40" />
          <div className="ml-3 flex items-center gap-1.5 rounded-md bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground">
            <Boxes className="size-3" /> app.tryavokado.com
          </div>
          <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Illustrative preview
          </span>
        </div>

        <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
          {/* mini sidebar / pipeline */}
          <div className="hidden flex-col gap-1 border-r border-border bg-sidebar/60 p-3 sm:flex">
            {STAGES.map((stage, i) => {
              const Icon = stage.icon;
              const isActive = i === active;
              return (
                <div
                  key={stage.key}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{stage.label}</span>
                </div>
              );
            })}
          </div>

          {/* content panel */}
          <div className="p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={STAGES[active].key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Step {active + 1} of {STAGES.length}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
                  {STAGES[active].label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {STAGES[active].detail}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              {[
                { label: "ROAS", value: "—" },
                { label: "Spend", value: "Draft" },
                { label: "Status", value: "Paused" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border border-border bg-background/60 px-3 py-2.5"
                >
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {m.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex h-24 items-end gap-1.5">
              {BARS.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-sm bg-primary/70"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  style={{ minHeight: 6 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
