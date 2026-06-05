import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthorizationError } from "@/lib/errors";
import {
  getMembership,
  listUserWorkspaces,
  type WorkspaceSummary,
} from "@/lib/workspace/queries";
import { roleAtLeast, type WorkspaceRole } from "@/lib/constants";

export const ACTIVE_WS_COOKIE = "avokado_active_ws";

/** Cached per-request session lookup. */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/** Require an authenticated user or redirect to login. */
export async function requireUser() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return session.user;
}

export type WorkspaceContext = {
  user: NonNullable<Awaited<ReturnType<typeof getSession>>>["user"];
  workspace: WorkspaceSummary;
  workspaces: WorkspaceSummary[];
  role: WorkspaceRole;
};

/**
 * Resolve the active workspace for the current request. Honors the
 * `avokado_active_ws` cookie when it points at a workspace the user belongs to;
 * otherwise falls back to the most recent membership. Redirects to onboarding
 * when the user has no workspace yet.
 */
export async function requireWorkspaceContext(opts?: {
  slug?: string;
  minRole?: WorkspaceRole;
}): Promise<WorkspaceContext> {
  const user = await requireUser();
  const memberships = await listUserWorkspaces(user.id);
  if (memberships.length === 0) redirect("/onboarding");

  const cookieStore = await cookies();
  const preferredSlug = opts?.slug ?? cookieStore.get(ACTIVE_WS_COOKIE)?.value;
  const workspace =
    memberships.find((w) => w.slug === preferredSlug) ?? memberships[0];

  if (opts?.minRole && !roleAtLeast(workspace.role, opts.minRole)) {
    throw new AuthorizationError(
      `This action requires the ${opts.minRole} role or higher.`,
    );
  }

  return { user, workspace, workspaces: memberships, role: workspace.role };
}

/** Authorize an explicit workspace by id, returning the membership role. */
export async function authorizeWorkspace(
  workspaceId: string,
  minRole: WorkspaceRole = "viewer",
): Promise<{ userId: string; role: WorkspaceRole }> {
  const user = await requireUser();
  const membership = await getMembership(workspaceId, user.id);
  if (!membership) {
    throw new AuthorizationError("You are not a member of this workspace.");
  }
  if (!roleAtLeast(membership.role, minRole)) {
    throw new AuthorizationError(
      `This action requires the ${minRole} role or higher.`,
    );
  }
  return { userId: user.id, role: membership.role };
}

export function assertRole(role: WorkspaceRole, min: WorkspaceRole) {
  if (!roleAtLeast(role, min)) {
    throw new AuthorizationError(`This action requires the ${min} role or higher.`);
  }
}
