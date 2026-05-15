import { t } from "elysia";
import { eventRegistrationModeEnum } from "@/modules/events/constant/event-registration-modes.constant";
import { eventTypeEnum } from "@/modules/events/constant/event-types.constant";
import { surveyEntry } from "@/modules/events/schema/events-actions.schema";

export const createEventBody = t.Object({
	title: t.String({ minLength: 1 }),
	description: t.String({ minLength: 1 }),
	coverImage: t.Optional(t.String({ format: "uri" })),
	eventType: t.Enum(eventTypeEnum),
	location: t.Optional(t.String({ minLength: 1 })),
	meetingPlatform: t.Optional(t.String({ minLength: 1 })),
	meetingUrl: t.Optional(t.String({ format: "uri" })),
	startDate: t.String({ minLength: 1 }),
	endDate: t.String({ minLength: 1 }),
	requiresRegistration: t.Optional(t.Boolean()),
	registrationDeadline: t.Optional(t.String({ minLength: 1 })),
	registrationMode: t.Optional(t.Enum(eventRegistrationModeEnum)),
	capacity: t.Optional(t.Number({ minimum: 1 })),
	checkInEnabled: t.Optional(t.Boolean()),
	remindersEnabled: t.Optional(t.Boolean()),
	attendeeListVisible: t.Optional(t.Boolean()),
	organizerId: t.Optional(t.String()),
	surveys: t.Optional(t.Array(surveyEntry)),
});
