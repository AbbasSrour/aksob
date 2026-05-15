import { sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";
import { user } from "@/modules/users/db/user.db";
import { CONNECTION_TYPES } from "@/modules/connections/constant/connection-types.constant";

export const userConnectionPreference = sqliteTable(
	"user_connection_preference",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: text("type", { enum: CONNECTION_TYPES }).notNull(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.type] })],
);
