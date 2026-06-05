import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { Logo } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { CreateWorkspaceForm } from "@/components/onboarding/create-workspace-form";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Create your workspace" };

const STEPS = ["Create workspace", "Connect store", "Build brand"];

export default async function OnboardingPage() {
  await requireUser();

  return (
    <div className="flex min-h-dvh flex-col bg-grain">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-6">
        <Link href="/">
          <Logo />
        </Link>
        <span className="text-sm text-muted-foreground">Step 1 of 3</span>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-16">
        {/* Stepper */}
        <ol className="mb-8 flex items-center gap-2">
          {STEPS.map((step, i) => (
            <li key={step} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  i === 0
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground",
                )}
              >
                {i === 0 ? i + 1 : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:block",
                  i === 0 ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step}
              </span>
              {i < STEPS.length - 1 && (
                <span className="h-px flex-1 bg-border" />
              )}
            </li>
          ))}
        </ol>

        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Create your workspace
          </h1>
          <p className="text-muted-foreground">
            A workspace holds your brand, products, assets, and campaigns. You can
            create more later and invite your team.
          </p>
        </div>

        <Card className="mt-7 p-6 sm:p-8">
          <CreateWorkspaceForm />
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          You can explore everything in demo mode before connecting anything real.
        </p>
      </main>
    </div>
  );
}
