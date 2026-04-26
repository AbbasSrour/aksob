import { relations, sql } from "drizzle-orm";
import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { conversationParticipant } from "./conversation-participant.db";
import { message } from "./message.db";

export const conversation = sqliteTable(
	"conversation",
	{
		id: text("id").primaryKey(),
		dmKey: text("dm_key").notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [uniqueIndex("conversation_dm_key_unique").on(table.dmKey)],
);

export const conversationRelations = relations(conversation, ({ many }) => ({
	participants: many(conversationParticipant),
	messages: many(message),
}));
