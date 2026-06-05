import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { connectedStores, products } from "@/lib/db/schema";

export async function listStores(workspaceId: string) {
  return db
    .select()
    .from(connectedStores)
    .where(
      and(
        eq(connectedStores.workspaceId, workspaceId),
        isNull(connectedStores.deletedAt),
      ),
    )
    .orderBy(desc(connectedStores.createdAt));
}

export async function listProducts(workspaceId: string) {
  return db
    .select()
    .from(products)
    .where(
      and(eq(products.workspaceId, workspaceId), isNull(products.deletedAt)),
    )
    .orderBy(desc(products.isHero), desc(products.createdAt));
}

export async function countProducts(workspaceId: string) {
  return db.$count(
    products,
    and(eq(products.workspaceId, workspaceId), isNull(products.deletedAt)),
  );
}
