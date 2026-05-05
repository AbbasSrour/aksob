import {
	createFilterDefinition,
	type FacetContext,
} from "@aksob/ui/components/data-table/utils/facets";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { researchStatusOptions } from "@/app/research/constants/research-status-options";
import type { Research } from "@/app/research/hooks/api/research.functions";
import type { ListResearchQueryParams } from "@/app/research/hooks/api/research.queries";
import { m } from "@/paraglide/messages";

type StatusConditions = Pick<ListResearchQueryParams, "status">;

export const researchStatusFilter = createFilterDefinition({
	id: "status",
	title: m.research_table_column_status(),
	options: researchStatusOptions,
	searchParam: "status",
	multi: false,
	getValue: (research: Research) => research.status,
	toConditions: (columnFilters: ColumnFiltersState): StatusConditions => {
		const filter = columnFilters.find((f) => f.id === "status")
			?.value as string[];
		const status = Array.isArray(filter) ? filter[0] : filter;
		return status ? { status } : {};
	},
	buildFacetQuery: (
		ctx: FacetContext<ListResearchQueryParams, StatusConditions>,
	) => ({
		search: ctx.searchValue,
		pageSize: 1,
		status: ctx.optionValue,
		...ctx.conditions,
	}),
});
