import { buildFacetCountsMap } from "@aksob/ui/components/data-table/utils/facets";
import { useSearch } from "@aksob/ui/hooks/search";
import { useQueries } from "@tanstack/react-query";
import type { ColumnFiltersState, Table } from "@tanstack/react-table";
import { getFacetedUniqueValues } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import type { NewsArticle } from "@/app/news/hooks/api/news.functions";
import { newsQueries } from "@/app/news/hooks/api/news.queries";
import { newsStatusFilter } from "@/app/news/utils/news-status-filter";

type UseNewsFacetsValueArgs = {
	columnFilters: ColumnFiltersState;
};

export const useNewsFacetsValue = ({
	columnFilters,
}: UseNewsFacetsValueArgs) => {
	const { searchValue } = useSearch();
	const statusConditions = newsStatusFilter.toConditions(columnFilters);

	const facetQueries = useQueries({
		queries: [
			...newsStatusFilter
				.facetQueries({
					searchValue,
					otherFilters: statusConditions,
				})
				.map((query) => newsQueries.list(query)),
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
						columnId: newsStatusFilter.id,
						options: newsStatusFilter.options,
					},
				],
				facetQueries,
			),
		[facetQueries],
	);

	const getServerFacetedUniqueValues = useCallback(
		(_: Table<NewsArticle>, columnId: string) => () =>
			facetCountsMap.get(columnId) ?? new Map<string, number>(),
		[facetCountsMap],
	);

	const getCoreFacetedUniqueValues = useMemo(
		() => getFacetedUniqueValues<NewsArticle>(),
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
