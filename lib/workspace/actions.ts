"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACTIVE_WS_COOKIE, requireUser } from "@/lib/auth/session";
import { listUserWorkspaces } from "@/lib/workspace/queries";

/** Switch the active workspace (validated against membership) and reload. */
export async function setActiveWorkspace(slug: string) {
  const user = await requireUser();
  const memberships = await listUserWorkspaces(user.id);
  const target = memberships.find((w) => w.slug === slug);
  if (!target) return;

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WS_COOKIE, slug, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/overview");
}
