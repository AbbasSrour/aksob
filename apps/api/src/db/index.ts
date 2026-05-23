import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/config/env";
import * as accountSchema from "@/modules/auth/db/account.db";
import * as sessionSchema from "@/modules/auth/db/session.db";
import * as verificationSchema from "@/modules/auth/db/verification.db";
import * as conversationSchema from "@/modules/chat/db/conversation.db";
import * as conversationParticipantSchema from "@/modules/chat/db/conversation-participant.db";
import * as messageSchema from "@/modules/chat/db/message.db";
import * as connectionSchema from "@/modules/connections/db/connection.db";
import * as connectionRequestLogSchema from "@/modules/connections/db/connection-request-log.db";
import * as connectionPreferenceSchema from "@/modules/connections/db/user-connection-preference.db";
import * as donorSchema from "@/modules/donors/db/donor.db";
import * as eventSchema from "@/modules/events/db/event.db";
import * as newsSchema from "@/modules/news/db/news.db";
import * as opportunitySchema from "@/modules/opportunities/db/opportunity.db";
import * as programSchema from "@/modules/programs/db/program.db";
import * as researchSchema from "@/modules/research/db/research.db";
import * as storySchema from "@/modules/stories/db/story.db";
import * as alumniProfileSchema from "@/modules/users/db/alumni-profile.db";
import * as experienceSchema from "@/modules/users/db/experience.db";
import * as facultyProfileSchema from "@/modules/users/db/faculty-profile.db";
import * as linksSchema from "@/modules/users/db/links.db";
import * as studentProfileSchema from "@/modules/users/db/student-profile.db";
import * as userSchema from "@/modules/users/db/user.db";
import * as userEducationSchema from "@/modules/users/db/user-education.db";
import * as userSettingsSchema from "@/modules/users/db/user-settings.db";
import * as userTagSchema from "@/modules/users/db/user-tag.db";

const schema = {
	...userSchema,
	...userEducationSchema,
	...userTagSchema,
	...experienceSchema,
	...userSettingsSchema,
	...studentProfileSchema,
	...alumniProfileSchema,
	...facultyProfileSchema,
	...linksSchema,
	...sessionSchema,
	...accountSchema,
	...verificationSchema,
	...conversationSchema,
	...conversationParticipantSchema,
	...messageSchema,
	...connectionSchema,
	...connectionPreferenceSchema,
	...connectionRequestLogSchema,
	...eventSchema,
	...storySchema,
	...programSchema,
	...newsSchema,
	...opportunitySchema,
	...researchSchema,
	...donorSchema,
};

const client = createClient({
	url: env.DATABASE_URL,
	authToken: env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;

export { schema };
