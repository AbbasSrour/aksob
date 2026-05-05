import {
	createFilterDefinition,
	type FacetContext,
} from "@aksob/ui/components/data-table/utils/facets";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { storyStatusOptions } from "@/app/stories/constants/story-status-options";
import type { Story } from "@/app/stories/hooks/api/stories.functions";
import type { ListStoriesQueryParams } from "@/app/stories/hooks/api/stories.queries";
import { m } from "@/paraglide/messages";

type StatusConditions = Pick<ListStoriesQueryParams, "status">;

export const storyStatusFilter = createFilterDefinition({
	id: "status",
	title: m.stories_table_column_status(),
	options: storyStatusOptions,
	searchParam: "status",
	multi: false,
	getValue: (story: Story) => story.status,
	toConditions: (columnFilters: ColumnFiltersState): StatusConditions => {
		const statusFilter = columnFilters.find((f) => f.id === "status")
			?.value as string[];
		const status = Array.isArray(statusFilter) ? statusFilter[0] : statusFilter;
		return status ? { status } : {};
	},
	buildFacetQuery: (
		ctx: FacetContext<ListStoriesQueryParams, StatusConditions>,
	) => ({
		search: ctx.searchValue,
		pageSize: 1,
		status: ctx.optionValue,
		...ctx.conditions,
	}),
});
