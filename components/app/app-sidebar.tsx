import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { AppNav } from "./app-nav";
import { DemoModePill } from "./demo-mode-pill";

export function AppSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center px-5">
        <Link
          href="/overview"
          className="rounded-md focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <Logo />
        </Link>
      </div>
      <AppNav />
      <div className="space-y-3 border-t border-sidebar-border p-3">
        <DemoModePill />
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ShieldCheck className="size-3.5 text-primary" />
          Approval controls active
        </Link>
      </div>
    </aside>
  );
}
