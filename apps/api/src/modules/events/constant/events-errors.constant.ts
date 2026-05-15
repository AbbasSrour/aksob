export const EVENT_ERRORS = {
	EVENT_NOT_FOUND: {
		code: "EVENT_NOT_FOUND",
		httpStatus: 404,
		message: "Event not found",
	},
	INVALID_DATES: {
		code: "INVALID_DATES",
		httpStatus: 400,
		message: "Start date must be before end date",
	},
	INVALID_REGISTRATION_DEADLINE: {
		code: "INVALID_REGISTRATION_DEADLINE",
		httpStatus: 400,
		message: "Registration deadline must be before start date",
	},
	LOCATION_REQUIRED: {
		code: "LOCATION_REQUIRED",
		httpStatus: 400,
		message: "Location is required for in-person and hybrid events",
	},
	MEETING_URL_REQUIRED: {
		code: "MEETING_URL_REQUIRED",
		httpStatus: 400,
		message: "Meeting URL is required for online and hybrid events",
	},
	ADMIN_ONLY: {
		code: "ADMIN_ONLY",
		httpStatus: 403,
		message: "Only admins can perform this action",
	},
	NOT_OWNER: {
		code: "NOT_OWNER",
		httpStatus: 403,
		message: "Only the event owner or an admin can perform this action",
	},
	CANNOT_DELETE: {
		code: "CANNOT_DELETE",
		httpStatus: 403,
		message: "Only draft events can be deleted by the owner",
	},
	USER_NOT_FOUND: {
		code: "USER_NOT_FOUND",
		httpStatus: 404,
		message: "Assigned organizer user not found",
	},
	NOT_DRAFT: {
		code: "NOT_DRAFT",
		httpStatus: 400,
		message: "Only draft events can be submitted for review",
	},
	NOT_PENDING_REVIEW: {
		code: "NOT_PENDING_REVIEW",
		httpStatus: 400,
		message: "Event is not pending review",
	},
	CANNOT_CANCEL: {
		code: "CANNOT_CANCEL",
		httpStatus: 400,
		message: "Only approved or in-progress events can be cancelled",
	},
	REGISTRATION_ALREADY_CLOSED: {
		code: "REGISTRATION_ALREADY_CLOSED",
		httpStatus: 400,
		message: "Registration is already closed",
	},
	NOT_ORGANIZER: {
		code: "NOT_ORGANIZER",
		httpStatus: 403,
		message: "Only an event organizer or admin can perform this action",
	},
	REGISTRATION_NOT_REQUIRED: {
		code: "REGISTRATION_NOT_REQUIRED",
		httpStatus: 400,
		message: "This event does not require registration",
	},
	REGISTRATION_DEADLINE_PASSED: {
		code: "REGISTRATION_DEADLINE_PASSED",
		httpStatus: 400,
		message: "Registration deadline has passed",
	},
	REGISTRATION_NOT_OPEN: {
		code: "REGISTRATION_NOT_OPEN",
		httpStatus: 400,
		message:
			"Registration is only open for approved or in-progress events that have not ended",
	},
	ALREADY_REGISTERED: {
		code: "ALREADY_REGISTERED",
		httpStatus: 409,
		message: "You are already registered for this event",
	},
	ALREADY_ORGANIZER: {
		code: "ALREADY_ORGANIZER",
		httpStatus: 409,
		message: "Event organizers cannot register as attendees",
	},
	NOT_REGISTERED: {
		code: "NOT_REGISTERED",
		httpStatus: 404,
		message: "You are not registered for this event",
	},
	ATTENDEE_LIST_HIDDEN: {
		code: "ATTENDEE_LIST_HIDDEN",
		httpStatus: 400,
		message: "The attendee list is not visible for this event",
	},
	ATTENDEE_NOT_FOUND: {
		code: "ATTENDEE_NOT_FOUND",
		httpStatus: 404,
		message: "Attendee not found",
	},
	NOT_ATTENDEE: {
		code: "NOT_ATTENDEE",
		httpStatus: 400,
		message: "This member is not an attendee",
	},
	REGISTRATION_FULL: {
		code: "REGISTRATION_FULL",
		httpStatus: 400,
		message: "Event is at full capacity",
	},
	ALREADY_CHECKED_IN: {
		code: "ALREADY_CHECKED_IN",
		httpStatus: 409,
		message: "Already checked in",
	},
	INVALID_TICKET_TOKEN: {
		code: "INVALID_TICKET_TOKEN",
		httpStatus: 404,
		message: "Invalid or expired ticket token",
	},
	ALREADY_ORGANIZER_MEMBER: {
		code: "ALREADY_ORGANIZER_MEMBER",
		httpStatus: 409,
		message: "User is already an organizer on this event",
	},
	CANNOT_REMOVE_OWNER: {
		code: "CANNOT_REMOVE_OWNER",
		httpStatus: 400,
		message: "Cannot remove the event owner",
	},
	NOT_ORGANIZER_MEMBER: {
		code: "NOT_ORGANIZER_MEMBER",
		httpStatus: 404,
		message: "User is not an organizer on this event",
	},
} as const;
