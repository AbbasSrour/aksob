import { buildFacetCountsMap } from "@aksob/ui/components/data-table/utils/facets";
import { useSearch } from "@aksob/ui/hooks/search";
import { useQueries } from "@tanstack/react-query";
import type { ColumnFiltersState, Table } from "@tanstack/react-table";
import { getFacetedUniqueValues } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import type { Research } from "@/app/research/hooks/api/research.functions";
import { researchQueries } from "@/app/research/hooks/api/research.queries";
import { researchStatusFilter } from "@/app/research/utils/research-status-filter";
import { researchTypeFilter } from "@/app/research/utils/research-type-filter";

type UseResearchFacetsValueArgs = {
	columnFilters: ColumnFiltersState;
};

export const useResearchFacetsValue = ({
	columnFilters,
}: UseResearchFacetsValueArgs) => {
	const { searchValue } = useSearch();
	const statusConditions = researchStatusFilter.toConditions(columnFilters);
	const typeConditions = researchTypeFilter.toConditions(columnFilters);

	const facetQueries = useQueries({
		queries: [
			...researchStatusFilter
				.facetQueries({
					searchValue,
					otherFilters: typeConditions,
				})
				.map((query) => researchQueries.list(query)),
			...researchTypeFilter
				.facetQueries({
					searchValue,
					otherFilters: statusConditions,
				})
				.map((query) => researchQueries.list(query)),
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
						columnId: researchStatusFilter.id,
						options: researchStatusFilter.options,
					},
					{
						columnId: researchTypeFilter.id,
						options: researchTypeFilter.options,
					},
				],
				facetQueries,
			),
		[facetQueries],
	);

	const getServerFacetedUniqueValues = useCallback(
		(_: Table<Research>, columnId: string) => () =>
			facetCountsMap.get(columnId) ?? new Map<string, number>(),
		[facetCountsMap],
	);

	const getCoreFacetedUniqueValues = useMemo(
		() => getFacetedUniqueValues<Research>(),
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
