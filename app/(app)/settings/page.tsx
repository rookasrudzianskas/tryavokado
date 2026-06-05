"use client";
import { ScrollText, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/firebase/auth-provider";
import { useWorkspace } from "@/components/firebase/workspace-provider";
import { listAudit } from "@/lib/firebase/data";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_LABELS } from "@/lib/constants";
import { initialsFromName, formatRelativeTime } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuth();
  const { active, role } = useWorkspace();

  const { data: audit, isLoading } = useQuery({
    queryKey: ["audit", active?.id],
    enabled: !!active,
    queryFn: () => listAudit(active!.id, 8),
  });

  const memberCount = active?.memberUids.length ?? 1;
  const name = user?.displayName ?? user?.email?.split("@")[0] ?? "You";

  return (
    <>
      <PageHeader title="Settings" description="Manage your workspace, members, and billing.">
        {role && <Badge variant="outline">Your role: {ROLE_LABELS[role]}</Badge>}
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ws-name">Workspace name</Label>
            <Input id="ws-name" defaultValue={active?.name ?? ""} readOnly />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ws-slug">Workspace URL</Label>
            <Input id="ws-slug" defaultValue={`/${active?.slug ?? ""}`} readOnly />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <CardTitle>Members ({memberCount})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
              <Avatar className="size-8">
                {user?.photoURL && <AvatarImage src={user.photoURL} alt={name} />}
                <AvatarFallback>{initialsFromName(name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              {role && <Badge variant="muted">{ROLE_LABELS[role]}</Badge>}
            </div>
            <p className="pt-2 text-xs text-muted-foreground">
              Member invitations ship with the billing phase.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <ScrollText className="size-4 text-muted-foreground" />
            <CardTitle>Audit log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : audit && audit.length > 0 ? (
              audit.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-border px-3 py-2">
                  <p className="text-sm text-foreground">
                    {entry.summary ?? entry.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.actorLabel ? `${entry.actorLabel} · ` : ""}
                    {formatRelativeTime(entry.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No activity yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
