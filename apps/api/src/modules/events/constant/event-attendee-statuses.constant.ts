export const eventAttendeeStatuses = [
	"pending",
	"approved",
	"rejected",
	"cancelled",
	"waitlisted",
] as const;

export type EventAttendeeStatus = (typeof eventAttendeeStatuses)[number];

export const eventAttendeeStatusEnum = Object.fromEntries(
	eventAttendeeStatuses.map((status) => [status, status]),
) as Record<EventAttendeeStatus, EventAttendeeStatus>;
