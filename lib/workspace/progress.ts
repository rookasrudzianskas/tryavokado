import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  advertisingBriefs,
  assets,
  brandProfiles,
  campaignDrafts,
  connectedStores,
  metaConnections,
} from "@/lib/db/schema";

export interface OnboardingProgress {
  storeConnected: boolean;
  brandStarted: boolean;
  briefStarted: boolean;
  assetsUploaded: boolean;
  metaConnected: boolean;
  campaignDrafted: boolean;
}

export async function getOnboardingProgress(
  workspaceId: string,
): Promise<OnboardingProgress> {
  const [stores, brand, brief, assetCount, meta, drafts] = await Promise.all([
    db.$count(connectedStores, eq(connectedStores.workspaceId, workspaceId)),
    db.$count(brandProfiles, eq(brandProfiles.workspaceId, workspaceId)),
    db.$count(advertisingBriefs, eq(advertisingBriefs.workspaceId, workspaceId)),
    db.$count(assets, eq(assets.workspaceId, workspaceId)),
    db.$count(
      metaConnections,
      and(
        eq(metaConnections.workspaceId, workspaceId),
        eq(metaConnections.status, "connected"),
      ),
    ),
    db.$count(campaignDrafts, eq(campaignDrafts.workspaceId, workspaceId)),
  ]);

  return {
    storeConnected: stores > 0,
    brandStarted: brand > 0,
    briefStarted: brief > 0,
    assetsUploaded: assetCount > 0,
    metaConnected: meta > 0,
    campaignDrafted: drafts > 0,
  };
}
