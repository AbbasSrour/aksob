import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/config/env";
import * as accountSchema from "@/modules/auth/db/account.db";
import * as sessionSchema from "@/modules/auth/db/session.db";
import * as verificationSchema from "@/modules/auth/db/verification.db";
import * as conversationSchema from "@/modules/chat/db/conversation.db";
import * as conversationParticipantSchema from "@/modules/chat/db/conversation-participant.db";
import * as messageSchema from "@/modules/chat/db/message.db";
import * as userSchema from "@/modules/users/db/user.db";

const schema = {
	...userSchema,
	...sessionSchema,
	...accountSchema,
	...verificationSchema,
	...conversationSchema,
	...conversationParticipantSchema,
	...messageSchema,
};

const client = createClient({
	url: env.DATABASE_URL,
	authToken: env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;

export { schema };
