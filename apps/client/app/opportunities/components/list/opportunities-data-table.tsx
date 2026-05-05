import { DataTable } from "@aksob/ui/components/data-table/data-table";
import { DataTableFacetedFilter } from "@aksob/ui/components/data-table/data-table-faceted-filter";
import { DataTablePagination } from "@aksob/ui/components/data-table/data-table-pagination";
import { DataTableProvider } from "@aksob/ui/components/data-table/data-table-provider";
import {
	DataTableToolbar,
	DataTableToolbarActions,
	DataTableToolbarFilters,
} from "@aksob/ui/components/data-table/data-table-toolbar";
import { DataTableViewOptions } from "@aksob/ui/components/data-table/data-table-view-options";
import { ListSection } from "@aksob/ui/components/layout/list-section";
import { usePagination } from "@aksob/ui/hooks/pagination";
import { useSearch } from "@aksob/ui/hooks/search";
import { useSort } from "@aksob/ui/hooks/sort";
import { useFilters } from "@aksob/ui/hooks/use-filters";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import { opportunitiesDataTableColumns } from "@/app/opportunities/components/list/opportunities-data-table-columns";
import type { Opportunity } from "@/app/opportunities/hooks/api/opportunities.functions";
import { opportunityQueries } from "@/app/opportunities/hooks/api/opportunities.queries";
import { useOpportunityFacetsValue } from "@/app/opportunities/hooks/opportunities-facets-value";
import { opportunityStatusFilter } from "@/app/opportunities/utils/opportunity-status-filter";
import { opportunityTypeFilter } from "@/app/opportunities/utils/opportunity-type-filter";

export function OpportunitiesDataTable() {
	const [rowSelection, setRowSelection] = useState({});
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const { sorting, setSorting, sortValue } = useSort();
	const { searchValue } = useSearch();
	const { columnFilters, setColumnFilters } = useFilters([
		opportunityTypeFilter,
		opportunityStatusFilter,
	]);
	const { pagination, setPagination } = usePagination({}, [
		searchValue,
		columnFilters,
		sorting,
	]);

	const statusConditions = opportunityStatusFilter.toConditions(columnFilters);
	const typeConditions = opportunityTypeFilter.toConditions(columnFilters);

	const { data } = useSuspenseQuery({
		...opportunityQueries.list({
			search: searchValue,
			...pagination,
			...sortValue,
			...statusConditions,
			...typeConditions,
		}),
	});

	const getServerFacetedUniqueValues = useOpportunityFacetsValue({
		columnFilters,
	});

	const table = useReactTable<Opportunity>({
		data: (data?.data || []) as Array<Opportunity>,
		columns: opportunitiesDataTableColumns,
		pageCount: data?.meta?.pageCount || 0,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		manualPagination: true,
		manualFiltering: true,
		enableRowSelection: false,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedUniqueValues: getServerFacetedUniqueValues(),
	});

	return (
		<ListSection>
			<DataTableProvider {...table}>
				<DataTableToolbar placeholder="Search opportunities...">
					<DataTableToolbarFilters>
						<DataTableFacetedFilter
							title={opportunityTypeFilter.title}
							columnId={opportunityTypeFilter.id}
							options={opportunityTypeFilter.options}
						/>
						<DataTableFacetedFilter
							title={opportunityStatusFilter.title}
							columnId={opportunityStatusFilter.id}
							options={opportunityStatusFilter.options}
						/>
					</DataTableToolbarFilters>
					<DataTableToolbarActions>
						<DataTableViewOptions />
					</DataTableToolbarActions>
				</DataTableToolbar>
				<DataTable<Opportunity> />
				<DataTablePagination />
			</DataTableProvider>
		</ListSection>
	);
}
