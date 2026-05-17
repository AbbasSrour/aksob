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
import { researchDataTableColumns } from "@/app/research/components/list/research-data-table-columns";
import type { Research } from "@/app/research/hooks/api/research.functions";
import { researchQueries } from "@/app/research/hooks/api/research.queries";
import { useResearchFacetsValue } from "@/app/research/hooks/research-facets-value";
import { researchTypeFilter } from "@/app/research/utils/research-type-filter";
import { researchStatusFilter } from "@/app/research/utils/research-status-filter";
import { m } from "@/paraglide/messages";

export function ResearchDataTable() {
	const [rowSelection, setRowSelection] = useState({});
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const { sorting, setSorting, sortValue } = useSort();
	const { searchValue } = useSearch();
	const { columnFilters, setColumnFilters } = useFilters([
		researchTypeFilter,
		researchStatusFilter,
	]);
	const { pagination, setPagination } = usePagination({}, [
		searchValue,
		columnFilters,
		sorting,
	]);

	const statusConditions = researchStatusFilter.toConditions(columnFilters);
	const typeConditions = researchTypeFilter.toConditions(columnFilters);

	const { data } = useSuspenseQuery({
		...researchQueries.list({
			search: searchValue,
			...pagination,
			...sortValue,
			...statusConditions,
			...typeConditions,
		}),
	});

	const getServerFacetedUniqueValues = useResearchFacetsValue({
		columnFilters,
	});

	const table = useReactTable<Research>({
		data: (data?.data || []) as Array<Research>,
		columns: researchDataTableColumns,
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
				<DataTableToolbar placeholder={m.research_table_search_placeholder()}>
					<DataTableToolbarFilters>
						<DataTableFacetedFilter
							title={researchStatusFilter.title}
							columnId={researchStatusFilter.id}
							options={researchStatusFilter.options}
						/>
						<DataTableFacetedFilter
							title={researchTypeFilter.title}
							columnId={researchTypeFilter.id}
							options={researchTypeFilter.options}
						/>
					</DataTableToolbarFilters>
					<DataTableToolbarActions>
						<DataTableViewOptions />
					</DataTableToolbarActions>
				</DataTableToolbar>
				<DataTable<Research> />
				<DataTablePagination />
			</DataTableProvider>
		</ListSection>
	);
}
