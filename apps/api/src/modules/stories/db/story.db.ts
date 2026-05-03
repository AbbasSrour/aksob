import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { storyCategories } from "@/modules/stories/constant/story-categories.constant";
import { user } from "@/modules/users/db/user.db";

export const story = sqliteTable(
	"story",
	{
		id: text("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description").notNull(),
		content: text("content").notNull(),
		category: text("category", { enum: storyCategories }).notNull(),
		storyDate: integer("story_date", { mode: "timestamp_ms" }),
		status: text("status", { enum: ["pending", "approved", "rejected"] })
			.default("pending")
			.notNull(),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
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
		index("story_author_id_idx").on(table.authorId),
		index("story_status_idx").on(table.status),
		index("story_category_idx").on(table.category),
		index("story_created_at_idx").on(table.createdAt),
	],
);

export const storyRelations = relations(story, ({ one }) => ({
	author: one(user, {
		fields: [story.authorId],
		references: [user.id],
	}),
	reviewer: one(user, {
		fields: [story.reviewedBy],
		references: [user.id],
	}),
}));
