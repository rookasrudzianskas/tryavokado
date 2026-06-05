"use server";
import { revalidatePath } from "next/cache";
import {
  assertRole,
  requireWorkspaceContext,
} from "@/lib/auth/session";
import { ECOMMERCE_PLATFORMS, type EcommercePlatform } from "@/lib/constants";
import { connectDemoStore } from "./service";

export type ConnectStoreResult =
  | { ok: true; productCount: number }
  | { ok: false; error: string };

export async function connectDemoStoreAction(
  platform: EcommercePlatform,
): Promise<ConnectStoreResult> {
  if (!ECOMMERCE_PLATFORMS.includes(platform)) {
    return { ok: false, error: "Unsupported platform." };
  }
  const { user, workspace, role } = await requireWorkspaceContext();
  try {
    assertRole(role, "admin");
  } catch {
    return { ok: false, error: "You need the Admin role to connect a store." };
  }

  const result = await connectDemoStore({
    workspaceId: workspace.id,
    platform,
    userId: user.id,
  });

  revalidatePath("/integrations");
  revalidatePath("/products");
  revalidatePath("/overview");
  return { ok: true, productCount: result.productCount };
}
