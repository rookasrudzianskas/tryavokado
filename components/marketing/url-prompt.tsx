"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** No-login entry point: type a store URL, generate a brand book. */
export function UrlPrompt({ className }: { className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const raw = value.trim();
    if (!raw) return;
    let url = raw;
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
    <form onSubmit={submit} className={cn("w-full", className)}>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <div className="flex h-12 flex-1 items-center gap-2.5 rounded-xl border border-border bg-card/70 px-3.5 transition-colors focus-within:border-foreground/30 focus-within:ring-2 focus-within:ring-ring/30">
          <Globe className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="url"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="yourstore.com"
            aria-label="Your store URL"
            className="h-full w-full bg-transparent text-[0.95rem] text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </div>
        <button
          type="submit"
          disabled={pending || !value.trim()}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              Generate brand book <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        No login required. We&rsquo;ll read your homepage and draft a brand book
        in seconds.
      </p>
    </form>
  );
}
