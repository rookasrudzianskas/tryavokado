import { createId } from "@paralleldrive/cuid2";
import { timestamp, text } from "drizzle-orm/pg-core";

/** Primary key column using collision-resistant cuid2 ids. */
export const primaryId = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => createId());

/** createdAt / updatedAt pair applied to every table. */
export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/** Soft-deletion marker. Null = live row. */
export const softDelete = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};
