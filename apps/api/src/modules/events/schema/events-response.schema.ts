import { t } from "elysia";
import { eventAttendeeStatusEnum } from "@/modules/events/constant/event-attendee-statuses.constant";
import { eventRegistrationModeEnum } from "@/modules/events/constant/event-registration-modes.constant";
import { eventStatusEnum } from "@/modules/events/constant/event-statuses.constant";
import { eventSurveyAudienceEnum } from "@/modules/events/constant/event-survey-audiences.constant";
import { eventTypeEnum } from "@/modules/events/constant/event-types.constant";
import { paginatedListResponse } from "@/utils/paginate";

const eventOwnerSchema = t.Object({
	id: t.String(),
	name: t.String(),
	image: t.Union([t.String(), t.Null()]),
});

export const eventSchema = t.Object({
	id: t.String(),
	title: t.String(),
	description: t.String(),
	coverImage: t.Union([t.String(), t.Null()]),
	eventType: t.Enum(eventTypeEnum),
	location: t.Union([t.String(), t.Null()]),
	startDate: t.String(),
	endDate: t.String(),
	registrationDeadline: t.Union([t.String(), t.Null()]),
	requiresRegistration: t.Boolean(),
	capacity: t.Union([t.Number(), t.Null()]),
	registrationClosed: t.Boolean(),
	status: t.Enum(eventStatusEnum),
	checkInEnabled: t.Boolean(),
	remindersEnabled: t.Boolean(),
	attendeeListVisible: t.Boolean(),
	owner: t.Union([eventOwnerSchema, t.Null()]),
	createdAt: t.String(),
	updatedAt: t.String(),
});

export const eventSurveySchema = t.Object({
	id: t.String(),
	eventId: t.String(),
	audience: t.Enum(eventSurveyAudienceEnum),
	url: t.String(),
	sendAt: t.String(),
	sentAt: t.Union([t.String(), t.Null()]),
	createdAt: t.String(),
});

export const adminEventSchema = t.Object({
	id: t.String(),
	title: t.String(),
	description: t.String(),
	coverImage: t.Union([t.String(), t.Null()]),
	eventType: t.Enum(eventTypeEnum),
	location: t.Union([t.String(), t.Null()]),
	meetingPlatform: t.Union([t.String(), t.Null()]),
	meetingUrl: t.Union([t.String(), t.Null()]),
	startDate: t.String(),
	endDate: t.String(),
	registrationDeadline: t.Union([t.String(), t.Null()]),
	requiresRegistration: t.Boolean(),
	registrationMode: t.Enum(eventRegistrationModeEnum),
	capacity: t.Union([t.Number(), t.Null()]),
	registrationClosed: t.Boolean(),
	registrationClosedAt: t.Union([t.String(), t.Null()]),
	status: t.Enum(eventStatusEnum),
	rejectionReason: t.Union([t.String(), t.Null()]),
	checkInEnabled: t.Boolean(),
	remindersEnabled: t.Boolean(),
	attendeeListVisible: t.Boolean(),
	owner: t.Union([eventOwnerSchema, t.Null()]),
	surveys: t.Array(eventSurveySchema),
	createdAt: t.String(),
	updatedAt: t.String(),
});

export const eventResponseSchema = t.Object({
	status: t.Literal("ok"),
	data: eventSchema,
});

export const adminEventResponseSchema = t.Object({
	status: t.Literal("ok"),
	data: adminEventSchema,
});

export const eventErrorResponseSchema = t.Object({
	status: t.Literal("error"),
	code: t.String(),
	error: t.String(),
});

export const eventListResponse = paginatedListResponse(eventSchema);

export const attendeeUserSchema = t.Object({
	id: t.String(),
	name: t.String(),
	image: t.Union([t.String(), t.Null()]),
});

export const attendeeSchema = t.Object({
	memberId: t.String(),
	userId: t.String(),
	user: attendeeUserSchema,
	status: t.Enum(eventAttendeeStatusEnum),
	showInAttendeeList: t.Boolean(),
	checkedIn: t.Boolean(),
	checkedInAt: t.Union([t.String(), t.Null()]),
	createdAt: t.String(),
});

export const attendeeResponseSchema = t.Object({
	status: t.Literal("ok"),
	data: attendeeSchema,
});

export const attendeeListResponse = paginatedListResponse(attendeeSchema);

export const organizerMemberSchema = t.Object({
	memberId: t.String(),
	userId: t.String(),
	user: attendeeUserSchema,
	role: t.String(),
	createdAt: t.String(),
});

export const organizerMemberResponseSchema = t.Object({
	status: t.Literal("ok"),
	data: organizerMemberSchema,
});

export const checkInResponseSchema = t.Object({
	status: t.Literal("ok"),
	data: t.Object({
		memberId: t.String(),
		userId: t.String(),
		user: attendeeUserSchema,
		checkedIn: t.Boolean(),
		checkedInAt: t.String(),
	}),
});
