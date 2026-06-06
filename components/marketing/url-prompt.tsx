"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const EXAMPLES = ["bluebottlecoffee.com", "allbirds.com", "ridge.com"];

/** No-login entry point: type a store URL, generate a full ad plan. */
export function UrlPrompt({ className }: { className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);

  function go(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    let url = trimmed;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try {
      new URL(url);
    } catch {
      return;
    }
    setPending(true);
    router.push(`/generate?url=${encodeURIComponent(url)}`);
  }

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(value);
        }}
        className="group relative"
      >
        {/* focus glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-[oklch(0.84_0.16_142)]/40 via-transparent to-[oklch(0.72_0.13_215)]/40 opacity-0 blur-md transition-opacity duration-500 group-focus-within:opacity-100"
        />
        <div className="relative flex flex-col gap-2 rounded-2xl border border-border bg-card/80 p-2 shadow-sm backdrop-blur transition-colors focus-within:border-foreground/25 sm:flex-row sm:items-center">
          <div className="flex h-12 flex-1 items-center gap-3 px-3">
            <Globe className="size-5 shrink-0 text-muted-foreground" />
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode="url"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="yourstore.com"
              aria-label="Your store URL"
              className="h-full w-full bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground/60"
            />
          </div>
          <button
            type="submit"
            disabled={pending || !value.trim()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Generate ad plan <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </form>
      <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted-foreground">
        <span>No login required.</span>
        <span className="hidden text-border sm:inline">·</span>
        <span className="inline-flex flex-wrap items-center gap-1.5">
          Try
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setValue(ex);
                go(ex);
              }}
              disabled={pending}
              className="rounded-md border border-border bg-card px-2 py-0.5 text-xs font-medium text-foreground/80 transition-colors hover:border-foreground/25 hover:text-foreground disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </span>
      </div>
    </div>
  );
}
