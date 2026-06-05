import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "./client";
import { recordAudit } from "./data";

export interface MetaConnectionDoc {
  connected: boolean;
  adapter: "mock" | "live";
  businessId: string | null;
  adAccountId: string | null;
  pageId: string | null;
  instagramId: string | null;
  pixelId: string | null;
  catalogId: string | null;
  currency: string | null;
  timezone: string | null;
  readinessScore: number | null;
  connectedAt: number | null;
}

function metaRef(workspaceId: string) {
  return doc(firestore, "workspaces", workspaceId, "integrations", "meta");
}

function millisOrNull(value: unknown): number | null {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return null;
}

export async function getMetaConnection(
  workspaceId: string,
): Promise<MetaConnectionDoc | null> {
  const snap = await getDoc(metaRef(workspaceId));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    connected: d.connected ?? false,
    adapter: d.adapter ?? "mock",
    businessId: d.businessId ?? null,
    adAccountId: d.adAccountId ?? null,
    pageId: d.pageId ?? null,
    instagramId: d.instagramId ?? null,
    pixelId: d.pixelId ?? null,
    catalogId: d.catalogId ?? null,
    currency: d.currency ?? null,
    timezone: d.timezone ?? null,
    readinessScore: d.readinessScore ?? null,
    connectedAt: millisOrNull(d.connectedAt),
  };
}

export async function connectMeta(
  workspaceId: string,
  uid: string,
  init: Omit<MetaConnectionDoc, "connected" | "connectedAt">,
): Promise<void> {
  await setDoc(metaRef(workspaceId), {
    ...init,
    connected: true,
    connectedAt: serverTimestamp(),
  });
  await recordAudit(workspaceId, {
    action: "meta.connected",
    actorUid: uid,
    entityType: "meta_connection",
    summary: `Connected Meta (${init.adapter} adapter) — ad account ${init.adAccountId ?? "n/a"}.`,
  });
}

export async function updateMetaSelection(
  workspaceId: string,
  patch: Partial<MetaConnectionDoc>,
): Promise<void> {
  await updateDoc(metaRef(workspaceId), patch);
}

export async function disconnectMeta(
  workspaceId: string,
  uid: string,
): Promise<void> {
  await deleteDoc(metaRef(workspaceId));
  await recordAudit(workspaceId, {
    action: "meta.disconnected",
    actorUid: uid,
    entityType: "meta_connection",
    summary: "Disconnected Meta.",
  });
}
