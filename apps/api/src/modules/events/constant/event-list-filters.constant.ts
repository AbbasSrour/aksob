export const eventListFilters = ["upcoming", "current", "past"] as const;

export type EventListFilter = (typeof eventListFilters)[number];

export const eventListFilterEnum = Object.fromEntries(
	eventListFilters.map((filter) => [filter, filter]),
) as Record<EventListFilter, EventListFilter>;
