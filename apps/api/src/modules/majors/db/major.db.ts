import { sql } from "drizzle-orm";
import {
	index,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

export const major = sqliteTable(
	"major",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull().unique(),
		description: text("description"),
		credits: integer("credits"),
		duration: real("duration"),
		isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("major_is_active_idx").on(table.isActive),
		index("major_name_idx").on(table.name),
	],
);
