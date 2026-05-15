import { relations, sql } from "drizzle-orm";
import {
	index,
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { eventAttendeeStatuses } from "@/modules/events/constant/event-attendee-statuses.constant";
import { eventMemberRoles } from "@/modules/events/constant/event-member-roles.constant";
import { eventRegistrationModes } from "@/modules/events/constant/event-registration-modes.constant";
import { eventStatuses } from "@/modules/events/constant/event-statuses.constant";
import { eventSurveyAudiences } from "@/modules/events/constant/event-survey-audiences.constant";
import { eventTypes } from "@/modules/events/constant/event-types.constant";
import { user } from "@/modules/users/db/user.db";

export const event = sqliteTable(
	"event",
	{
		id: text("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description").notNull(),
		coverImage: text("cover_image"),
		eventType: text("event_type", { enum: eventTypes }).notNull(),
		location: text("location"),
		meetingPlatform: text("meeting_platform"),
		meetingUrl: text("meeting_url"),
		startDate: integer("start_date", { mode: "timestamp_ms" }).notNull(),
		endDate: integer("end_date", { mode: "timestamp_ms" }).notNull(),
		registrationDeadline: integer("registration_deadline", {
			mode: "timestamp_ms",
		}),
		requiresRegistration: integer("requires_registration", { mode: "boolean" })
			.default(true)
			.notNull(),
		registrationMode: text("registration_mode", {
			enum: eventRegistrationModes,
		})
			.default("open")
			.notNull(),
		capacity: integer("capacity"),
		registrationClosed: integer("registration_closed", { mode: "boolean" })
			.default(false)
			.notNull(),
		registrationClosedAt: integer("registration_closed_at", {
			mode: "timestamp_ms",
		}),
		status: text("status", { enum: eventStatuses }).default("draft").notNull(),
		rejectionReason: text("rejection_reason"),
		checkInEnabled: integer("check_in_enabled", { mode: "boolean" })
			.default(false)
			.notNull(),
		remindersEnabled: integer("reminders_enabled", { mode: "boolean" })
			.default(true)
			.notNull(),
		attendeeListVisible: integer("attendee_list_visible", {
			mode: "boolean",
		})
			.default(false)
			.notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("event_status_idx").on(table.status),
		index("event_start_date_idx").on(table.startDate),
		index("event_end_date_idx").on(table.endDate),
		index("event_registration_deadline_idx").on(table.registrationDeadline),
	],
);

export const eventMember = sqliteTable(
	"event_member",
	{
		id: text("id").primaryKey(),
		eventId: text("event_id")
			.notNull()
			.references(() => event.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text("role", { enum: eventMemberRoles })
			.default("attendee")
			.notNull(),
		ticketToken: text("ticket_token").unique(),
		checkedIn: integer("checked_in", { mode: "boolean" })
			.default(false)
			.notNull(),
		checkedInAt: integer("checked_in_at", { mode: "timestamp_ms" }),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		index("event_member_event_id_idx").on(table.eventId),
		index("event_member_user_id_idx").on(table.userId),
		index("event_member_role_idx").on(table.role),
		index("event_member_ticket_token_idx").on(table.ticketToken),
		uniqueIndex("event_member_event_user_role_unique").on(
			table.eventId,
			table.userId,
			table.role,
		),
	],
);

export const eventOrganizer = sqliteTable("event_organizer", {
	memberId: text("member_id")
		.primaryKey()
		.references(() => eventMember.id, { onDelete: "cascade" }),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
});

export const eventAttendee = sqliteTable(
	"event_attendee",
	{
		memberId: text("member_id")
			.primaryKey()
			.references(() => eventMember.id, { onDelete: "cascade" }),
		status: text("status", { enum: eventAttendeeStatuses })
			.default("pending")
			.notNull(),
		showInAttendeeList: integer("show_in_attendee_list", {
			mode: "boolean",
		})
			.default(true)
			.notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("event_attendee_status_idx").on(table.status)],
);

export const eventSurvey = sqliteTable(
	"event_survey",
	{
		id: text("id").primaryKey(),
		eventId: text("event_id")
			.notNull()
			.references(() => event.id, { onDelete: "cascade" }),
		audience: text("audience", { enum: eventSurveyAudiences }).notNull(),
		url: text("url").notNull(),
		sendAt: integer("send_at", { mode: "timestamp_ms" }).notNull(),
		sentAt: integer("sent_at", { mode: "timestamp_ms" }),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		index("event_survey_event_id_idx").on(table.eventId),
		index("event_survey_audience_idx").on(table.audience),
		index("event_survey_send_at_idx").on(table.sendAt),
		index("event_survey_sent_at_idx").on(table.sentAt),
		uniqueIndex("event_survey_event_audience_unique").on(
			table.eventId,
			table.audience,
		),
	],
);

export const eventReminder = sqliteTable(
	"event_reminder",
	{
		id: text("id").primaryKey(),
		eventId: text("event_id")
			.notNull()
			.references(() => event.id, { onDelete: "cascade" }),
		sendAt: integer("send_at", { mode: "timestamp_ms" }).notNull(),
		sentAt: integer("sent_at", { mode: "timestamp_ms" }),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		index("event_reminder_event_id_idx").on(table.eventId),
		index("event_reminder_send_at_idx").on(table.sendAt),
		index("event_reminder_sent_at_idx").on(table.sentAt),
		uniqueIndex("event_reminder_event_send_at_unique").on(
			table.eventId,
			table.sendAt,
		),
	],
);

export const eventRelations = relations(event, ({ many }) => ({
	members: many(eventMember),
	reminders: many(eventReminder),
	surveys: many(eventSurvey),
}));

export const eventMemberRelations = relations(eventMember, ({ one, many }) => ({
	event: one(event, {
		fields: [eventMember.eventId],
		references: [event.id],
	}),
	user: one(user, {
		fields: [eventMember.userId],
		references: [user.id],
	}),
	organizers: many(eventOrganizer),
	attendees: many(eventAttendee),
}));

export const eventOrganizerRelations = relations(eventOrganizer, ({ one }) => ({
	member: one(eventMember, {
		fields: [eventOrganizer.memberId],
		references: [eventMember.id],
	}),
}));

export const eventAttendeeRelations = relations(eventAttendee, ({ one }) => ({
	member: one(eventMember, {
		fields: [eventAttendee.memberId],
		references: [eventMember.id],
	}),
}));

export const eventSurveyRelations = relations(eventSurvey, ({ one }) => ({
	event: one(event, {
		fields: [eventSurvey.eventId],
		references: [event.id],
	}),
}));

export const eventReminderRelations = relations(eventReminder, ({ one }) => ({
	event: one(event, {
		fields: [eventReminder.eventId],
		references: [event.id],
	}),
}));
