import {
	sqliteTable,
	AnySQLiteColumn,
	index,
	foreignKey,
	text,
	integer,
	uniqueIndex,
	real,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const account = sqliteTable(
	"account",
	{
		id: text().primaryKey().notNull(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: integer("access_token_expires_at"),
		refreshTokenExpiresAt: integer("refresh_token_expires_at"),
		scope: text(),
		password: text(),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at").notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const session = sqliteTable(
	"session",
	{
		id: text().primaryKey().notNull(),
		expiresAt: integer("expires_at").notNull(),
		token: text().notNull(),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at").notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		impersonatedBy: text("impersonated_by"),
	},
	(table) => [
		index("session_userId_idx").on(table.userId),
		uniqueIndex("session_token_unique").on(table.token),
	],
);

export const user = sqliteTable(
	"user",
	{
		id: text().primaryKey().notNull(),
		name: text().notNull(),
		email: text().notNull(),
		emailVerified: integer("email_verified").default(false).notNull(),
		image: text(),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		role: text(),
		banned: integer().default(false),
		banReason: text("ban_reason"),
		banExpires: integer("ban_expires"),
		phoneNumber: text("phone_number"),
		phoneNumberVerified: integer("phone_number_verified"),
		userType: text("user_type").default("student").notNull(),
		major: text(),
		company: text(),
		title: text(),
	},
	(table) => [
		uniqueIndex("user_phone_number_unique").on(table.phoneNumber),
		uniqueIndex("user_email_unique").on(table.email),
	],
);

export const verification = sqliteTable(
	"verification",
	{
		id: text().primaryKey().notNull(),
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: integer("expires_at").notNull(),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const conversation = sqliteTable(
	"conversation",
	{
		id: text().primaryKey().notNull(),
		dmKey: text("dm_key").notNull(),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [uniqueIndex("conversation_dm_key_unique").on(table.dmKey)],
);

export const conversationParticipant = sqliteTable(
	"conversation_participant",
	{
		id: text().primaryKey().notNull(),
		conversationId: text("conversation_id")
			.notNull()
			.references(() => conversation.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		uniqueIndex("conversation_participant_conversation_user_unique").on(
			table.conversationId,
			table.userId,
		),
		index("conversation_participant_userId_idx").on(table.userId),
		index("conversation_participant_conversationId_idx").on(
			table.conversationId,
		),
	],
);

export const message = sqliteTable(
	"message",
	{
		id: text().primaryKey().notNull(),
		conversationId: text("conversation_id")
			.notNull()
			.references(() => conversation.id, { onDelete: "cascade" }),
		senderId: text("sender_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		content: text().notNull(),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		index("message_conversation_createdAt_idx").on(
			table.conversationId,
			table.createdAt,
		),
		index("message_senderId_idx").on(table.senderId),
		index("message_conversationId_idx").on(table.conversationId),
	],
);

export const story = sqliteTable(
	"story",
	{
		id: text().primaryKey().notNull(),
		title: text().notNull(),
		description: text().notNull(),
		content: text().notNull(),
		category: text().notNull(),
		storyDate: integer("story_date").notNull(),
		status: text().default("pending").notNull(),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		reviewedBy: text("reviewed_by").references(() => user.id),
		reviewNotes: text("review_notes"),
		reviewedAt: integer("reviewed_at"),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		coverImage: text("cover_image"),
		thumbnailImage: text("thumbnail_image"),
	},
	(table) => [
		index("story_created_at_idx").on(table.createdAt),
		index("story_category_idx").on(table.category),
		index("story_status_idx").on(table.status),
		index("story_author_id_idx").on(table.authorId),
	],
);

export const major = sqliteTable(
	"major",
	{
		id: text().primaryKey().notNull(),
		name: text().notNull(),
		description: text(),
		credits: integer(),
		duration: real(),
		isActive: integer("is_active").default(true).notNull(),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		index("major_name_idx").on(table.name),
		index("major_is_active_idx").on(table.isActive),
		uniqueIndex("major_name_unique").on(table.name),
	],
);

export const opportunity = sqliteTable("opportunity", {
	id: text().primaryKey().notNull(),
	type: text().notNull(),
	company: text().notNull(),
	contactEmail: text("contact_email"),
	applyUrl: text("apply_url"),
	authorId: text("author_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	status: text().default("pending").notNull(),
	reviewedBy: text("reviewed_by").references(() => user.id),
	reviewNotes: text("review_notes"),
	reviewedAt: integer("reviewed_at"),
	createdAt: integer("created_at")
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at")
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
});

export const research = sqliteTable("research", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	researchType: text("research_type").notNull(),
	institution: text().notNull(),
	department: text(),
	duration: text(),
	funding: text(),
	location: text(),
	startDate: integer("start_date"),
	deadline: integer(),
	educationLevel: text("education_level"),
	fieldOfStudy: text("field_of_study"),
	experienceRequired: text("experience_required"),
	skillsRequired: text("skills_required"),
	additionalRequirements: text("additional_requirements"),
	status: text().default("pending").notNull(),
	rejectionReason: text("rejection_reason"),
	authorId: text("author_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	reviewedBy: text("reviewed_by").references(() => user.id),
	reviewedAt: integer("reviewed_at"),
	createdAt: integer("created_at")
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at")
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
});

export const news = sqliteTable(
	"news",
	{
		id: text().primaryKey().notNull(),
		title: text().notNull(),
		excerpt: text().notNull(),
		content: text().notNull(),
		coverImage: text("cover_image"),
		readTime: integer("read_time"),
		status: text().default("draft").notNull(),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		categoryId: text("category_id").references(() => newsCategory.id, {
			onDelete: "set null",
		}),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		publishedAt: integer("published_at"),
		date: integer(),
		thumbnailImage: text("thumbnail_image"),
	},
	(table) => [
		index("news_created_at_idx").on(table.createdAt),
		index("news_category_id_idx").on(table.categoryId),
		index("news_status_idx").on(table.status),
		index("news_author_id_idx").on(table.authorId),
	],
);

export const newsCategory = sqliteTable(
	"news_category",
	{
		id: text().primaryKey().notNull(),
		name: text().notNull(),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [uniqueIndex("news_category_name_unique").on(table.name)],
);

export const event = sqliteTable(
	"event",
	{
		id: text().primaryKey().notNull(),
		title: text().notNull(),
		description: text().notNull(),
		coverImage: text("cover_image"),
		eventType: text("event_type").notNull(),
		location: text(),
		meetingPlatform: text("meeting_platform"),
		meetingUrl: text("meeting_url"),
		startDate: integer("start_date").notNull(),
		endDate: integer("end_date").notNull(),
		registrationDeadline: integer("registration_deadline"),
		requiresRegistration: integer("requires_registration")
			.default(true)
			.notNull(),
		registrationMode: text("registration_mode").default("open").notNull(),
		capacity: integer(),
		registrationClosed: integer("registration_closed").default(false).notNull(),
		registrationClosedAt: integer("registration_closed_at"),
		status: text().default("draft").notNull(),
		rejectionReason: text("rejection_reason"),
		checkInEnabled: integer("check_in_enabled").default(false).notNull(),
		remindersEnabled: integer("reminders_enabled").default(true).notNull(),
		attendeeListVisible: integer("attendee_list_visible")
			.default(false)
			.notNull(),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		index("event_registration_deadline_idx").on(table.registrationDeadline),
		index("event_end_date_idx").on(table.endDate),
		index("event_start_date_idx").on(table.startDate),
		index("event_status_idx").on(table.status),
	],
);

export const eventAttendee = sqliteTable(
	"event_attendee",
	{
		memberId: text("member_id")
			.primaryKey()
			.notNull()
			.references(() => eventMember.id, { onDelete: "cascade" }),
		status: text().default("pending").notNull(),
		showInAttendeeList: integer("show_in_attendee_list")
			.default(true)
			.notNull(),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [index("event_attendee_status_idx").on(table.status)],
);

export const eventMember = sqliteTable(
	"event_member",
	{
		id: text().primaryKey().notNull(),
		eventId: text("event_id")
			.notNull()
			.references(() => event.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text().default("attendee").notNull(),
		ticketToken: text("ticket_token"),
		checkedIn: integer("checked_in").default(false).notNull(),
		checkedInAt: integer("checked_in_at"),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		uniqueIndex("event_member_event_user_role_unique").on(
			table.eventId,
			table.userId,
			table.role,
		),
		index("event_member_ticket_token_idx").on(table.ticketToken),
		index("event_member_role_idx").on(table.role),
		index("event_member_user_id_idx").on(table.userId),
		index("event_member_event_id_idx").on(table.eventId),
		uniqueIndex("event_member_ticket_token_unique").on(table.ticketToken),
	],
);

export const eventOrganizer = sqliteTable("event_organizer", {
	memberId: text("member_id")
		.primaryKey()
		.notNull()
		.references(() => eventMember.id, { onDelete: "cascade" }),
	createdAt: integer("created_at")
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
});

export const eventReminder = sqliteTable(
	"event_reminder",
	{
		id: text().primaryKey().notNull(),
		eventId: text("event_id")
			.notNull()
			.references(() => event.id, { onDelete: "cascade" }),
		sendAt: integer("send_at").notNull(),
		sentAt: integer("sent_at"),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		uniqueIndex("event_reminder_event_send_at_unique").on(
			table.eventId,
			table.sendAt,
		),
		index("event_reminder_sent_at_idx").on(table.sentAt),
		index("event_reminder_send_at_idx").on(table.sendAt),
		index("event_reminder_event_id_idx").on(table.eventId),
	],
);

export const eventSurvey = sqliteTable(
	"event_survey",
	{
		id: text().primaryKey().notNull(),
		eventId: text("event_id")
			.notNull()
			.references(() => event.id, { onDelete: "cascade" }),
		audience: text().notNull(),
		url: text().notNull(),
		sendAt: integer("send_at").notNull(),
		sentAt: integer("sent_at"),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		uniqueIndex("event_survey_event_audience_unique").on(
			table.eventId,
			table.audience,
		),
		index("event_survey_sent_at_idx").on(table.sentAt),
		index("event_survey_send_at_idx").on(table.sendAt),
		index("event_survey_audience_idx").on(table.audience),
		index("event_survey_event_id_idx").on(table.eventId),
	],
);
