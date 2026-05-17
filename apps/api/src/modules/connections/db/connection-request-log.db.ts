import {
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { user } from "@/modules/users/db/user.db";

export const connectionRequestLog = sqliteTable(
	"connection_request_log",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		requestDate: text("request_date").notNull(),
		count: integer("count").notNull().default(1),
	},
	(table) => [primaryKey({ columns: [table.userId, table.requestDate] })],
);
