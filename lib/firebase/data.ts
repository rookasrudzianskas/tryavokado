import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";
import { firestore } from "./client";
import { slugify } from "@/lib/utils";
import type { EcommercePlatform, WorkspaceRole } from "@/lib/constants";
import type { AuditDoc, WorkspaceDoc } from "./types";

function millis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return Date.now();
}

function millisOrNull(value: unknown): number | null {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return null;
}

/** Create or refresh the user profile document. */
export async function ensureUserDoc(user: FirebaseUser): Promise<void> {
  const ref = doc(firestore, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, {
      email: user.email ?? "",
      name: user.displayName ?? snap.data().name ?? "",
      image: user.photoURL ?? null,
    });
    return;
  }
  await setDoc(ref, {
    uid: user.uid,
    email: user.email ?? "",
    name: user.displayName ?? (user.email ? user.email.split("@")[0] : "User"),
    image: user.photoURL ?? null,
    activeWorkspaceId: null,
    createdAt: serverTimestamp(),
  });
}

export async function getActiveWorkspaceId(uid: string): Promise<string | null> {
  const snap = await getDoc(doc(firestore, "users", uid));
  return snap.exists() ? (snap.data().activeWorkspaceId ?? null) : null;
}

export async function setActiveWorkspace(uid: string, workspaceId: string) {
  await updateDoc(doc(firestore, "users", uid), {
    activeWorkspaceId: workspaceId,
  });
}

export interface CreateWorkspaceInput {
  uid: string;
  actorName: string;
  name: string;
  companyName?: string;
  primaryPlatform?: EcommercePlatform;
}

export async function createWorkspace(
  input: CreateWorkspaceInput,
): Promise<string> {
  const ref = doc(collection(firestore, "workspaces"));
  const slug = `${slugify(input.name) || "workspace"}-${ref.id.slice(0, 4).toLowerCase()}`;
  const roles: Record<string, WorkspaceRole> = { [input.uid]: "owner" };

  await setDoc(ref, {
    id: ref.id,
    name: input.name.trim(),
    slug,
    companyName: input.companyName?.trim() || input.name.trim(),
    primaryPlatform: input.primaryPlatform ?? null,
    onboardingStep: "platform",
    onboardingCompletedAt: null,
    memberUids: [input.uid],
    roles,
    createdByUid: input.uid,
    createdAt: serverTimestamp(),
  });

  await setActiveWorkspace(input.uid, ref.id);
  await recordAudit(ref.id, {
    action: "workspace.created",
    actorUid: input.uid,
    actorLabel: input.actorName,
    entityType: "workspace",
    entityId: ref.id,
    summary: `Created workspace “${input.name}”.`,
  });
  return ref.id;
}

function mapWorkspace(data: Record<string, unknown>): WorkspaceDoc {
  return {
    id: data.id as string,
    name: data.name as string,
    slug: data.slug as string,
    companyName: (data.companyName as string) ?? "",
    primaryPlatform: (data.primaryPlatform as WorkspaceDoc["primaryPlatform"]) ?? null,
    onboardingStep: (data.onboardingStep as string) ?? "platform",
    onboardingCompletedAt: millisOrNull(data.onboardingCompletedAt),
    memberUids: (data.memberUids as string[]) ?? [],
    roles: (data.roles as Record<string, WorkspaceRole>) ?? {},
    createdByUid: (data.createdByUid as string) ?? "",
    createdAt: millis(data.createdAt),
  };
}

export async function listMyWorkspaces(uid: string): Promise<WorkspaceDoc[]> {
  const q = query(
    collection(firestore, "workspaces"),
    where("memberUids", "array-contains", uid),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => mapWorkspace(d.data()))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getWorkspace(id: string): Promise<WorkspaceDoc | null> {
  const snap = await getDoc(doc(firestore, "workspaces", id));
  return snap.exists() ? mapWorkspace(snap.data()) : null;
}

export async function setOnboardingStep(
  workspaceId: string,
  step: string,
  opts: { complete?: boolean } = {},
) {
  await updateDoc(doc(firestore, "workspaces", workspaceId), {
    onboardingStep: step,
    ...(opts.complete ? { onboardingCompletedAt: serverTimestamp() } : {}),
  });
}

export async function recordAudit(
  workspaceId: string,
  entry: Omit<AuditDoc, "id" | "createdAt" | "result"> & {
    result?: "success" | "failure";
  },
) {
  await addDoc(collection(firestore, "workspaces", workspaceId, "auditLogs"), {
    action: entry.action,
    actorUid: entry.actorUid ?? null,
    actorLabel: entry.actorLabel ?? null,
    entityType: entry.entityType ?? null,
    entityId: entry.entityId ?? null,
    summary: entry.summary ?? null,
    result: entry.result ?? "success",
    createdAt: serverTimestamp(),
  });
}

export async function listAudit(workspaceId: string, max = 50): Promise<AuditDoc[]> {
  const q = query(
    collection(firestore, "workspaces", workspaceId, "auditLogs"),
    orderBy("createdAt", "desc"),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    action: d.data().action,
    actorUid: d.data().actorUid ?? null,
    actorLabel: d.data().actorLabel ?? null,
    entityType: d.data().entityType ?? null,
    entityId: d.data().entityId ?? null,
    summary: d.data().summary ?? null,
    result: d.data().result ?? "success",
    createdAt: millis(d.data().createdAt),
  }));
}

export async function subcollectionCount(
  workspaceId: string,
  sub: string,
): Promise<number> {
  const snap = await getCountFromServer(
    collection(firestore, "workspaces", workspaceId, sub),
  );
  return snap.data().count;
}
