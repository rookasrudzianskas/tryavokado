import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  subscriptions,
  users,
  workspaceMembers,
  workspaces,
} from "@/lib/db/schema";
import { recordAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { ValidationError } from "@/lib/errors";
import type { EcommercePlatform } from "@/lib/constants";

async function generateUniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "workspace";
  let candidate = root;
  for (let attempt = 0; attempt < 50; attempt++) {
    const [existing] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.slug, candidate))
      .limit(1);
    if (!existing) return candidate;
    candidate = `${root}-${Math.random().toString(36).slice(2, 6)}`;
  }
  throw new ValidationError("Could not generate a unique workspace URL.");
}

export interface CreateWorkspaceInput {
  userId: string;
  name: string;
  companyName?: string;
  primaryPlatform?: EcommercePlatform;
}

export async function createWorkspace(input: CreateWorkspaceInput) {
  const name = input.name.trim();
  if (name.length < 2) {
    throw new ValidationError("Workspace name must be at least 2 characters.");
  }
  const slug = await generateUniqueSlug(name);

  const workspace = await db.transaction(async (tx) => {
    const [ws] = await tx
      .insert(workspaces)
      .values({
        name,
        slug,
        companyName: input.companyName?.trim() || name,
        primaryPlatform: input.primaryPlatform ?? null,
        onboardingStep: "platform",
        createdByUserId: input.userId,
      })
      .returning();

    await tx.insert(workspaceMembers).values({
      workspaceId: ws.id,
      userId: input.userId,
      role: "owner",
    });

    await tx.insert(subscriptions).values({
      workspaceId: ws.id,
      plan: "starter",
      status: "none",
    });

    await tx
      .update(users)
      .set({ activeWorkspaceId: ws.id })
      .where(eq(users.id, input.userId));

    await recordAudit(
      {
        workspaceId: ws.id,
        action: "workspace.created",
        actorUserId: input.userId,
        entityType: "workspace",
        entityId: ws.id,
        summary: `Created workspace “${name}”.`,
        after: { name, slug, primaryPlatform: input.primaryPlatform },
      },
      tx,
    );

    return ws;
  });

  return workspace;
}

/** Advance / persist onboarding progress so the user can resume later. */
export async function setOnboardingStep(
  workspaceId: string,
  step: string,
  opts: { complete?: boolean; primaryPlatform?: EcommercePlatform } = {},
) {
  await db
    .update(workspaces)
    .set({
      onboardingStep: step,
      ...(opts.primaryPlatform ? { primaryPlatform: opts.primaryPlatform } : {}),
      ...(opts.complete ? { onboardingCompletedAt: new Date() } : {}),
    })
    .where(eq(workspaces.id, workspaceId));
}

export async function isWorkspaceMember(workspaceId: string, userId: string) {
  const [row] = await db
    .select({ id: workspaceMembers.id })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId),
      ),
    )
    .limit(1);
  return Boolean(row);
}
