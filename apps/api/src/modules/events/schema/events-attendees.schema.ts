import { t } from "elysia";
import { eventAttendeeStatusEnum } from "@/modules/events/constant/event-attendee-statuses.constant";

export const registerEventBody = t.Object({
	showInAttendeeList: t.Optional(t.Boolean()),
});

export const attendeeVisibilityBody = t.Object({
	show: t.Boolean(),
});

export const updateAttendeeBody = t.Object({
	status: t.Union([
		t.Literal(eventAttendeeStatusEnum.approved),
		t.Literal(eventAttendeeStatusEnum.rejected),
	]),
});

export const listAttendeesQuery = t.Object({
	page: t.Optional(t.Numeric({ minimum: 1 })),
	limit: t.Optional(t.Numeric({ minimum: 1, maximum: 50 })),
	status: t.Optional(t.Enum(eventAttendeeStatusEnum)),
});

export const checkInBody = t.Object({
	ticketToken: t.String({ minLength: 1 }),
});
