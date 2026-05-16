import {
	createFilterDefinition,
	type FacetContext,
} from "@aksob/ui/components/data-table/utils/facets";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { eventStatusOptions } from "@/app/events/constants/event-status-options";
import type { EventItem } from "@/app/events/hooks/api/events.functions";
import type { ListEventsQueryParams } from "@/app/events/hooks/api/events.queries";

type StatusConditions = Pick<ListEventsQueryParams, "status">;

export const eventStatusFilter = createFilterDefinition({
	id: "status",
	title: "Status",
	options: eventStatusOptions,
	searchParam: "status",
	multi: false,
	getValue: (event: EventItem) => event.status,
	toConditions: (columnFilters: ColumnFiltersState): StatusConditions => {
		const statusFilter = columnFilters.find((f) => f.id === "status")
			?.value as string[];
		const status = Array.isArray(statusFilter) ? statusFilter[0] : statusFilter;
		return status ? { status } : {};
	},
	buildFacetQuery: (
		ctx: FacetContext<ListEventsQueryParams, StatusConditions>,
	) => ({
		search: ctx.searchValue,
		pageSize: 1,
		status: ctx.optionValue,
		...ctx.conditions,
	}),
});
