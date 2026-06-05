import { cn } from "@/lib/utils";

/** Avocado glyph — a calm, geometric mark. Uses theme tokens, not hard colors. */
export function AvocadoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-7", className)}
    >
      <path
        d="M16 2.5c-5 0-9 3.7-9 9.2 0 3.1 1.2 5.1 2.9 7.4 1.9 2.6 3.2 5.1 4.1 8.2.3 1.1.7 1.7 2 1.7s1.7-.6 2-1.7c.9-3.1 2.2-5.6 4.1-8.2 1.7-2.3 2.9-4.3 2.9-7.4 0-5.5-4-9.2-9-9.2Z"
        className="fill-primary"
      />
      <path
        d="M16 6.2c-3.1 0-5.5 2.3-5.5 5.6 0 1.5.5 2.7 1.3 3.9"
        className="stroke-primary-foreground/40"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="16" cy="13.4" r="3.4" className="fill-[oklch(0.99_0.02_95)]" />
      <circle cx="16" cy="13.4" r="1.7" className="fill-warning" />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <AvocadoMark />
      {showWordmark && (
        <span className="font-display text-xl font-semibold tracking-tight text-foreground">
          Avokado
        </span>
      )}
    </span>
  );
}
