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
import { newsDataTableColumns } from "@/app/news/components/list/news-data-table-columns";
import type { NewsArticle } from "@/app/news/hooks/api/news.functions";
import { newsQueries } from "@/app/news/hooks/api/news.queries";
import { useNewsFacetsValue } from "@/app/news/hooks/news-facets-value";
import { newsStatusFilter } from "@/app/news/utils/news-status-filter";

export function NewsDataTable() {
	const [rowSelection, setRowSelection] = useState({});
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const { sorting, setSorting, sortValue } = useSort();
	const { searchValue } = useSearch();
	const { columnFilters, setColumnFilters } = useFilters([newsStatusFilter]);
	const { pagination, setPagination } = usePagination({}, [
		searchValue,
		columnFilters,
		sorting,
	]);

	const statusConditions = newsStatusFilter.toConditions(columnFilters);

	const { data } = useSuspenseQuery({
		...newsQueries.list({
			search: searchValue,
			...pagination,
			...sortValue,
			...statusConditions,
		}),
	});

	const getServerFacetedUniqueValues = useNewsFacetsValue({
		columnFilters,
	});

	const table = useReactTable<NewsArticle>({
		data: (data?.data || []) as Array<NewsArticle>,
		columns: newsDataTableColumns,
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
				<DataTableToolbar placeholder="Search articles...">
					<DataTableToolbarFilters>
						<DataTableFacetedFilter
							title={newsStatusFilter.title}
							columnId={newsStatusFilter.id}
							options={newsStatusFilter.options}
						/>
					</DataTableToolbarFilters>
					<DataTableToolbarActions>
						<DataTableViewOptions />
					</DataTableToolbarActions>
				</DataTableToolbar>
				<DataTable<NewsArticle> />
				<DataTablePagination />
			</DataTableProvider>
		</ListSection>
	);
}
