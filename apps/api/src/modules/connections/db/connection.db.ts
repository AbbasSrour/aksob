import { sql } from "drizzle-orm";
import {
	index,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { CONNECTION_STATUSES } from "@/modules/connections/constant/connection-statuses.constant";
import { CONNECTION_TYPES } from "@/modules/connections/constant/connection-types.constant";
import { user } from "@/modules/users/db/user.db";

export const connection = sqliteTable(
	"connection",
	{
		id: text("id").primaryKey(),
		type: text("type", { enum: CONNECTION_TYPES }).notNull(),
		requesterId: text("requester_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		matchedUserId: text("matched_user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		status: text("status", { enum: CONNECTION_STATUSES })
			.default("pending")
			.notNull(),
		message: text("message"),
		matchExplanation: text("match_explanation"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("conn_requester_idx").on(table.requesterId),
		index("conn_matched_user_idx").on(table.matchedUserId),
		index("conn_type_idx").on(table.type),
		index("conn_status_idx").on(table.status),
	],
);
