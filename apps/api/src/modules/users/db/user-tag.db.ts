import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "@/modules/users/db/user.db";

export const userTag = sqliteTable(
	"user_tag",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		category: text("category").notNull(),
		value: text("value").notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		index("user_tag_user_id_idx").on(table.userId),
		index("user_tag_category_idx").on(table.category),
	],
);
