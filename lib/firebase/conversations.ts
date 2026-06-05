import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "./client";
import { recordAudit } from "./data";
import { HUMAN_HELP_PRICE_EUR } from "@/lib/constants";
import type { ConversationDoc, MessageDoc } from "./types";

const SUPPORT_ID = "support";

function millis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return Date.now();
}

function convoRef(workspaceId: string) {
  return doc(firestore, "workspaces", workspaceId, "conversations", SUPPORT_ID);
}
function messagesRef(workspaceId: string) {
  return collection(
    firestore,
    "workspaces",
    workspaceId,
    "conversations",
    SUPPORT_ID,
    "messages",
  );
}

/** Get the workspace's support conversation, creating + seeding it if absent. */
export async function ensureSupportConversation(
  workspaceId: string,
  uid: string,
): Promise<ConversationDoc> {
  const ref = convoRef(workspaceId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      id: SUPPORT_ID,
      subject: "Human support",
      status: "open",
      createdByUid: uid,
      assignedHumanName: null,
      paid: false,
      priceEur: HUMAN_HELP_PRICE_EUR,
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    await addDoc(messagesRef(workspaceId), {
      role: "system",
      authorName: "Avokado",
      body: "This is your support thread. Ask anything — and when you're ready, connect a senior specialist to review what the AI built and help you launch.",
      createdAt: serverTimestamp(),
    });
  }
  return getConversation(workspaceId) as Promise<ConversationDoc>;
}

export async function getConversation(
  workspaceId: string,
): Promise<ConversationDoc | null> {
  const snap = await getDoc(convoRef(workspaceId));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: SUPPORT_ID,
    subject: d.subject,
    status: d.status,
    createdByUid: d.createdByUid,
    assignedHumanName: d.assignedHumanName ?? null,
    paid: d.paid ?? false,
    priceEur: d.priceEur ?? HUMAN_HELP_PRICE_EUR,
    lastMessageAt: millis(d.lastMessageAt),
    createdAt: millis(d.createdAt),
  };
}

export async function listMessages(
  workspaceId: string,
): Promise<MessageDoc[]> {
  const snap = await getDocs(
    query(messagesRef(workspaceId), orderBy("createdAt", "asc")),
  );
  return snap.docs.map((m) => ({
    id: m.id,
    role: m.data().role,
    authorName: m.data().authorName,
    body: m.data().body,
    createdAt: millis(m.data().createdAt),
  }));
}

export async function sendMessage(
  workspaceId: string,
  msg: { role: MessageDoc["role"]; authorName: string; body: string },
): Promise<void> {
  await addDoc(messagesRef(workspaceId), {
    role: msg.role,
    authorName: msg.authorName,
    body: msg.body,
    createdAt: serverTimestamp(),
  });
  await updateDoc(convoRef(workspaceId), { lastMessageAt: serverTimestamp() });
}

/** Mark that the user has requested a specialist (pre-payment). */
export async function requestSpecialist(workspaceId: string, uid: string) {
  await updateDoc(convoRef(workspaceId), { status: "pending_human" });
  await sendMessage(workspaceId, {
    role: "system",
    authorName: "Avokado",
    body: `Specialist requested (€${HUMAN_HELP_PRICE_EUR}). Complete checkout to assign a specialist to your workspace.`,
  });
  await recordAudit(workspaceId, {
    action: "support.specialist_requested",
    actorUid: uid,
    summary: "Requested a human specialist.",
  });
}

/** Mark the conversation paid + assign a specialist (called after checkout). */
export async function markSpecialistPaid(workspaceId: string, uid: string) {
  const convo = await getConversation(workspaceId);
  if (convo?.paid) return; // idempotent
  await updateDoc(convoRef(workspaceId), {
    paid: true,
    status: "with_human",
    assignedHumanName: "Avokado specialist team",
  });
  await sendMessage(workspaceId, {
    role: "system",
    authorName: "Avokado",
    body: "Payment received. A senior specialist has been assigned and will review your brand, strategy, and campaigns, then reply here.",
  });
  await recordAudit(workspaceId, {
    action: "support.specialist_assigned",
    actorUid: uid,
    summary: `Specialist assigned (€${HUMAN_HELP_PRICE_EUR} paid).`,
  });
}
