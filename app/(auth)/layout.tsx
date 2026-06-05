import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { AuthConfigBanner } from "@/components/auth/config-banner";

const POINTS = [
  "Connect a store or inspect any website",
  "Generate an editable brand book in minutes",
  "Build Meta campaign drafts — never launched without you",
  "An AI analyst that only acts on validated data",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_30%_10%,oklch(1_0_0/0.12),transparent)]"
        />
        <Link href="/" className="relative">
          <span className="inline-flex items-center gap-2">
            <span className="font-display text-xl font-semibold">Avokado</span>
          </span>
        </Link>
        <div className="relative space-y-6">
          <h2 className="max-w-md font-display text-3xl font-semibold leading-tight">
            Everything between “I have a store” and “my ads are working.”
          </h2>
          <ul className="space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-primary-foreground/90">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-primary-foreground/70">
          Draft-first. Approval-required. Your tokens encrypted at rest.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <AuthConfigBanner />
          {children}
        </div>
      </div>
    </div>
  );
}
