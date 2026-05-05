import { buildFacetCountsMap } from "@aksob/ui/components/data-table/utils/facets";
import { useSearch } from "@aksob/ui/hooks/search";
import { useQueries } from "@tanstack/react-query";
import type { ColumnFiltersState, Table } from "@tanstack/react-table";
import { getFacetedUniqueValues } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import type { Opportunity } from "@/app/opportunities/hooks/api/opportunities.functions";
import { opportunityQueries } from "@/app/opportunities/hooks/api/opportunities.queries";
import { opportunityStatusFilter } from "@/app/opportunities/utils/opportunity-status-filter";
import { opportunityTypeFilter } from "@/app/opportunities/utils/opportunity-type-filter";

type UseOpportunityFacetsValueArgs = {
	columnFilters: ColumnFiltersState;
};

export const useOpportunityFacetsValue = ({
	columnFilters,
}: UseOpportunityFacetsValueArgs) => {
	const { searchValue } = useSearch();
	const statusConditions = opportunityStatusFilter.toConditions(columnFilters);
	const typeConditions = opportunityTypeFilter.toConditions(columnFilters);

	const facetQueries = useQueries({
		queries: [
			...opportunityStatusFilter
				.facetQueries({
					searchValue,
					otherFilters: typeConditions,
				})
				.map((query) => opportunityQueries.list(query)),
			...opportunityTypeFilter
				.facetQueries({
					searchValue,
					otherFilters: statusConditions,
				})
				.map((query) => opportunityQueries.list(query)),
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
						columnId: opportunityStatusFilter.id,
						options: opportunityStatusFilter.options,
					},
					{
						columnId: opportunityTypeFilter.id,
						options: opportunityTypeFilter.options,
					},
				],
				facetQueries,
			),
		[facetQueries],
	);

	const getServerFacetedUniqueValues = useCallback(
		(_: Table<Opportunity>, columnId: string) => () =>
			facetCountsMap.get(columnId) ?? new Map<string, number>(),
		[facetCountsMap],
	);

	const getCoreFacetedUniqueValues = useMemo(
		() => getFacetedUniqueValues<Opportunity>(),
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
