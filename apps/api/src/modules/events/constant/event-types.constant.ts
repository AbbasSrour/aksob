export const eventTypes = ["in_person", "online", "hybrid"] as const;

export type EventType = (typeof eventTypes)[number];

export const eventTypeEnum = Object.fromEntries(
	eventTypes.map((type) => [type, type]),
) as Record<EventType, EventType>;
