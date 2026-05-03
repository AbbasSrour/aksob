import { buildFacetCountsMap } from "@aksob/ui/components/data-table/utils/facets";
import { useSearch } from "@aksob/ui/hooks/search";
import { useQueries } from "@tanstack/react-query";
import type { ColumnFiltersState, Table } from "@tanstack/react-table";
import { getFacetedUniqueValues } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import type { Story } from "@/app/stories/hooks/api/stories.functions";
import { storyQueries } from "@/app/stories/hooks/api/stories.queries";
import { storyCategoryFilter } from "@/app/stories/utils/story-category-filter";
import { storyStatusFilter } from "@/app/stories/utils/story-status-filter";

type UseStoryFacetsValueArgs = {
	columnFilters: ColumnFiltersState;
};

export const useStoryFacetsValue = ({
	columnFilters,
}: UseStoryFacetsValueArgs) => {
	const { searchValue } = useSearch();
	const statusConditions = storyStatusFilter.toConditions(columnFilters);
	const categoryConditions = storyCategoryFilter.toConditions(columnFilters);

	const facetQueries = useQueries({
		queries: [
			...storyStatusFilter
				.facetQueries({
					searchValue,
					otherFilters: categoryConditions,
				})
				.map((query) => storyQueries.list(query)),
			...storyCategoryFilter
				.facetQueries({
					searchValue,
					otherFilters: statusConditions,
				})
				.map((query) => storyQueries.list(query)),
		],
	});

	const facetedUniqueValuesReady = facetQueries.every(
		(query) => !query.isPending,
	);

	const facetCountsMap = useMemo(
		() =>
			buildFacetCountsMap(
				[
					{
						columnId: storyStatusFilter.id,
						options: storyStatusFilter.options,
					},
					{
						columnId: storyCategoryFilter.id,
						options: storyCategoryFilter.options,
					},
				],
				facetQueries,
			),
		[facetQueries],
	);

	const getServerFacetedUniqueValues = useCallback(
		(_: Table<Story>, columnId: string) => () =>
			facetCountsMap.get(columnId) ?? new Map<string, number>(),
		[facetCountsMap],
	);

	const getCoreFacetedUniqueValues = useMemo(
		() => getFacetedUniqueValues<Story>(),
		[],
	);

	return useCallback(
		() =>
			facetedUniqueValuesReady
				? getServerFacetedUniqueValues
				: getCoreFacetedUniqueValues,
		[
			facetedUniqueValuesReady,
			getServerFacetedUniqueValues,
			getCoreFacetedUniqueValues,
		],
	);
};
