import type { ColumnFiltersState } from "@tanstack/react-table";
import {
	type FacetContext,
	createFilterDefinition,
} from "@aksob/ui/components/data-table/utils/facets";
import { majorActiveTypes } from "@/app/majors/constants/major-active-types";
import type { Major } from "@/app/majors/hooks/api/majors.functions";
import { m } from "@/paraglide/messages";

type ActiveConditions = Record<string, never>; // majors have no search params for active filter

export const majorActiveFilter = createFilterDefinition({
	id: "isActive",
	title: m.majors_table_column_status(),
	options: majorActiveTypes,
	searchParam: "isActive",
	multi: false,
	getValue: (major: Major) => (major.isActive ? "active" : "inactive"),
	toConditions: (_columnFilters: ColumnFiltersState): ActiveConditions => {
		return {};
	},
	buildFacetQuery: (ctx: FacetContext<Record<string, never>, ActiveConditions>) =>
		majorActiveTypes.map((option) => ({
			optionValue: option.value,
			...ctx,
		})),
});
