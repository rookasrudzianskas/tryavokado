import "server-only";
import { db as defaultDb } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

type DbLike = Pick<typeof defaultDb, "insert">;

export interface AuditEntry {
  workspaceId: string;
  action: string;
  actorUserId?: string | null;
  actorLabel?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  source?: string;
  result?: "success" | "failure";
  summary?: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Append an immutable audit record. Pass a transaction handle as the second arg
 * to record atomically with the action it describes.
 */
export async function recordAudit(entry: AuditEntry, tx: DbLike = defaultDb) {
  await tx.insert(auditLogs).values({
    workspaceId: entry.workspaceId,
    action: entry.action,
    actorUserId: entry.actorUserId ?? null,
    actorLabel: entry.actorLabel ?? null,
    entityType: entry.entityType ?? null,
    entityId: entry.entityId ?? null,
    source: entry.source ?? "app",
    result: entry.result ?? "success",
    summary: entry.summary ?? null,
    before: entry.before ?? null,
    after: entry.after ?? null,
    metadata: entry.metadata ?? null,
  });
}
