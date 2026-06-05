import "server-only";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  subscriptions,
  users,
  workspaceMembers,
  workspaces,
} from "@/lib/db/schema";
import type { WorkspaceRole } from "@/lib/constants";

export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  companyName: string | null;
  primaryPlatform: string | null;
  onboardingStep: string;
  onboardingCompletedAt: Date | null;
  role: WorkspaceRole;
};

/** All non-deleted workspaces a user belongs to, with their role. */
export async function listUserWorkspaces(
  userId: string,
): Promise<WorkspaceSummary[]> {
  const rows = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      slug: workspaces.slug,
      companyName: workspaces.companyName,
      primaryPlatform: workspaces.primaryPlatform,
      onboardingStep: workspaces.onboardingStep,
      onboardingCompletedAt: workspaces.onboardingCompletedAt,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(
      and(eq(workspaceMembers.userId, userId), isNull(workspaces.deletedAt)),
    )
    .orderBy(desc(workspaces.createdAt));
  return rows;
}

export async function getMembership(workspaceId: string, userId: string) {
  const [row] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function getWorkspaceBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.slug, slug), isNull(workspaces.deletedAt)))
    .limit(1);
  return row ?? null;
}

export async function getWorkspaceById(id: string) {
  const [row] = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.id, id), isNull(workspaces.deletedAt)))
    .limit(1);
  return row ?? null;
}

export async function getWorkspaceMembers(workspaceId: string) {
  return db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: workspaceMembers.role,
      joinedAt: workspaceMembers.createdAt,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, workspaceId))
    .orderBy(asc(workspaceMembers.createdAt));
}

export async function getWorkspaceSubscription(workspaceId: string) {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId))
    .limit(1);
  return row ?? null;
}
