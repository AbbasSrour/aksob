import { t } from "elysia";
import { eventRegistrationModeEnum } from "@/modules/events/constant/event-registration-modes.constant";
import { eventTypeEnum } from "@/modules/events/constant/event-types.constant";
import { surveyEntry } from "@/modules/events/schema/events-actions.schema";

const nullableString = t.Union([t.String({ minLength: 1 }), t.Null()]);

export const updateEventBody = t.Object({
	title: t.Optional(t.String({ minLength: 1 })),
	description: t.Optional(t.String({ minLength: 1 })),
	coverImage: t.Optional(t.Union([t.String({ format: "uri" }), t.Null()])),
	eventType: t.Optional(t.Enum(eventTypeEnum)),
	location: t.Optional(nullableString),
	meetingPlatform: t.Optional(nullableString),
	meetingUrl: t.Optional(t.Union([t.String({ format: "uri" }), t.Null()])),
	startDate: t.Optional(t.String({ minLength: 1 })),
	endDate: t.Optional(t.String({ minLength: 1 })),
	requiresRegistration: t.Optional(t.Boolean()),
	registrationDeadline: t.Optional(nullableString),
	registrationMode: t.Optional(t.Enum(eventRegistrationModeEnum)),
	capacity: t.Optional(t.Union([t.Number({ minimum: 1 }), t.Null()])),
	checkInEnabled: t.Optional(t.Boolean()),
	remindersEnabled: t.Optional(t.Boolean()),
	attendeeListVisible: t.Optional(t.Boolean()),
	notifyAttendees: t.Optional(t.Boolean()),
	surveys: t.Optional(t.Array(surveyEntry)),
});
