import {
	createFilterDefinition,
	type FacetContext,
} from "@aksob/ui/components/data-table/utils/facets";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { opportunityTypeOptions } from "@/app/opportunities/constants/opportunity-type-options";
import type { Opportunity } from "@/app/opportunities/hooks/api/opportunities.functions";
import type { ListOpportunitiesQueryParams } from "@/app/opportunities/hooks/api/opportunities.queries";

type TypeConditions = Pick<ListOpportunitiesQueryParams, "type">;

export const opportunityTypeFilter = createFilterDefinition({
	id: "type",
	title: "Type",
	options: opportunityTypeOptions,
	searchParam: "type",
	multi: false,
	getValue: (opportunity: Opportunity) => opportunity.type,
	toConditions: (columnFilters: ColumnFiltersState): TypeConditions => {
		const typeFilter = columnFilters.find((f) => f.id === "type")
			?.value as string[];
		const type = Array.isArray(typeFilter) ? typeFilter[0] : typeFilter;
		return type ? { type } : {};
	},
	buildFacetQuery: (
		ctx: FacetContext<ListOpportunitiesQueryParams, TypeConditions>,
	) => ({
		search: ctx.searchValue,
		pageSize: 1,
		type: ctx.optionValue,
		...ctx.conditions,
	}),
});
