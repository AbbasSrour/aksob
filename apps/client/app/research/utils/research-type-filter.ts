import {
	createFilterDefinition,
	type FacetContext,
} from "@aksob/ui/components/data-table/utils/facets";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { researchTypeOptions } from "@/app/research/constants/research-type-options";
import type { Research } from "@/app/research/hooks/api/research.functions";
import type { ListResearchQueryParams } from "@/app/research/hooks/api/research.queries";
import { m } from "@/paraglide/messages";

type ResearchTypeConditions = Pick<ListResearchQueryParams, "researchType">;

export const researchTypeFilter = createFilterDefinition({
	id: "researchType",
	title: m.research_table_column_type(),
	options: researchTypeOptions,
	searchParam: "researchType",
	multi: false,
	getValue: (research: Research) => research.researchType,
	toConditions: (columnFilters: ColumnFiltersState): ResearchTypeConditions => {
		const filter = columnFilters.find((f) => f.id === "researchType")
			?.value as string[];
		const researchType = Array.isArray(filter) ? filter[0] : filter;
		return researchType ? { researchType } : {};
	},
	buildFacetQuery: (
		ctx: FacetContext<ListResearchQueryParams, ResearchTypeConditions>,
	) => ({
		search: ctx.searchValue,
		pageSize: 1,
		researchType: ctx.optionValue,
		...ctx.conditions,
	}),
});
