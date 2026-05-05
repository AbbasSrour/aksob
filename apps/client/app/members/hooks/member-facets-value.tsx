import { buildFacetCountsMap } from "@aksob/ui/components/data-table/utils/facets";
import { useSearch } from "@aksob/ui/hooks/search";
import { useQueries } from "@tanstack/react-query";
import type { ColumnFiltersState, Table } from "@tanstack/react-table";
import { getFacetedUniqueValues } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import { memberQueries } from "@/app/members/hooks/api/members.queries";
import type { MemberUser } from "@/app/members/utils/member-form-transformer";
import { memberStatusFilter } from "@/app/members/utils/member-status-filter";

type UseMemberFacetsValueArgs = {
	columnFilters: ColumnFiltersState;
};

export const useMemberFacetsValue = ({
	columnFilters: _columnFilters,
}: UseMemberFacetsValueArgs) => {
	const { searchValue } = useSearch();
	const roleConditions = { role: "user" as const };

	const facetQueries = useQueries({
		queries: [
			...memberStatusFilter
				.facetQueries({
					searchValue,
					otherFilters: roleConditions,
				})
				.map((query) => memberQueries.list(query)),
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
						columnId: memberStatusFilter.id,
						options: memberStatusFilter.options,
					},
				],
				facetQueries,
			),
		[facetQueries],
	);

	const getServerFacetedUniqueValues = useCallback(
		(_: Table<MemberUser>, columnId: string) => () =>
			facetCountsMap.get(columnId) ?? new Map<string, number>(),
		[facetCountsMap],
	);

	const getCoreFacetedUniqueValues = useMemo(
		() => getFacetedUniqueValues<MemberUser>(),
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
