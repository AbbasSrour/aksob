import { relations, sql } from "drizzle-orm";
import {
	index,
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { user } from "@/modules/users/db/user.db";
import { conversation } from "./conversation.db";

export const conversationParticipant = sqliteTable(
	"conversation_participant",
	{
		id: text("id").primaryKey(),
		conversationId: text("conversation_id")
			.notNull()
			.references(() => conversation.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		index("conversation_participant_conversationId_idx").on(
			table.conversationId,
		),
		index("conversation_participant_userId_idx").on(table.userId),
		uniqueIndex("conversation_participant_conversation_user_unique").on(
			table.conversationId,
			table.userId,
		),
	],
);

export const conversationParticipantRelations = relations(
	conversationParticipant,
	({ one }) => ({
		conversation: one(conversation, {
			fields: [conversationParticipant.conversationId],
			references: [conversation.id],
		}),
		user: one(user, {
			fields: [conversationParticipant.userId],
			references: [user.id],
		}),
	}),
);
