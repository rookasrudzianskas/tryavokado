import type { WorkspaceRole, EcommercePlatform } from "@/lib/constants";

/** Firestore document shapes. Timestamps are stored as Firestore Timestamps and
 *  read back as millis via helpers in `data.ts`. */

export interface UserDoc {
  uid: string;
  email: string;
  name: string;
  image: string | null;
  activeWorkspaceId: string | null;
  createdAt: number;
}

export interface WorkspaceDoc {
  id: string;
  name: string;
  slug: string;
  companyName: string;
  primaryPlatform: EcommercePlatform | null;
  onboardingStep: string;
  onboardingCompletedAt: number | null;
  memberUids: string[];
  roles: Record<string, WorkspaceRole>;
  createdByUid: string;
  createdAt: number;
}

export interface ConnectedStoreDoc {
  id: string;
  platform: EcommercePlatform;
  status: "connected" | "pending" | "error";
  isMock: boolean;
  displayName: string;
  domain: string | null;
  currency: string;
  country: string | null;
  productCount: number;
  lastSyncedAt: number | null;
  createdAt: number;
}

export interface ProductDoc {
  id: string;
  externalId: string;
  storeId: string;
  title: string;
  handle: string;
  description: string;
  status: string;
  tags: string[];
  priceMin: number;
  priceMax: number;
  currency: string;
  featuredImageUrl: string | null;
  isHero: boolean;
  createdAt: number;
}

export interface AuditDoc {
  id: string;
  action: string;
  actorUid: string | null;
  actorLabel: string | null;
  entityType: string | null;
  entityId: string | null;
  summary: string | null;
  result: "success" | "failure";
  createdAt: number;
}

export interface ConversationDoc {
  id: string;
  subject: string;
  status: "open" | "pending_human" | "with_human" | "resolved";
  createdByUid: string;
  assignedHumanName: string | null;
  paid: boolean;
  priceEur: number;
  lastMessageAt: number;
  createdAt: number;
}

export interface MessageDoc {
  id: string;
  role: "user" | "ai" | "human" | "system";
  authorName: string;
  body: string;
  createdAt: number;
}
