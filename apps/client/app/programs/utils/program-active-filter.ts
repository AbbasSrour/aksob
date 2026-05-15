import type { ColumnFiltersState } from "@tanstack/react-table";
import {
	type FacetContext,
	createFilterDefinition,
} from "@aksob/ui/components/data-table/utils/facets";
import { programActiveTypes } from "@/app/programs/constants/program-active-types";
import type { Program } from "@/app/programs/hooks/api/programs.functions";
import { m } from "@/paraglide/messages";

type ActiveConditions = Record<string, never>; // programs have no search params for active filter

export const programActiveFilter = createFilterDefinition({
	id: "isActive",
	title: m.programs_table_column_status(),
	options: programActiveTypes,
	searchParam: "isActive",
	multi: false,
	getValue: (program: Program) => (program.isActive ? "active" : "inactive"),
	toConditions: (_columnFilters: ColumnFiltersState): ActiveConditions => {
		return {};
	},
	buildFacetQuery: (ctx: FacetContext<Record<string, never>, ActiveConditions>) =>
		programActiveTypes.map((option) => ({
			optionValue: option.value,
			...ctx,
		})),
});
