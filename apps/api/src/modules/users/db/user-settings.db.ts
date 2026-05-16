import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "@/modules/users/db/user.db";

export const userSettings = sqliteTable("user_settings", {
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	emailVisible: integer("email_visible", { mode: "boolean" })
		.default(false)
		.notNull(),
	phoneNumberVisible: integer("phone_number_visible", { mode: "boolean" })
		.default(false)
		.notNull(),
	isVisibleInGalaxy: integer("is_visible_in_galaxy", { mode: "boolean" })
		.default(true)
		.notNull(),
	embedding: text("embedding"),
});
