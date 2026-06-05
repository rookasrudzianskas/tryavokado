"use client";
import { useTransition } from "react";
import Link from "next/link";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/firebase/auth-provider";
import { useWorkspace } from "@/components/firebase/workspace-provider";
import { ROLE_LABELS } from "@/lib/constants";
import { initialsFromName } from "@/lib/utils";

export function WorkspaceSwitcher() {
  const { user } = useAuth();
  const { workspaces, active, switchWorkspace } = useWorkspace();
  const [pending, startTransition] = useTransition();

  if (!active) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-9 max-w-56 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label="Switch workspace"
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/12 text-[11px] font-semibold text-primary">
          {initialsFromName(active.name)}
        </span>
        <span className="truncate">{active.name}</span>
        {pending ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces.map((ws) => {
          const role = user ? ws.roles[user.uid] : undefined;
          return (
            <DropdownMenuItem
              key={ws.id}
              onSelect={() =>
                ws.id !== active.id &&
                startTransition(() => switchWorkspace(ws.id))
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
                  {role ? ROLE_LABELS[role] : "Member"}
                </span>
              </span>
              {ws.id === active.id && <Check className="size-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/onboarding" className="gap-2">
            <Plus className="size-4" /> New workspace
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
