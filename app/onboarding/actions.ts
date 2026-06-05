"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACTIVE_WS_COOKIE, requireUser } from "@/lib/auth/session";
import { createWorkspace } from "@/lib/workspace/service";
import { createWorkspaceSchema } from "@/lib/validations/workspace";

export type CreateWorkspaceResult = { ok: false; error: string };

export async function createWorkspaceAction(
  input: unknown,
): Promise<CreateWorkspaceResult> {
  const user = await requireUser();
  const parsed = createWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form.",
    };
  }

  const workspace = await createWorkspace({
    userId: user.id,
    name: parsed.data.companyName,
    companyName: parsed.data.companyName,
    primaryPlatform: parsed.data.primaryPlatform,
  });

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WS_COOKIE, workspace.slug, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect("/overview");
}
