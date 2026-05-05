import {
	createFilterDefinition,
	type FacetContext,
} from "@aksob/ui/components/data-table/utils/facets";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { storyCategoryOptions } from "@/app/stories/constants/story-category-options";
import type { Story } from "@/app/stories/hooks/api/stories.functions";
import type { ListStoriesQueryParams } from "@/app/stories/hooks/api/stories.queries";
import { m } from "@/paraglide/messages";

type CategoryConditions = Pick<ListStoriesQueryParams, "category">;

export const storyCategoryFilter = createFilterDefinition({
	id: "category",
	title: m.stories_table_column_category(),
	options: storyCategoryOptions,
	searchParam: "category",
	multi: false,
	getValue: (story: Story) => story.category,
	toConditions: (columnFilters: ColumnFiltersState): CategoryConditions => {
		const categoryFilter = columnFilters.find((f) => f.id === "category")
			?.value as string[];
		const category = Array.isArray(categoryFilter)
			? categoryFilter[0]
			: categoryFilter;
		return category ? { category } : {};
	},
	buildFacetQuery: (
		ctx: FacetContext<ListStoriesQueryParams, CategoryConditions>,
	) => ({
		search: ctx.searchValue,
		pageSize: 1,
		category: ctx.optionValue,
		...ctx.conditions,
	}),
});
