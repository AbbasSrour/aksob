import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { opportunityTypes } from "@/modules/opportunities/constant/opportunity-types.constant";
import { user } from "@/modules/users/db/user.db";

export const opportunity = sqliteTable(
	"opportunity",
	{
		id: text("id").primaryKey(),
		type: text("type", { enum: opportunityTypes }).notNull(),
		company: text("company").notNull(),
		contactEmail: text("contact_email"),
		applyUrl: text("apply_url"),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		status: text("status", { enum: ["pending", "approved", "rejected"] })
			.default("pending")
			.notNull(),
		reviewedBy: text("reviewed_by").references(() => user.id),
		reviewNotes: text("review_notes"),
		reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("opp_author_id_idx").on(table.authorId),
		index("opp_status_idx").on(table.status),
		index("opp_created_at_idx").on(table.createdAt),
	],
);

export const opportunityRelations = relations(opportunity, ({ one }) => ({
	author: one(user, {
		fields: [opportunity.authorId],
		references: [user.id],
	}),
	reviewer: one(user, {
		fields: [opportunity.reviewedBy],
		references: [user.id],
	}),
}));
