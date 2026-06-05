"use client";
import { useTransition } from "react";
import Link from "next/link";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setActiveWorkspace } from "@/lib/workspace/actions";
import { ROLE_LABELS, type WorkspaceRole } from "@/lib/constants";
import { cn, initialsFromName } from "@/lib/utils";

export interface WorkspaceOption {
  id: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
}

export function WorkspaceSwitcher({
  workspaces,
  activeSlug,
}: {
  workspaces: WorkspaceOption[];
  activeSlug: string;
}) {
  const [pending, startTransition] = useTransition();
  const active = workspaces.find((w) => w.slug === activeSlug) ?? workspaces[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-9 max-w-56 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label="Switch workspace"
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/12 text-[11px] font-semibold text-primary">
          {initialsFromName(active?.name)}
        </span>
        <span className="truncate">{active?.name}</span>
        {pending ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onSelect={() =>
              ws.slug !== activeSlug &&
              startTransition(() => setActiveWorkspace(ws.slug))
            }
            className="gap-2"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-foreground">
              {initialsFromName(ws.name)}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium text-foreground">
                {ws.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {ROLE_LABELS[ws.role]}
              </span>
            </span>
            {ws.slug === activeSlug && (
              <Check className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/onboarding" className={cn("gap-2")}>
            <Plus className="size-4" /> New workspace
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
