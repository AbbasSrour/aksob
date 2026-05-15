export const eventStatuses = [
	"draft",
	"pending_review",
	"approved",
	"rejected",
	"in_progress",
	"completed",
	"cancelled",
] as const;

export type EventStatus = (typeof eventStatuses)[number];

export const eventStatusEnum = Object.fromEntries(
	eventStatuses.map((status) => [status, status]),
) as Record<EventStatus, EventStatus>;
