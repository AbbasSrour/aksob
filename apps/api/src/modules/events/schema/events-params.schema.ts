import { t } from "elysia";
import { eventListFilterEnum } from "@/modules/events/constant/event-list-filters.constant";
import { eventStatusEnum } from "@/modules/events/constant/event-statuses.constant";

const eventPageOptions = t.Object({
	page: t.Optional(t.Numeric({ minimum: 1 })),
	limit: t.Optional(t.Numeric({ minimum: 1, maximum: 50 })),
});

const eventListOptions = t.Object({
	filter: t.Optional(t.Enum(eventListFilterEnum)),
	userId: t.Optional(t.String()),
	status: t.Optional(t.Enum(eventStatusEnum)),
	search: t.Optional(t.String()),
});

export const listEventsQuery = t.Composite([
	eventPageOptions,
	eventListOptions,
]);
