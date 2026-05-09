import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "@/modules/users/db/user.db";

export const newsCategory = sqliteTable("news_category", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull(),
});

export const news = sqliteTable(
	"news",
	{
		id: text("id").primaryKey(),
		title: text("title").notNull(),
		excerpt: text("excerpt").notNull(),
		content: text("content").notNull(),
		coverImage: text("cover_image"),
		thumbnailImage: text("thumbnail_image"),
		readTime: integer("read_time"),
		status: text("status", { enum: ["draft", "published"] })
			.default("draft")
			.notNull(),
		publishedAt: integer("published_at", { mode: "timestamp_ms" }),
		date: integer("date", { mode: "timestamp_ms" }),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		categoryId: text("category_id").references(() => newsCategory.id, {
			onDelete: "set null",
		}),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("news_author_id_idx").on(table.authorId),
		index("news_status_idx").on(table.status),
		index("news_category_id_idx").on(table.categoryId),
		index("news_created_at_idx").on(table.createdAt),
	],
);

export const newsRelations = relations(news, ({ one }) => ({
	author: one(user, {
		fields: [news.authorId],
		references: [user.id],
	}),
	category: one(newsCategory, {
		fields: [news.categoryId],
		references: [newsCategory.id],
	}),
}));
