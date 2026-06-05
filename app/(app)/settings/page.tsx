import type { Metadata } from "next";
import { ScrollText, Users } from "lucide-react";
import { requireWorkspaceContext } from "@/lib/auth/session";
import {
  getWorkspaceMembers,
  getWorkspaceSubscription,
} from "@/lib/workspace/queries";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ROLE_LABELS, PLANS } from "@/lib/constants";
import { initialsFromName } from "@/lib/utils";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { workspace, role } = await requireWorkspaceContext();
  const [members, subscription] = await Promise.all([
    getWorkspaceMembers(workspace.id),
    getWorkspaceSubscription(workspace.id),
  ]);
  const plan = PLANS.find((p) => p.id === (subscription?.plan ?? "starter"));

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your workspace, members, and billing."
      >
        <Badge variant="outline">Your role: {ROLE_LABELS[role]}</Badge>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ws-name">Workspace name</Label>
            <Input id="ws-name" defaultValue={workspace.name} readOnly />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ws-slug">Workspace URL</Label>
            <Input id="ws-slug" defaultValue={`/${workspace.slug}`} readOnly />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <Avatar className="size-8">
                  {member.image && (
                    <AvatarImage src={member.image} alt={member.name} />
                  )}
                  <AvatarFallback>
                    {initialsFromName(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {member.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
                <Badge variant="muted">{ROLE_LABELS[member.role]}</Badge>
              </div>
            ))}
            <p className="pt-2 text-xs text-muted-foreground">
              Member invitations ship with the billing phase.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-display text-xl font-semibold text-foreground">
                {plan?.name ?? "Starter"}
              </p>
              <p className="text-sm text-muted-foreground">
                {subscription?.status === "active"
                  ? "Active subscription"
                  : "No active subscription — you're in demo mode."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <ScrollText className="size-4 text-muted-foreground" />
              <CardTitle>Audit log</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Every important action is recorded with actor, before/after, and
                result. The full viewer ships with the hardening phase.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
