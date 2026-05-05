import {
	createFilterDefinition,
	type FacetContext,
} from "@aksob/ui/components/data-table/utils/facets";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { opportunityStatusOptions } from "@/app/opportunities/constants/opportunity-status-options";
import type { Opportunity } from "@/app/opportunities/hooks/api/opportunities.functions";
import type { ListOpportunitiesQueryParams } from "@/app/opportunities/hooks/api/opportunities.queries";

type StatusConditions = Pick<ListOpportunitiesQueryParams, "status">;

export const opportunityStatusFilter = createFilterDefinition({
	id: "status",
	title: "Status",
	options: opportunityStatusOptions,
	searchParam: "status",
	multi: false,
	getValue: (opportunity: Opportunity) => opportunity.status,
	toConditions: (columnFilters: ColumnFiltersState): StatusConditions => {
		const statusFilter = columnFilters.find((f) => f.id === "status")
			?.value as string[];
		const status = Array.isArray(statusFilter) ? statusFilter[0] : statusFilter;
		return status ? { status } : {};
	},
	buildFacetQuery: (
		ctx: FacetContext<ListOpportunitiesQueryParams, StatusConditions>,
	) => ({
		search: ctx.searchValue,
		pageSize: 1,
		status: ctx.optionValue,
		...ctx.conditions,
	}),
});
